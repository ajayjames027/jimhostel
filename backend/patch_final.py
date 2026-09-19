import os

app_file = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\backend\app.py'
with open(app_file, 'r', encoding='utf-8') as f:
    text = f.read()

bad_get_db = """def get_db():
    if 'db' not in g:
        from pymongo import MongoClient
        client = MongoClient("mongodb://localhost:27017/")
        g.db = client["jim_hostel"]
    return g.db"""

good_get_db = """from database import get_db as get_database
def get_db():
    return get_database()"""

if bad_get_db in text:
    text = text.replace(bad_get_db, good_get_db)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(text)
