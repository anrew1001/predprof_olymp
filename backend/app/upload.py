"""Upload router: POST /upload/test — accept .npz, run inference, return metrics."""
import io
from typing import Annotated, Any

import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.auth import require_user
from app.inference import get_model, predict_batch
from app.models import User

router = APIRouter(prefix="/upload", tags=["upload"])


# ── Pydantic schemas ───────────────────────────────────────────────────────────
class SampleResult(BaseModel):
    index: int
    true_label: int
    predicted_label: int
    confidence: float
    correct: bool


class TestResult(BaseModel):
    accuracy: float
    loss: float | None
    total_samples: int
    correct_samples: int
    per_sample: list[SampleResult]


# ── Helpers ────────────────────────────────────────────────────────────────────
def _compute_metrics(
    y_true: np.ndarray, raw_predictions: np.ndarray
) -> tuple[float, float | None, list[SampleResult]]:
    """Compute accuracy, optional cross-entropy loss, and per-sample results."""
    predicted_classes = np.argmax(raw_predictions, axis=1)
    correct_mask = predicted_classes == y_true
    accuracy = float(correct_mask.mean())

    # Cross-entropy loss if labels are valid class indices
    loss: float | None = None
    try:
        import tensorflow as tf  # noqa: PLC0415

        y_true_tensor = tf.cast(y_true, tf.int32)
        loss_tensor = tf.keras.losses.sparse_categorical_crossentropy(
            y_true_tensor, raw_predictions
        )
        loss = float(tf.reduce_mean(loss_tensor).numpy())
    except Exception:  # noqa: BLE001
        pass

    per_sample = [
        SampleResult(
            index=i,
            true_label=int(y_true[i]),
            predicted_label=int(predicted_classes[i]),
            confidence=float(raw_predictions[i, predicted_classes[i]]),
            correct=bool(correct_mask[i]),
        )
        for i in range(len(y_true))
    ]
    return accuracy, loss, per_sample


# ── Endpoints ──────────────────────────────────────────────────────────────────
@router.post("/test", response_model=TestResult)
async def upload_test(
    file: UploadFile = File(...),
    current_user: User = Depends(require_user),
) -> TestResult:
    """
    Accept a .npz file with keys:
      - 'X': float32 array (N, 128, 128, 1) — pre-processed mel spectrograms
      - 'y': int array   (N,) — true labels

    Returns accuracy, loss, and per-sample results.
    """
    model = get_model()
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded — place alien_classifier.h5 in backend/model/",
        )

    if not file.filename or not file.filename.endswith(".npz"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only .npz files are accepted",
        )

    contents = await file.read()
    try:
        npz = np.load(io.BytesIO(contents))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot read .npz file: {exc}",
        ) from exc

    if "X" not in npz or "y" not in npz:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=".npz must contain 'X' (features) and 'y' (labels) arrays",
        )

    X: np.ndarray = npz["X"].astype(np.float32)
    y: np.ndarray = npz["y"].astype(np.int32)

    if X.ndim != 4 or X.shape[1:] != (128, 128, 1):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"X must have shape (N, 128, 128, 1), got {X.shape}",
        )
    if y.ndim != 1 or len(X) != len(y):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="y must be 1-D with the same length as X",
        )

    raw_predictions = predict_batch(X)
    accuracy, loss, per_sample = _compute_metrics(y, raw_predictions)

    return TestResult(
        accuracy=accuracy,
        loss=loss,
        total_samples=len(y),
        correct_samples=sum(s.correct for s in per_sample),
        per_sample=per_sample,
    )
