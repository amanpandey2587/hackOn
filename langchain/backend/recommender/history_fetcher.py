import json
import os
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "dummy_watch_history.json"

def get_watch_history(user_id: str, streaming_service: str):
    with open(DATA_FILE, "r") as f:
        data = json.load(f)

    user_entries = [entry for entry in data if entry["userId"] == user_id]

    if streaming_service != "All":
        user_entries = [entry for entry in user_entries if entry.get("streamingService", "") == streaming_service]

    genre_count = {}
    completed_titles = []
    incomplete_titles = []
    platforms = set()

    for entry in user_entries:
        for g in entry.get("genre", []):
            genre_count[g] = genre_count.get(g, 0) + 1
        if entry.get("completed"):
            completed_titles.append(entry.get("title"))
        else:
            incomplete_titles.append(entry.get("title"))
        if entry.get("streamingService"):
            platforms.add(entry.get("streamingService"))

    summary = []
    if genre_count:
        summary.append("Preferred genres: " + ", ".join(sorted(genre_count, key=genre_count.get, reverse=True)))
    if completed_titles:
        summary.append("Completed: " + ", ".join(completed_titles))
    if incomplete_titles:
        summary.append("Left early: " + ", ".join(incomplete_titles))
    if platforms:
        summary.append("Watched mostly on: " + ", ".join(platforms))

    return summary
