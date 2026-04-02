from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.db.session import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()

    # Register reactive event handlers
    from src.orchestrator.event_bus import event_bus
    from src.orchestrator.reactive import register_all_handlers
    register_all_handlers(event_bus)

    # Start scheduler
    from src.orchestrator.scheduler import setup_scheduler
    setup_scheduler()

    yield

    # Shutdown
    from src.orchestrator.scheduler import scheduler
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Agent System — Marketing Department AI",
    description="AI-orchestrated marketing department with 8 agents, 48 skills, 6 playbooks",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
from src.api.routes import router
from src.api.dashboard import router as dashboard_router
from src.api.quick_post import router as quick_post_router
from src.api.marketing import router as marketing_router
from src.api.agents import router as agents_router
from src.api.social_poster import router as social_poster_router
app.include_router(router)
app.include_router(dashboard_router)
app.include_router(quick_post_router)
app.include_router(marketing_router)
app.include_router(agents_router)
app.include_router(social_poster_router)


# Serve generated images as static files
from fastapi.staticfiles import StaticFiles
from pathlib import Path
_images_dir = Path(__file__).parent.parent / "data" / "images"
_images_dir.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(_images_dir)), name="images")

# Serve generated videos as static files
_videos_dir = Path(__file__).parent.parent / "data" / "videos"
_videos_dir.mkdir(parents=True, exist_ok=True)
app.mount("/videos", StaticFiles(directory=str(_videos_dir)), name="videos")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
