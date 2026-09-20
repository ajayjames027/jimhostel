from app import app
with app.test_client() as c:
    import jwt
    import os
    token = jwt.encode({"user_id": "user_ad"}, os.getenv('JWT_SECRET', 'jim_hostel_secret_key_default'), algorithm="HS256")
    res1 = c.get('/api/students', headers={'Authorization': 'Bearer ' + token})
    res2 = c.get('/api/food-poll/2026-09-20', headers={'Authorization': 'Bearer ' + token})
    print("students status:", res1.status_code)
    print("poll status:", res2.status_code)
    if res2.status_code != 200:
        print(res2.get_data(as_text=True))
