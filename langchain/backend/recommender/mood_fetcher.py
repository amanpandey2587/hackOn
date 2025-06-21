def get_user_mood(user_id: str) -> str:
    # TODO: Replace this with real sentiment API call
    dummy_moods = ["happy", "sad", "neutral", "angry"]
    return dummy_moods[hash(user_id) % len(dummy_moods)]
# import requests

# # Simulated endpoint for fetching user mood
# MOOD_SERVICE_URL = "http://localhost:5000/mood"  # Replace with actual service URL

# def get_user_mood(user_id: str) -> str:
#     try:
#         response = requests.get(f"{MOOD_SERVICE_URL}?user_id={user_id}")
#         if response.status_code == 200:
#             data = response.json()
#             return data.get("mood", "neutral")
#         else:
#             return "neutral"
#     except Exception:
#         return "neutral"
