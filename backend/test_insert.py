import datetime
from database import get_db

try:
    db = get_db()
    
    current_user = {"name": "Test User", "role": "Admin"}
    data = {"message": "Testing..."}
    
    ann = {
        "message": data['message'],
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "author": current_user['name'],
        "author_role": current_user['role']
    }
    print("Dict configured successfully.")
    
    result = db["announcements"].insert_one(ann)
    print("Insert success.")
    print(str(result.inserted_id))
    
except Exception as e:
    import traceback
    traceback.print_exc()
