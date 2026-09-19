from pymongo import MongoClient

def inject_missing():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["jim_hostel"]
    
    # 1. Update B7 Occupancy to 4
    db["rooms"].update_one(
        {"_id": "B7"},
        {"$set": {"occupied": 4, "available_beds": 0}},
        upsert=True
    )
    
    # 2. Add 4 students to B7
    students_b7 = [
        ("JIM2620101", "26MBA101", "Aakash V", "B7", "I MBA", "Business Administration", "9000000001"),
        ("JIM2620102", "26MBA102", "Bharath K", "B7", "I MBA", "Business Administration", "9000000002"),
        ("JIM2620103", "26MBA103", "Deeraj M", "B7", "I MBA", "Business Administration", "9000000003"),
        ("JIM2620104", "26MBA104", "Hari P", "B7", "I MBA", "Business Administration", "9000000004"),
    ]
    
    for s_id, reg, name, room, course, dept, mob in students_b7:
        if not db["students"].find_one({"_id": s_id}):
            db["students"].insert_one({
                "_id": s_id,
                "register_number": reg,
                "name": name,
                "course": course,
                "year": "1st Year",
                "department": dept,
                "room_number": room,
                "mobile": mob,
                "parent_mobile": "9999999999",
                "email": f"{name.split()[0].lower()}@jim.edu.in",
                "photo": "",
                "hostel_name": "JIM Boys Hostel",
                "block": "Toulouse Arena",
                "status": "Active",
                "attendance_percentage": 100.0,
                "last_attendance": "None"
            })
            print(f"Added {name} to {room}")

if __name__ == "__main__":
    inject_missing()
