"""Uvicorn launcher with ProactorEventLoop fix for Windows.

uvicorn 0.36+ uses loop_factory parameter in asyncio.run() which bypasses
set_event_loop_policy(). Its default factory returns SelectorEventLoop on
Windows, which does NOT support subprocess spawning — breaking
claude_agent_sdk (which shells out to claude.exe via anyio.open_process).

This script patches uvicorn's loop factory to always return
ProactorEventLoop on Windows before starting the server.
"""
from __future__ import annotations

import asyncio
import sys

if sys.platform == "win32":
    import uvicorn.loops.asyncio as _uva_asyncio
    import uvicorn.loops.auto as _uva_auto

    def _proactor_factory(use_subprocess: bool = False):
        return asyncio.ProactorEventLoop

    _uva_asyncio.asyncio_loop_factory = _proactor_factory
    _uva_auto.auto_loop_factory = _proactor_factory

import os
import uvicorn

if __name__ == "__main__":
    # Force unbuffered output so logs appear in real-time when redirected to file
    os.environ.setdefault("PYTHONUNBUFFERED", "1")
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8939,
    )
