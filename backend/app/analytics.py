"""Analytics router: reads pre-generated JSON files from backend/data/."""
import json
import logging
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import require_user
from app.models import User

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def _read_json(filename: str) -> Any:
    path = _DATA_DIR / filename
    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analytics data '{filename}' not yet available. Train the model first.",
        )
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse %s: %s", path, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Malformed analytics file: {filename}",
        ) from exc


@router.get("/training-history")
def get_training_history(
    current_user: User = Depends(require_user),
) -> Any:
    """Return training/validation loss and accuracy per epoch."""
    return _read_json("training_history.json")


@router.get("/class-distribution")
def get_class_distribution(
    current_user: User = Depends(require_user),
) -> Any:
    """Return number of samples per class in the dataset."""
    return _read_json("class_distribution.json")


@router.get("/top5-validation")
def get_top5_validation(
    current_user: User = Depends(require_user),
) -> Any:
    """Return top-5 validation accuracy metrics."""
    return _read_json("top5_validation.json")
