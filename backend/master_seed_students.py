from pymongo import MongoClient

data = """A1	II MBA	DARWIN INFANT RAAJ P
A1	II MBA	JASON HANSEL SAMUEL J
A1	II MBA	SANJEEV KUMAR
A1	II MBA	VISHWANATHAN I
A1	II MBA	ABISHAK RAJ S
A1	II MBA	PRAVEENRAJ R
A2	II MBA	DICKSON D
A2	II MBA	DANIEL A
A2	II MBA	NITHISH M
A2	II MBA	JANICK ANTO
A2	II MBA	ANTO JEFFIN J
A2	II MBA	ARMEL
A3	II MBA	MILAN SHIJOE J
A3	II MBA	AKILAN SEBASTIN V
A3	II MBA	RENO SINGAR X
A3	II MBA	VENKATESHWAR
A3	II MBA	HARI SANKARAN R
A3	II MBA	VALAN J
A4	II MBA	YUVARAJAN R A
A4	II MBA	RUBAN A
A4	II MBA	SUNIL SANGEETH J
A4	II MBA	ROBIN J
A4	II MBA	GODWINGINUS A
A4	II MBA	ASWIN R
A5	II MBA	JAVANSKER J
A5	II MBA	TENNIS DASS M
A5	II MBA	GABRIEL THANGAM SEBASTIAN
A5	II MBA	VELANGANNI SELVARAJ S
A5	II MBA	ANTONY GNANA AAKASH A
A5	II MBA	JEGAN A
A6	II MBA	INFANT TOM F
A6	II MBA	RUBANRAJ G
A6	II MBA	ROSHAN J
A6	II MBA	REJI JEGAN V
A6	II MBA	JINOSOBAN M
A6	II MBA	SUDHARSAN REDDY R
B1	II MBA	KISHORE KUMAR V
B1	II MBA	KEVIN JOSHVA S
B1	II MBA	ABITHEJ P
B1	II MBA	GAJA BALAJI
B1	II MBA	SUJET RAJA S
B1	II MBA	PRAVIN PON
B2	I MBA	NIVONE PRABAKARAN A
B2	I MBA	PRAVEEN KUMAR S
B2	I MBA	SUJITH J
B2	I MBA	ESTAN J
B2	I MBA	GOKUL V
B2	I MBA	THOMAS DANIEL S
B3	I MBA	HARISH RAGAVENDRA G
B3	I MBA	ROSHAN J
B3	I MBA	SARON TONI SELVAN U
B3	I MBA	M NAVEEN PRASAD
B3	I MBA	PREMKALYAAN V
B3	I MBA	ALEX A
B4	I MBA	GOPI S
B4	I MBA	S ASWIN
B4	I MBA	ALEXIN PIO S
B4	I MBA	ANTO BRIGHTEN J
B4	I MBA	Engine Britto
B4	I MBA	Tharun
B4	I MBA	SUBASHCHANDRABOSE S
B4	I MBA	LEONI RAJA SINGH D
B5	II MBA	JANARIUS
B5	II MBA	EDISON
B5	II MBA	JACK FERNANDEZ
B5	I MBA	AADHAVAN
B6	I MBA	ANTO ABINESH V
B6	I MBA	JOE CANICE VALAN E
B6	I MBA	MOVIN RAJ I
B6	I MBA	Danial
B6	I MBA	Sarath
B7	I MBA	DEEPAK XAVIER S
B7	I MBA	JONES HARISH P
B7	I MBA	V R JUDE MICHAEL
B7	I MBA	LEOMARAN P
B7	I MBA	HARIPRAKASH B
B7	I MBA	Dominic Seril
B7	I MBA	John Joemics
B7	I MBA	Naresh 
B8	I MBA	DANIAL J
B8	I MBA	JAI BALAJEE G
B8	I MBA	JIFFIN JUDE A
B8	I MBA	ALVIS JOY A
B8	I MBA	Ruban"""

def master_seed():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["jim_hostel"]
    
    # Optional: Wipe students and rooms cleanly to prevent duplicates/ghost data
    db["students"].delete_many({})
    db["rooms"].delete_many({})
    
    lines = data.strip().split('\n')
    room_counts = {}
    students = []
    
    for idx, line in enumerate(lines):
        if not line.strip(): continue
        parts = line.split('\t')
        if len(parts) < 3: continue
        
        room = parts[0].strip()
        course = parts[1].strip()
        name = parts[2].strip()
        
        room_counts[room] = room_counts.get(room, 0) + 1
        
        students.append({
            "_id": f"JIM_{room}_{idx:03d}",
            "register_number": f"REG_{room}_{idx:03d}",
            "name": name,
            "course": course,
            "year": "2nd Year" if "II" in course else "1st Year",
            "department": "Business Administration",
            "room_number": room,
            "mobile": "9000000000",
            "parent_mobile": "9999999999",
            "email": f"{name.split()[0].lower()}@jim.edu.in",
            "photo": "",
            "hostel_name": "JIM Boys Hostel",
            "block": "Toulouse Arena",
            "status": "Active",
            "attendance_percentage": 100.0,
            "last_attendance": "None"
        })
        
    db["students"].insert_many(students)
    print(f"Inserted {len(students)} students.")
    
    # Create rooms with exact capacities
    room_docs = []
    for room, count in room_counts.items():
        room_docs.append({
            "_id": room,
            "block": "Toulouse Arena",
            "floor": 1 if room.startswith('A') else 2,
            "capacity": count,
            "occupied": count,
            "available_beds": 0
        })
        
    db["rooms"].insert_many(room_docs)
    print(f"Created {len(room_docs)} rooms based on accurate list counts.")

if __name__ == "__main__":
    master_seed()
