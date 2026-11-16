# LinkedIn_Auto_Bot

A Python bot that uses Google Gemini to generate LinkedIn posts, stores them in a local database, and posts them on a schedule. It also includes a FastAPI backend and a Next.js web UI.

## What it does

- Generates a batch of posts for a number of days from a context file (`context.txt`) using Gemini.
- Generates post ideas for a topic and generates images from a prompt.
- Stores posts in a SQLite database (SQLAlchemy) with a status of pending, posted or failed.
- Runs a scheduler that checks every minute for due, pending posts and sends them to LinkedIn.
- Exposes a FastAPI app with endpoints `GET /`, `POST /generate`, `POST /generate-ideas`, `POST /schedule` and `POST /generate-image`.
- Includes a Next.js UI in `web/` with a carousel editor, quote generator and ideas generator.

## Tech stack

- Python 3.11, google-generativeai, SQLAlchemy, schedule, FastAPI, uvicorn, Pillow
- Next.js, React and TypeScript for the web UI
- Docker and Docker Compose for the bot service

## Folder layout

- `src/` - CLI entry point, content generator, database model, LinkedIn client, scheduler
- `api/` - FastAPI app
- `web/` - Next.js UI
- `context.txt` - topics, audience and tone used for generation
- `aiCarousels_Feature_Analysis.md` - notes on a third-party carousel product
- `Dockerfile`, `docker-compose.yml` - container setup

## Install and run

Bot:

```bash
pip install -r requirements.txt
cp .env.example .env
python src/main.py generate --days 7 --context context.txt
python src/main.py run
```

Docker: `docker compose up --build`

API: `uvicorn api.main:app` (its CORS setting allows `http://localhost:3000`).

Web UI:

```bash
cd web
pnpm install
pnpm run dev
```

## Environment variables

From `.env.example`: `GEMINI_API_KEY`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_PERSON_URN`, `TIMEZONE`, `POST_TIME`. The code also reads an optional `DATABASE_URL` (default `sqlite:///data/posts.db`).

## Status

Early prototype. The LinkedIn client in `src/linkedin_client.py` is a skeleton: without an access token it only prints the post (dry run), and the real posting calls are not implemented yet.
