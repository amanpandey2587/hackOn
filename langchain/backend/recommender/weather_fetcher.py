import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
CITY = "Delhi"  # You can change this based on user location if needed

def get_weather():
    if not API_KEY:
        return "Unknown (no API key)"
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()
        weather = data["weather"][0]["main"]
        temperature = data["main"]["temp"]
        return f"{weather}, {temperature}°C"
    except Exception as e:
        return f"Weather fetch failed: {str(e)}"
