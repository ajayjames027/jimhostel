import datetime
from database import get_db
import json
from bson import json_util

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
    
    result = db["announcements"].insert_one(ann)
    ann["_id"] = str(result.inserted_id)
    
    from flask import Flask, jsonify
    app = Flask(__name__)
    with app.app_context():
        print(jsonify(ann).get_data(as_text=True))
    
except Exception as e:
    import traceback
    traceback.print_exc()
