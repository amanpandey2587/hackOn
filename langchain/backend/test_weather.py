import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")  # should be from openweathermap
city = "Delhi"

url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"

response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    temp = data["main"]["temp"]
    condition = data["weather"][0]["main"]
    print(f"✅ Weather in {city}: {condition}, {temp}°C")
else:
    print("❌ Weather API error:", response.status_code, response.text)
