"""Model inference: load .h5, preprocess audio, predict."""
import logging
import warnings
from pathlib import Path
from typing import Any, Optional

import numpy as np

logger = logging.getLogger(__name__)

# Suppress TF/librosa warnings during import
warnings.filterwarnings("ignore")

_MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "alien_classifier.h5"
_model: Optional[Any] = None  # loaded lazily or at startup


def load_model() -> None:
    """Load the Keras model from disk. Call this at app startup."""
    global _model
    if not _MODEL_PATH.exists():
        logger.warning(
            "Model file not found at %s — inference endpoints will be unavailable.",
            _MODEL_PATH,
        )
        return
    try:
        import tensorflow as tf  # noqa: PLC0415

        _model = tf.keras.models.load_model(str(_MODEL_PATH))
        logger.info("Model loaded from %s", _MODEL_PATH)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to load model: %s", exc)
        _model = None


def get_model() -> Optional[Any]:
    return _model


def preprocess_raw(audio: np.ndarray) -> np.ndarray:
    """
    Preprocess a single raw audio waveform (shape (80000,) or (80000,1) float32)
    into a mel spectrogram matching the trained model input: (64, 128, 1).

    Pipeline:
      1. squeeze to 1-D
      2. mel spectrogram (sr=16000, n_mels=64, n_fft=1024, hop_length=256, fmax=8000)
      3. power_to_db
      4. resize to (64, 128)
      5. z-score normalize
    """
    import librosa  # noqa: PLC0415
    import tensorflow as tf  # noqa: PLC0415

    audio = audio.squeeze().astype(np.float32)
    mel = librosa.feature.melspectrogram(
        y=audio, sr=16000, n_mels=64, n_fft=1024, hop_length=256, fmax=8000
    )
    mel_db = librosa.power_to_db(mel, ref=np.max)
    mel_resized = tf.image.resize(mel_db[..., np.newaxis], (64, 128))
    arr = mel_resized.numpy()
    mel_norm = (arr - arr.mean()) / (arr.std() + 1e-6)
    return mel_norm.astype(np.float32)


def preprocess_batch(raw_batch: np.ndarray) -> np.ndarray:
    """
    Preprocess a batch of raw audio signals.
    raw_batch: (N, 80000, 1) or (N, 80000) float32
    Returns: (N, 64, 128, 1) float32
    """
    return np.stack([preprocess_raw(raw_batch[i]) for i in range(len(raw_batch))])


def predict_batch(features: np.ndarray) -> np.ndarray:
    """
    Run inference on a batch of pre-processed features.
    features: ndarray of shape (N, 64, 128, 1)
    Returns: ndarray of shape (N, num_classes) with probabilities.
    """
    model = get_model()
    if model is None:
        raise RuntimeError("Model is not loaded")
    predictions = model.predict(features, verbose=0)  # (N, num_classes)
    return predictions
