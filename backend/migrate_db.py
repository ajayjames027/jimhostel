import os
import json
from pymongo import MongoClient

def migrate_from_mock():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(backend_dir, "data")
    
    print("Connecting to Production Atlas...")
    atlas_client = MongoClient("mongodb+srv://admin:admin123@cluster0.ixnibxv.mongodb.net/?retryWrites=true&w=majority", serverSelectionTimeoutMS=10000)
    
    try:
        atlas_client.admin.command('ping')
        print("Connected to Atlas successfully!")
    except Exception as e:
        print(f"FATAL: Atlas connection failed. Did you allow IP 0.0.0.0/0? Error: {e}")
        return
        
    atlas_db = atlas_client["jim_hostel"]
    
    for filename in os.listdir(data_dir):
        if filename.endswith(".json"):
            coll_name = filename[:-5]
            file_path = os.path.join(data_dir, filename)
            
            with open(file_path, 'r') as f:
                try:
                    data = json.load(f)
                except Exception:
                    data = []
                    
            if data:
                print(f"Migrating {len(data)} documents to collection '{coll_name}'...")
                atlas_db[coll_name].delete_many({})
                atlas_db[coll_name].insert_many(data)
                
    print("Migration from JSON mock database to Atlas 100% complete!")

if __name__ == "__main__":
    migrate_from_mock()
