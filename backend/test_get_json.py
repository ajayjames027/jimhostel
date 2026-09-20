from app import app
from database import get_db

with app.test_client() as c:
    # Need auth token, but we can bypass or just fake a token?
    # Actually, token_required will block 401 if missing. 
    # Let me just see if the code for GET crashes on ObjectId independently!
    
    db = get_db()
    ann_list = list(db["announcements"].find().sort([("timestamp", -1)]))
    try:
        from flask import jsonify
        with app.app_context():
            print(jsonify(ann_list).get_data(as_text=True))
    except Exception as e:
        import traceback
        traceback.print_exc()
