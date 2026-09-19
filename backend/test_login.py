from database import get_db

def test():
    db = get_db()
    room, fname = ("b2", "nivone")
    students_in_room = list(db["students"].find({"room_number": {"$regex": f"^{room}$", "$options": "i"}}))
    print("Found students in room:", len(students_in_room))
    if students_in_room:
        for s in students_in_room:
            print("Student Name in db:", s['name'], "-> splitted:", s['name'].split()[0].lower())
            
    student = next((s for s in students_in_room if s['name'].split()[0].lower() == fname.lower()), None)
    print("Matched Student:", student)

if __name__ == "__main__":
    test()
