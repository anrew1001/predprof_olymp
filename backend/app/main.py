"""FastAPI application entry point with lifespan, CORS, and router registration."""
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, engine
from app.models import Base, User
from app.auth import hash_password
import app.inference as inference_module

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def _seed_admin() -> None:
    """Create the default admin user if it doesn't exist yet."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.login == "admin").first()
        if existing is None:
            admin = User(
                first_name="Admin",
                last_name="System",
                login="admin",
                password_hash=hash_password("admin"),
                role="admin",
            )
            db.add(admin)
            db.commit()
            logger.info("Seeded admin user (login='admin')")
        else:
            logger.info("Admin user already exists — skipping seed")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("Creating database tables…")
    Base.metadata.create_all(bind=engine)

    logger.info("Seeding admin user…")
    _seed_admin()

    logger.info("Loading ML model…")
    inference_module.load_model()

    yield  # application runs here

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("Shutting down…")


app = FastAPI(
    title="Alien Classifier API",
    version="1.0.0",
    description="Backend for the predprof olympiad alien sound classifier",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
from app.auth import router as auth_router       # noqa: E402
from app.admin import router as admin_router     # noqa: E402
from app.upload import router as upload_router   # noqa: E402
from app.analytics import router as analytics_router  # noqa: E402

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(upload_router)
app.include_router(analytics_router)


@app.get("/", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "service": "alien-classifier-api"}
