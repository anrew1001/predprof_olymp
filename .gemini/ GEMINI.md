# МПОШ Alien Signal Classifier

Olympiad project: custom CNN for alien radio signal classification + web app with auth & analytics.
Competition: Moscow Pre-Professional Olympiad, Product Sector, IT, Final Stage. Time: 4-5 hours.

## Tech Stack

- **ML**: Python 3.11+, TensorFlow 2.21 / Keras 3, librosa, numpy, scikit-learn
- **Backend**: FastAPI, SQLAlchemy, SQLite, python-jose (JWT), passlib (bcrypt)
- **Frontend**: React 19 + TypeScript, Vite, Chart.js (react-chartjs-2 + chartjs-plugin-zoom)
- **Testing**: pytest (backend), vitest (frontend)

## Architecture

- `backend/app/` — FastAPI (main, database, models, auth, admin, inference, upload, analytics)
- `backend/model/alien_classifier.h5` — trained CNN
- `backend/data/` — training_history.json, class_distribution.json, top5_validation.json
- `frontend/src/pages/` — Login, Admin, Profile, Dashboard
- `frontend/src/components/` — 4 chart components
- `notebooks/train_model.ipynb` — ML pipeline
- `db/app.db` — SQLite (must persist across restarts)

## Commands

- Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
- Frontend: `cd frontend && npm install && npm run dev`
- Tests: `cd backend && pytest tests/ -v` / `cd frontend && npx vitest run`

## Critical Rules

1. **Label recovery**: train_y has corrupted strings. Sort unique → map to 0..N-1. Same mapping for valid_y.
2. **Custom CNN only** — NO pretrained models. Forbidden by rules.
3. **Two roles**: admin (create users only), user (upload NPZ, view analytics). SQLite.
4. **4 required charts** (all with zoom): val_accuracy vs epochs (line), class distribution in train (bar), per-sample accuracy on test (bar), top-5 classes in validation (bar).
5. **DB persistence** — jury restarts app, checks users survive.
6. **Model format**: .h5
7. **NPZ arrays**: train_x, train_y, valid_x, valid_y / test_x, test_y

## When Compacting

Preserve: API endpoint list, 4 required charts, label recovery logic, test commands, file paths.