from pymongo import MongoClient

def fix_b7():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["jim_hostel"]
    
    # 1. Update B7 Capacity to 8, Occupancy to 8
    db["rooms"].update_one(
        {"_id": "B7"},
        {"$set": {"capacity": 8, "occupied": 8, "available_beds": 0}},
        upsert=True
    )
    
    # 2. Delete dummy students I created earlier
    dummies = ["JIM2620101", "JIM2620102", "JIM2620103", "JIM2620104"]
    db["students"].delete_many({"_id": {"$in": dummies}})
    
    # 3. Add 8 real students to B7
    real_b7 = [
        ("JIM2620110", "26MBA110", "DEEPAK XAVIER S", "B7", "I MBA", "Business Administration", "9000000110"),
        ("JIM2620111", "26MBA111", "JONES HARISH P", "B7", "I MBA", "Business Administration", "9000000111"),
        ("JIM2620112", "26MBA112", "V R JUDE MICHAEL", "B7", "I MBA", "Business Administration", "9000000112"),
        ("JIM2620113", "26MBA113", "LEOMARAN P", "B7", "I MBA", "Business Administration", "9000000113"),
        ("JIM2620114", "26MBA114", "HARIPRAKASH B", "B7", "I MBA", "Business Administration", "9000000114"),
        ("JIM2620115", "26MBA115", "Dominic Seril", "B7", "I MBA", "Business Administration", "9000000115"),
        ("JIM2620116", "26MBA116", "John Joemics", "B7", "I MBA", "Business Administration", "9000000116"),
        ("JIM2620117", "26MBA117", "Naresh", "B7", "I MBA", "Business Administration", "9000000117"),
    ]
    
    for s_id, reg, name, room, course, dept, mob in real_b7:
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
    fix_b7()
