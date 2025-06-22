# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os

# load_dotenv()

# MONGO_URI = os.getenv("MONGODB_URI")

# try:
#     client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
#     client.server_info()  # Force connection on a request as the
#     print("✅ Connected to MongoDB Atlas!")
    
#     db = client["watchparty"]  # Your DB name
#     watch_history_collection = db["watchhistories"]  # Your collection

# except Exception as e:
#     print("❌ Failed to connect to MongoDB Atlas.")
#     print("Error:", e)
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def get_mongo_client():
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    return MongoClient(uri)
