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


def preprocess(wav_path: str) -> np.ndarray:
    """
    Convert a WAV file → mel spectrogram → resize 128×128 → normalize [0,1].
    Returns ndarray of shape (128, 128, 1).
    """
    import librosa  # noqa: PLC0415
    import tensorflow as tf  # noqa: PLC0415

    y, sr = librosa.load(wav_path, sr=22050, mono=True)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Resize to (128, 128) using TF
    mel_tensor = tf.constant(mel_db[np.newaxis, :, :, np.newaxis], dtype=tf.float32)
    resized = tf.image.resize(mel_tensor, [128, 128]).numpy()[0]  # (128, 128, 1)

    # Normalize to [0, 1]
    min_val, max_val = resized.min(), resized.max()
    if max_val != min_val:
        resized = (resized - min_val) / (max_val - min_val)
    else:
        resized = np.zeros_like(resized)

    return resized.astype(np.float32)


def predict_batch(features: np.ndarray) -> np.ndarray:
    """
    Run inference on a batch of pre-processed features.
    features: ndarray of shape (N, 128, 128, 1)
    Returns: ndarray of shape (N,) with predicted class indices.
    """
    model = get_model()
    if model is None:
        raise RuntimeError("Model is not loaded")
    predictions = model.predict(features, verbose=0)  # (N, num_classes)
    return predictions
