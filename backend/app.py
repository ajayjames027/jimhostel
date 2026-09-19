import os
import io
import datetime
import jwt
import bcrypt
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv

from database import get_db
from reports_generator import generate_pdf_report, generate_excel_report

load_dotenv()

app = Flask(__name__)

@app.route('/health')
def health():
    return{"status": "ok"}
# Enable CORS for frontend communications
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JWT_SECRET'] = os.getenv("JWT_SECRET", "jim_hostel_secret_key_default")

# =====================================================================
# HELPER DECORATORS
# =====================================================================

def token_required(f):
    def decorator(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Access token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=["HS256"])
            db = get_db()
            current_user = db["users"].find_one({"_id": data["user_id"]})
            if not current_user:
                student = db["students"].find_one({"_id": data["user_id"]})
                if student:
                    current_user = {
                        "_id": student["_id"],
                        "username": student["_id"],
                        "role": "Student",
                        "name": student["name"]
                    }
            if not current_user:
                return jsonify({'message': 'Invalid token, user not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(current_user, *args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator

def roles_required(*roles):
    def wrapper(f):
        def decorator(current_user, *args, **kwargs):
            if current_user.get('role') not in roles:
                return jsonify({'message': 'Permission denied! Unauthorized role.'}), 403
            return f(current_user, *args, **kwargs)
        decorator.__name__ = f.__name__
        return decorator
    return wrapper

data_seed = """A1	II MBA	DARWIN INFANT RAAJ P
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

@app.route('/api/seed-now', methods=['GET'])
def seed_now():
    db = get_db()
    db["students"].delete_many({})
    db["rooms"].delete_many({})
    
    lines = data_seed.strip().split('\n')
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
            "_id": f"{room}_{name.split()[0].lower()}",
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
        
    for s in students:
        db["students"].insert_one(s)
        
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
        
    for r in room_docs:
        db["rooms"].insert_one(r)
    return jsonify({"message": f"Seeded {len(students)} students and {len(room_docs)} rooms!"})

@app.route('/api/generate-manual', methods=['GET'])
def generate_manual_endpoint():
    db = get_db()
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    
    doc = SimpleDocTemplate("Student_Portal_Manual.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle('MainTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor('#1E3A8A'), alignment=1, spaceAfter=20)
    sub_title_style = ParagraphStyle('SubTitle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#2563EB'), spaceBefore=15, spaceAfter=10)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=16, spaceAfter=10)
    bold_style = ParagraphStyle('BoldBody', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=16, spaceAfter=10)
    
    story = []
    
    story.append(Paragraph("JIM Boys Hostel - Student Portal Manual", title_style))
    story.append(Paragraph("Welcome to the new digital management system for JIM Boys Hostel! This platform simplifies your daily interactions.", body_style))
    
    story.append(Paragraph("1. How to Login", sub_title_style))
    story.append(Paragraph("<b>URL:</b> Access the portal link shared by your AD on your phone.", body_style))
    story.append(Paragraph("<b>Username Format:</b> roomnumber_firstname (Use Lowercase)", body_style))
    story.append(Paragraph("<b>Default Global Password:</b> jim123", bold_style))
    
    story.append(Paragraph("2. Mess Food Polling (Important)", sub_title_style))
    story.append(Paragraph("For weekends or long holidays, the AD will launch a 'Multi-Day Food Poll'. Tap the meal icons and submit to lock in your count.", body_style))
    
    story.append(Paragraph("3. Applying for Leave & Maintenance", sub_title_style))
    story.append(Paragraph("- You can apply for leaves directly triggering a WhatsApp automation.", body_style))
    story.append(Paragraph("- You can lodge maintenance complaints securely.", body_style))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("APPENDIX: Complete Username Roster", title_style))
    
    students = list(db["students"].find().sort([("room_number", 1), ("name", 1)]))
    table_data = [["Room", "Student Name", "Official Log-In Username"]]
    
    for s in students:
        room = str(s.get('room_number', ''))
        name = str(s.get('name', ''))
        first_name = name.split()[0].lower() if name else ""
        username = f"{room.lower()}_{first_name}"
        table_data.append([room, name, username])
    
    t = Table(table_data, colWidths=[60, 200, 160])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
    ]))
    
    story.append(t)
    doc.build(story)
    
    return jsonify({"message": "PDF Created"})

def log_action(user_id, username, action, details):
    db = get_db()
    log_doc = {
        "_id": str(datetime.datetime.utcnow().timestamp()),
        "user_id": user_id,
        "username": username,
        "action": action,
        "details": details,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    db["audit_logs"].insert_one(log_doc)

def check_continuous_absences(student_id, student_name, room_number):
    """
    Check if the student has been absent for 3, 5, or 7 consecutive checks.
    Create a notification/alert if so.
    """
    db = get_db()
    # Find last 7 attendance records for the student, sorted by date/time
    records = list(db["attendance"].find({"student_id": student_id}).sort("timestamp", -1).limit(7))
    
    consecutive_absents = 0
    for r in records:
        if r["status"] == "Absent":
            consecutive_absents += 1
        elif r["status"] == "Leave":
            # Leave doesn't break or count as absent, we just skip it
            continue
        else:
            # Present or Late breaks the consecutive absence streak
            break

    if consecutive_absents in [3, 5, 7]:
        level = "Warning" if consecutive_absents == 3 else "High Risk"
        title = f"Continuous Absence Alert: {consecutive_absents} Days"
        msg = f"Student {student_name} (Room {room_number}) has been absent for {consecutive_absents} consecutive checks."
        
        # Avoid duplicate alerts for the same count
        alert_id = f"alert_{student_id}_{consecutive_absents}_{datetime.date.today().isoformat()}"
        existing = db["notifications"].find_one({"_id": alert_id})
        if not existing:
            alert_doc = {
                "_id": alert_id,
                "student_id": student_id,
                "title": title,
                "message": msg,
                "type": "SMS/Email Triggered",
                "status": "Unread",
                "level": level,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            db["notifications"].insert_one(alert_doc)
            print(f"ALERT CREATED: {title} for {student_name}")

def update_student_attendance_percentage(student_id):
    db = get_db()
    total_att = db["attendance"].count_documents({"student_id": student_id})
    leaves = db["attendance"].count_documents({"student_id": student_id, "status": "Leave"})
    presents = db["attendance"].count_documents({"student_id": student_id, "status": {"$in": ["Present", "Late Entry"]}})
    
    denom = total_att - leaves
    percentage = 100.0
    if denom > 0:
        percentage = round((presents / denom) * 100, 1)
        
    last_att_doc = list(db["attendance"].find({"student_id": student_id}).sort("timestamp", -1).limit(1))
    last_att_status = last_att_doc[0]["status"] if last_att_doc else "None"
    
    db["students"].update_one(
        {"_id": student_id},
        {"$set": {
            "attendance_percentage": percentage,
            "last_attendance": last_att_status
        }}
    )


@app.route('/api/maintenance', methods=['GET', 'POST'])
@token_required
def handle_maintenance(current_user):
    db = get_db()
    if request.method == 'POST':
        data = request.json
        doc = {
            "_id": str(datetime.datetime.utcnow().timestamp()),
            "student_id": data.get("student_id"),
            "name": current_user.get("name"),
            "room_number": data.get("room_number"),
            "issue": data.get("issue"),
            "description": data.get("description"),
            "photo_data": data.get("photo_data", ""),
            "status": "Pending",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        db["maintenance"].insert_one(doc)
        return jsonify({"message": "Maintenance issue reported."})
    else:
        # GET
        if current_user.get("role") in ["AD", "Admin", "Director"]:
            issues = list(db["maintenance"].find().sort("timestamp", -1))
        else:
            issues = list(db["maintenance"].find({"student_id": current_user["_id"]}).sort("timestamp", -1))
        return jsonify(issues)


@app.route('/api/maintenance/<issue_id>', methods=['DELETE'])
@token_required
@roles_required('Admin')
def delete_maintenance(current_user, issue_id):
    db = get_db()
    db["maintenance"].delete_one({"_id": issue_id})
    return jsonify({"message": "Maintenance request deleted."})

@app.route('/api/maintenance/<issue_id>', methods=['PUT'])
@token_required
def update_maintenance(current_user, issue_id):
    if current_user.get("role") not in ["AD", "Admin", "Director"]:
        return jsonify({"message": "Unauthorized"}), 403
    db = get_db()
    data = request.json
    db["maintenance"].update_one({"_id": issue_id}, {"$set": {"status": data.get("status")}})
    return jsonify({"message": "Status updated."})

@app.route('/api/reports/food-poll/<date>', methods=['GET'])
@token_required
def download_food_poll_report(current_user, date):
    db = get_db()
    # Join with student to get names
    students = list(db["students"].find())
    stud_dict = {s["_id"]: s["name"] for s in students}
    
    poll_records = list(db["food_counts"].find({"date": date}))
    data = []
    for p in poll_records:
        if not p.get('acknowledged', False):
            continue
        p["name"] = stud_dict.get(p["student_id"], "Unknown")
        p["poll_date"] = date
        data.append(p)
        
    data.sort(key=lambda x: (x.get('class_name',''), x.get('room_number','')))
    pdf_bytes = generate_pdf_report("food_poll", data)
    return send_file(io.BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name=f'MessPoll_{date}.pdf')


@app.route('/api/reports/students-export', methods=['GET'])
@token_required
def export_students(current_user):
    db = get_db()
    import io
    from flask import send_file
    format_type = request.args.get('format', 'pdf')
    students = list(db["students"].find().sort([("room_number", 1), ("name", 1)]))
    
    if format_type == 'pdf':
        pdf_bytes = generate_pdf_report("students", students)
        return send_file(io.BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name='StudentsReport.pdf')
    else:
        excel_bytes = generate_excel_report("students", students)
        return send_file(io.BytesIO(excel_bytes), mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name='StudentsReport.xlsx')

@app.route('/api/reports/rooms-export', methods=['GET'])
@token_required
def export_rooms(current_user):
    db = get_db()
    import io
    from flask import send_file
    format_type = request.args.get('format', 'pdf')
    rooms = list(db["rooms"].find().sort([("_id", 1)]))
    
    if format_type == 'pdf':
        pdf_bytes = generate_pdf_report("occupancy", rooms)
        return send_file(io.BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name='RoomsReport.pdf')
    else:
        excel_bytes = generate_excel_report("occupancy", rooms)
        return send_file(io.BytesIO(excel_bytes), mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', as_attachment=True, download_name='RoomsReport.xlsx')

# =====================================================================
# AUTH ROUTES

# =====================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
        
    db = get_db()
    user = db["users"].find_one({"username": username})
    
    if not user:
        student = None
        if "_" in username:
            try:
                room, fname = username.split('_', 1)
                students_in_room = list(db["students"].find({"room_number": {"$regex": f"^{room}$", "$options": "i"}}))
                student = next((s for s in students_in_room if s['name'].split()[0].lower() == fname.lower()), None)
            except Exception:
                pass
                
        if not student:
            student = db["students"].find_one({"_id": username})
            
        if student:
            # For students, check if password matches 'jim123'
            if password == "jim123":
                token = jwt.encode({
                    'user_id': student['_id'],
                    'username': student['_id'],
                    'role': 'Student',
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, app.config['JWT_SECRET'], algorithm="HS256")
                
                return jsonify({
                    'token': token,
                    'user': {
                        'username': student['_id'],
                        'role': 'Student',
                        'name': student['name'],
                        'email': student['email']
                    }
                })

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'message': 'Invalid username or password'}), 401
    
        
    # Generate JWT Token
    token = jwt.encode({
        'user_id': user['_id'],
        'username': user['username'],
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['JWT_SECRET'], algorithm="HS256")
    
    log_action(user['_id'], user['username'], "Login", "User successfully logged into the system")
    
    return jsonify({
        'token': token,
        'user': {
            'username': user['username'],
            'role': user['role'],
            'name': user['name'],
            'email': user['email']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({
        'username': current_user['username'],
        'role': current_user['role'],
        'name': current_user['name'],
        'email': current_user['email']
    })

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    db = get_db()
    user = db["users"].find_one({"email": email})
    
    # Simulate sending email
    if user:
        # Save a notification in db
        notif = {
            "_id": f"forgot_pw_{user['_id']}_{int(datetime.datetime.utcnow().timestamp())}",
            "student_id": "",
            "title": "Password Reset Simulated",
            "message": f"Password reset instructions requested for account '{user['username']}'. Reset code: {random.randint(100000, 999999)}",
            "type": "Email",
            "status": "Unread",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        db["notifications"].insert_one(notif)
    
    return jsonify({'message': 'If the email exists, a password reset link has been sent.'}), 200

@app.route('/api/auth/reset-password', methods=['POST'])
@token_required
@roles_required('Admin')
def reset_password(current_user):
    data = request.json
    username = data.get('username')
    new_password = data.get('new_password')
    
    if not username or not new_password:
        return jsonify({'message': 'Username and new password are required'}), 400
        
    db = get_db()
    user = db["users"].find_one({"username": username})
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db["users"].update_one({"username": username}, {"$set": {"password_hash": hashed}})
    
    log_action(current_user['_id'], current_user['username'], "Reset Password", f"Reset password for user {username}")
    
    return jsonify({'message': f'Password for user {username} reset successfully'})

# =====================================================================
# USER ACCOUNTS MANAGEMENT (Admin Only)
# =====================================================================

@app.route('/api/accounts', methods=['GET', 'POST'])
@token_required
@roles_required('Admin')
def manage_accounts(current_user):
    db = get_db()
    if request.method == 'GET':
        users = list(db["users"].find())
        # Strip out password hashes
        for u in users:
            u.pop('password_hash', None)
        return jsonify(users)
        
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        role = data.get('role') # 'AD' or 'Director' or 'Admin'
        email = data.get('email')
        name = data.get('name')
        
        if not username or not password or not role or not email or not name:
            return jsonify({'message': 'All fields are required'}), 400
            
        existing = db["users"].find_one({"username": username})
        if existing:
            return jsonify({'message': 'Username already exists'}), 409
            
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = {
            "_id": f"user_{username}",
            "username": username,
            "password_hash": hashed,
            "role": role,
            "email": email,
            "name": name,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        db["users"].insert_one(new_user)
        log_action(current_user['_id'], current_user['username'], "Create User", f"Created {role} account: {username}")
        
        return jsonify({'message': 'User account created successfully'}), 201

@app.route('/api/accounts/<username>', methods=['PUT', 'DELETE'])
@token_required
@roles_required('Admin')
def modify_account(current_user, username):
    db = get_db()
    if request.method == 'PUT':
        data = request.json
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        
        if not name or not email or not role:
            return jsonify({'message': 'All fields are required'}), 400
            
        result = db["users"].update_one(
            {"username": username},
            {"$set": {
                "name": name,
                "email": email,
                "role": role
            }}
        )
        if result.matched_count == 0:
            return jsonify({'message': 'User not found'}), 404
            
        log_action(current_user['_id'], current_user['username'], "Update User", f"Updated user account: {username}")
        return jsonify({'message': 'User account updated successfully'})
        
    if request.method == 'DELETE':
        if current_user['username'] == username:
            return jsonify({'message': 'Cannot delete your own administrative account'}), 400
            
        result = db["users"].delete_one({"username": username})
        if result.deleted_count == 0:
            return jsonify({'message': 'User not found'}), 404
            
        log_action(current_user['_id'], current_user['username'], "Delete User", f"Deleted user account: {username}")
        return jsonify({'message': 'User account deleted successfully'})

# =====================================================================
# ROOM MANAGEMENT
# =====================================================================

@app.route('/api/rooms', methods=['GET', 'POST'])
@token_required
def get_rooms(current_user):
    db = get_db()
    if request.method == 'GET':
        rooms = list(db["rooms"].find())
        # Sort rooms naturally (A1, A2, B1, etc.)
        rooms.sort(key=lambda r: (r["_id"][0], int(r["_id"][1:]) if r["_id"][1:].isdigit() else r["_id"][1:]))
        return jsonify(rooms)
        
    if request.method == 'POST':
        if current_user.get('role') != 'Admin':
            return jsonify({'message': 'Unauthorized'}), 403
        data = request.json
        room_num = data.get('room_number')
        block = data.get('block', 'Toulouse Arena')
        floor = int(data.get('floor', 1))
        capacity = int(data.get('capacity', 6))
        
        if not room_num:
            return jsonify({'message': 'Room number is required'}), 400
            
        existing = db["rooms"].find_one({"_id": room_num})
        if existing:
            return jsonify({'message': 'Room already exists'}), 409
            
        new_room = {
            "_id": room_num,
            "block": block,
            "floor": floor,
            "capacity": capacity,
            "occupied": 0,
            "available_beds": capacity
        }
        db["rooms"].insert_one(new_room)
        log_action(current_user['_id'], current_user['username'], "Add Room", f"Added Room {room_num}")
        
        return jsonify({'message': f'Room {room_num} added successfully'}), 201

@app.route('/api/rooms/<room_number>', methods=['PUT', 'DELETE'])
@token_required
@roles_required('Admin')
def modify_room(current_user, room_number):
    db = get_db()
    room = db["rooms"].find_one({"_id": room_number})
    if not room:
        return jsonify({'message': 'Room not found'}), 404
        
    if request.method == 'PUT':
        data = request.json
        capacity = int(data.get('capacity', room['capacity']))
        block = data.get('block', room['block'])
        floor = int(data.get('floor', room['floor']))
        
        occupied = room['occupied']
        available = capacity - occupied
        
        db["rooms"].update_one(
            {"_id": room_number},
            {"$set": {
                "capacity": capacity,
                "block": block,
                "floor": floor,
                "available_beds": available
            }}
        )
        log_action(current_user['_id'], current_user['username'], "Edit Room", f"Edited room details for {room_number}")
        return jsonify({'message': f'Room {room_number} updated successfully'})
        
    if request.method == 'DELETE':
        if room['occupied'] > 0:
            return jsonify({'message': 'Cannot delete room: Students are currently allocated to it.'}), 400
            
        db["rooms"].delete_one({"_id": room_number})
        log_action(current_user['_id'], current_user['username'], "Delete Room", f"Deleted Room {room_number}")
        return jsonify({'message': f'Room {room_number} deleted successfully'})

@app.route('/api/rooms/<room_number>/occupancy', methods=['GET'])
@token_required
def get_room_occupancy(current_user, room_number):
    db = get_db()
    students = list(db["students"].find({"room_number": room_number}))
    return jsonify(students)

# =====================================================================
# STUDENT MANAGEMENT
# =====================================================================

@app.route('/api/students', methods=['GET', 'POST'])
@token_required
def get_students(current_user):
    db = get_db()
    if request.method == 'GET':
        query = {}
        
        # Filters
        room = request.args.get('room')
        status = request.args.get('status')
        search = request.args.get('search')
        
        if room:
            query["room_number"] = room
        if status:
            query["status"] = status
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"register_number": {"$regex": search, "$options": "i"}},
                {"_id": {"$regex": search, "$options": "i"}},
                {"mobile": {"$regex": search, "$options": "i"}}
            ]
            
        students = list(db["students"].find(query))
        return jsonify(students)
        
    if request.method == 'POST':
        if current_user.get('role') != 'Admin':
            return jsonify({'message': 'Unauthorized'}), 403
            
        data = request.json
        student_id = data.get('student_id')
        reg_number = data.get('register_number')
        name = data.get('name')
        course = data.get('course', 'II MBA')
        year = data.get('year', 'II')
        dept = data.get('department', 'Business Administration')
        room_num = data.get('room_number')
        mobile = data.get('mobile')
        parent_mobile = data.get('parent_mobile')
        email = data.get('email')
        hostel = data.get('hostel_name', 'JIM Boys Hostel')
        block = data.get('block', 'Toulouse Arena')
        status = data.get('status', 'Active')
        photo = data.get('photo', '')
        
        if not student_id or not reg_number or not name or not room_num:
            return jsonify({'message': 'ID, Register Number, Name, and Room Number are required.'}), 400
            
        # Check room availability
        room = db["rooms"].find_one({"_id": room_num})
        if not room:
            return jsonify({'message': f'Room {room_num} does not exist.'}), 404
            
        # Check duplicate ID
        existing = db["students"].find_one({"_id": student_id})
        if existing:
            return jsonify({'message': 'Student ID already exists.'}), 409
            
        new_student = {
            "_id": student_id,
            "register_number": reg_number,
            "name": name,
            "course": course,
            "year": year,
            "department": dept,
            "room_number": room_num,
            "mobile": mobile,
            "parent_mobile": parent_mobile,
            "email": email,
            "photo": photo,
            "hostel_name": hostel,
            "block": block,
            "status": status,
            "attendance_percentage": 100.0,
            "last_attendance": "None"
        }
        
        db["students"].insert_one(new_student)
        
        # Update Room Occupancy
        db["rooms"].update_one(
            {"_id": room_num},
            {"$inc": {"occupied": 1, "available_beds": -1}}
        )
        
        log_action(current_user['_id'], current_user['username'], "Add Student", f"Added Student {name} to room {room_num}")
        return jsonify({'message': f'Student {name} registered successfully'}), 201

@app.route('/api/students/<student_id>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def manage_student(current_user, student_id):
    db = get_db()
    student = db["students"].find_one({"_id": student_id})
    if not student:
        return jsonify({'message': 'Student not found.'}), 404
        
    if request.method == 'GET':
        # Fetch attendance history
        attendance = list(db["attendance"].find({"student_id": student_id}).sort("date", -1))
        # Fetch leave history
        leaves = list(db["leave_requests"].find({"student_id": student_id}).sort("leave_from", -1))
        
        profile = student.copy()
        profile["attendance_history"] = attendance
        profile["leave_history"] = leaves
        return jsonify(profile)
        
    if request.method == 'PUT':
        if current_user.get('role') != 'Admin':
            return jsonify({'message': 'Unauthorized'}), 403
            
        data = request.json
        old_room = student['room_number']
        new_room = data.get('room_number', old_room)
        
        # If room changes, adjust occupancy
        if old_room != new_room:
            # Check availability
            dest_room = db["rooms"].find_one({"_id": new_room})
            if not dest_room:
                return jsonify({'message': f'Room {new_room} does not exist.'}), 404
                
            # Decrement old
            db["rooms"].update_one({"_id": old_room}, {"$inc": {"occupied": -1, "available_beds": 1}})
            # Increment new
            db["rooms"].update_one({"_id": new_room}, {"$inc": {"occupied": 1, "available_beds": -1}})
            
        update_fields = {
            "name": data.get('name', student['name']),
            "register_number": data.get('register_number', student['register_number']),
            "course": data.get('course', student['course']),
            "year": data.get('year', student['year']),
            "department": data.get('department', student['department']),
            "room_number": new_room,
            "mobile": data.get('mobile', student['mobile']),
            "parent_mobile": data.get('parent_mobile', student['parent_mobile']),
            "email": data.get('email', student['email']),
            "photo": data.get('photo', student['photo']),
            "status": data.get('status', student['status']),
            "block": data.get('block', student['block'])
        }
        
        db["students"].update_one({"_id": student_id}, {"$set": update_fields})
        log_action(current_user['_id'], current_user['username'], "Edit Student", f"Updated student profile for {student['name']}")
        return jsonify({'message': f"Student {student['name']} details updated."})
        
    if request.method == 'DELETE':
        if current_user.get('role') != 'Admin':
            return jsonify({'message': 'Unauthorized'}), 403
            
        room_num = student['room_number']
        db["students"].delete_one({"_id": student_id})
        # Delete related attendance and leaves
        db["attendance"].delete_many({"student_id": student_id})
        db["leave_requests"].delete_many({"student_id": student_id})
        
        # Decrement room occupied
        db["rooms"].update_one({"_id": room_num}, {"$inc": {"occupied": -1, "available_beds": 1}})
        
        log_action(current_user['_id'], current_user['username'], "Delete Student", f"Deleted Student {student['name']}")
        return jsonify({'message': f"Student {student['name']} removed from system."})

# =====================================================================
# ATTENDANCE MODULE
# =====================================================================

@app.route('/api/attendance', methods=['POST'])
@token_required
@roles_required('AD', 'Admin')
def mark_attendance(current_user):
    data = request.json
    room_number = data.get('room_number')
    date_str = data.get('date', datetime.date.today().isoformat()) # YYYY-MM-DD
    att_type = data.get('type') # 'morning' or 'night'
    attendance_data = data.get('attendance', {}) # { student_id: 'Present'/'Absent'/'Late Entry' }
    remarks_data = data.get('remarks', {}) # { student_id: 'Some remark' }
    
    if not room_number or not att_type:
        return jsonify({'message': 'Room number and attendance type are required.'}), 400
        
    db = get_db()
    
    # Verify room exists
    room = db["rooms"].find_one({"_id": room_number})
    if not room:
        return jsonify({'message': f"Room {room_number} not found."}), 404
        
    timestamp = f"{date_str}T{datetime.datetime.now().strftime('%H:%M:%S')}"
    marked_by = current_user['name']
    
    for s_id, status in attendance_data.items():
        student = db["students"].find_one({"_id": s_id})
        if not student:
            continue
            
        # Overwrite marked status to "Leave" if the student is currently on approved leave
        # Check active approved leaves for this date
        on_leave = db["leave_requests"].find_one({
            "student_id": s_id,
            "status": "Approved",
            "leave_from": {"$lte": date_str},
            "leave_to": {"$gte": date_str}
        })
        
        final_status = "Absent" if on_leave else status
        remark = remarks_data.get(s_id, "")
        if on_leave and not remark:
            remark = "On Approved Leave"
            
        att_id = f"{date_str}_{att_type}_{s_id}"
        
        db["attendance"].update_one(
            {"_id": att_id},
            {"$set": {
                "date": date_str,
                "type": att_type,
                "room_number": room_number,
                "student_id": s_id,
                "status": final_status,
                "remarks": remark,
                "marked_by": marked_by,
                "timestamp": timestamp
            }},
            upsert=True
        )
        
        # Trigger recalculation of percentages
        update_student_attendance_percentage(s_id)
        
        # Check for continuous absence warning triggers
        if final_status == "Absent":
            check_continuous_absences(s_id, student['name'], room_number)
            
    log_action(current_user['_id'], current_user['username'], "Mark Attendance", f"Marked {att_type} attendance for Room {room_number} on {date_str}")
    return jsonify({'message': 'Attendance saved successfully.'})

@app.route('/api/attendance/<att_id>', methods=['PUT'])
@token_required
@roles_required('AD', 'Admin')
def update_attendance_record(current_user, att_id):
    data = request.json
    new_status = data.get('status')
    new_remarks = data.get('remarks', "")
    
    if not new_status:
        return jsonify({'message': 'Status is required.'}), 400
        
    db = get_db()
    record = db["attendance"].find_one({"_id": att_id})
    if not record:
        return jsonify({'message': 'Attendance record not found.'}), 404
        
    db["attendance"].update_one(
        {"_id": att_id},
        {"$set": {
            "status": new_status,
            "remarks": new_remarks,
            "marked_by": f"{current_user['name']} (Edited)",
            "timestamp": datetime.datetime.now().isoformat()
        }}
    )
    
    update_student_attendance_percentage(record["student_id"])
    
    log_action(
        current_user['_id'],
        current_user['username'],
        "Edit Attendance",
        f"Edited attendance for student ID {record['student_id']} on date {record['date']} to {new_status}"
    )
    
    return jsonify({
        'message': 'Attendance record updated successfully.',
        'record': {
            '_id': att_id,
            'status': new_status,
            'remarks': new_remarks
        }
    })

@app.route('/api/attendance/room/<room_number>', methods=['GET'])
@token_required
def get_room_attendance(current_user, room_number):
    db = get_db()
    date_str = request.args.get('date', datetime.date.today().isoformat())
    att_type = request.args.get('type', 'morning')
    
    students = list(db["students"].find({"room_number": room_number}))
    
    # Find existing attendance records
    records = list(db["attendance"].find({
        "room_number": room_number,
        "date": date_str,
        "type": att_type
    }))
    
    record_map = {r["student_id"]: r for r in records}
    
    result = []
    for s in students:
        rec = record_map.get(s["_id"], {})
        
        # Check leave status
        on_leave = db["leave_requests"].find_one({
            "student_id": s["_id"],
            "status": "Approved",
            "leave_from": {"$lte": date_str},
            "leave_to": {"$gte": date_str}
        })
        default_status = "Absent" if on_leave else "Present"
        default_remark = "On Approved Leave" if on_leave else ""
        
        result.append({
            "student_id": s["_id"],
            "name": s["name"],
            "register_number": s["register_number"],
            "status": rec.get("status", default_status),
            "remarks": rec.get("remarks", default_remark),
            "has_record": "_id" in rec
        })
        
    return jsonify({
        "room_number": room_number,
        "date": date_str,
        "type": att_type,
        "marked_by": records[0]["marked_by"] if records else None,
        "students": result
    })

@app.route('/api/attendance/history', methods=['GET'])
@token_required
def get_attendance_history(current_user):
    db = get_db()
    room = request.args.get('room')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    att_type = request.args.get('type')
    status = request.args.get('status')
    
    query = {}
    if room:
        query["room_number"] = room
    if att_type:
        query["type"] = att_type
    if status:
        query["status"] = status
        
    if start_date or end_date:
        query["date"] = {}
        if start_date:
            query["date"]["$gte"] = start_date
        if end_date:
            query["date"]["$lte"] = end_date
            
    records = list(db["attendance"].find(query).sort("timestamp", -1))
    
    # Hydrate student details (name, register number)
    hydrated_records = []
    student_cache = {}
    
    for r in records:
        s_id = r["student_id"]
        if s_id not in student_cache:
            student = db["students"].find_one({"_id": s_id})
            student_cache[s_id] = student if student else {"name": "Unknown Student", "register_number": ""}
            
        r_copy = r.copy()
        r_copy["student_name"] = student_cache[s_id]["name"]
        r_copy["register_number"] = student_cache[s_id]["register_number"]
        hydrated_records.append(r_copy)
        
    return jsonify(hydrated_records)

# =====================================================================
# LEAVE MANAGEMENT
# =====================================================================

@app.route('/api/leave', methods=['GET', 'POST'])
@token_required
def manage_leaves(current_user):
    db = get_db()
    if request.method == 'GET':
        leaves = list(db["leave_requests"].find().sort("created_at", -1))
        # Hydrate student information
        for l in leaves:
            student = db["students"].find_one({"_id": l["student_id"]})
            if student:
                l["student_name"] = student["name"]
                l["room_number"] = student["room_number"]
                l["course"] = student["course"]
            else:
                l["student_name"] = "Unknown"
                l["room_number"] = ""
        return jsonify(leaves)
        
    if request.method == 'POST':
        data = request.json
        student_id = data.get('student_id')
        leave_from = data.get('leave_from')
        leave_to = data.get('leave_to')
        reason = data.get('reason')
        
        if not student_id or not leave_from or not leave_to or not reason:
            return jsonify({'message': 'All fields are required.'}), 400
            
        student = db["students"].find_one({"_id": student_id})
        if not student:
            return jsonify({'message': 'Student not found'}), 404
            
        new_leave = {
            "_id": f"leave_{student_id}_{int(datetime.datetime.utcnow().timestamp())}",
            "student_id": student_id,
            "leave_from": leave_from,
            "leave_to": leave_to,
            "reason": reason,
            "status": "Pending",
            "approved_by": "",
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        db["leave_requests"].insert_one(new_leave)
        log_action(current_user['_id'], current_user['username'], "Submit Leave", f"Submitted leave request for {student['name']}")
        return jsonify({'message': 'Leave request submitted successfully.'}), 201


@app.route('/api/leave/<leave_id>', methods=['DELETE'])
@token_required
@roles_required('Admin')
def delete_leave(current_user, leave_id):
    db = get_db()
    db["leave_requests"].delete_one({"_id": leave_id})
    return jsonify({"message": "Leave request deleted."})

@app.route('/api/leave/<leave_id>', methods=['PUT'])
@token_required
@roles_required('Director', 'Admin', 'AD')
def approve_leave(current_user, leave_id):
    data = request.json
    status = data.get('status') # 'Approved' or 'Rejected'
    
    if status not in ['Approved', 'Rejected']:
        return jsonify({'message': 'Invalid status'}), 400
        
    db = get_db()
    leave = db["leave_requests"].find_one({"_id": leave_id})
    if not leave:
        return jsonify({'message': 'Leave request not found'}), 404
        
    db["leave_requests"].update_one(
        {"_id": leave_id},
        {"$set": {
            "status": status,
            "approved_by": current_user['name']
        }}
    )
    
    student = db["students"].find_one({"_id": leave["student_id"]})
    
    # If approved, update student status and auto-fill attendance status
    if status == 'Approved' and student:
        db["students"].update_one({"_id": leave["student_id"]}, {"$set": {"status": "On Leave"}})
        
        # Populate attendance days with 'Leave' if attendance marked by AD
        # (Our attendance marking endpoint already checks this automatically)
        notif = {
            "_id": f"leave_notif_{leave_id}",
            "student_id": leave["student_id"],
            "title": "Leave Approved",
            "message": f"Leave from {leave['leave_from']} to {leave['leave_to']} approved by Director.",
            "type": "SMS/Email",
            "status": "Unread",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        db["notifications"].insert_one(notif)
        
    elif status == 'Rejected' and student:
        # Revert student status to Active if it was 'On Leave'
        if student['status'] == 'On Leave':
            db["students"].update_one({"_id": leave["student_id"]}, {"$set": {"status": "Active"}})
            
    log_action(current_user['_id'], current_user['username'], f"Leave {status}", f"Set leave status for student ID {leave['student_id']} to {status}")
    return jsonify({'message': f"Leave request has been {status.lower()}."})

# =====================================================================
# DEFAULTERS & ALERTS
# =====================================================================

@app.route('/api/defaulters', methods=['GET'])
@token_required
def get_defaulters(current_user):
    threshold = float(request.args.get('threshold', 85.0))
    db = get_db()
    students = list(db["students"].find({"attendance_percentage": {"$lt": threshold}}))
    
    result = []
    for s in students:
        pct = s.get('attendance_percentage', 100.0)
        risk = "Critical" if pct < 65.0 else ("High" if pct < 75.0 else ("Moderate" if pct < 80.0 else "Low"))
        result.append({
            "student_id": s["_id"],
            "register_number": s["register_number"],
            "name": s["name"],
            "room_number": s["room_number"],
            "attendance_percentage": pct,
            "risk_level": risk
        })
    return jsonify(result)

@app.route('/api/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    db = get_db()
    alerts = list(db["notifications"].find({"level": {"$in": ["Warning", "High Risk"]}}).sort("timestamp", -1))
    return jsonify(alerts)

# =====================================================================
# VISITOR & LATE ENTRY REGISTERS
# =====================================================================

@app.route('/api/visitors', methods=['GET', 'POST'])
@token_required
def manage_visitors(current_user):
    db = get_db()
    if request.method == 'GET':
        visitors = list(db["visitors"].find().sort("created_at", -1))
        for v in visitors:
            student = db["students"].find_one({"_id": v["student_id"]})
            v["student_name"] = student["name"] if student else "Unknown"
            v["room_number"] = student["room_number"] if student else ""
        return jsonify(visitors)
        
    if request.method == 'POST':
        data = request.json
        visitor_name = data.get('visitor_name')
        student_id = data.get('student_id')
        relationship = data.get('relationship')
        phone = data.get('phone_number')
        purpose = data.get('purpose')
        entry_time = data.get('entry_time', datetime.datetime.now().isoformat())
        exit_time = data.get('exit_time', '')
        
        if not visitor_name or not student_id or not phone:
            return jsonify({'message': 'Visitor Name, Student ID, and Phone Number are required.'}), 400
            
        new_visitor = {
            "_id": f"visitor_{int(datetime.datetime.utcnow().timestamp())}",
            "visitor_name": visitor_name,
            "student_id": student_id,
            "relationship": relationship,
            "phone_number": phone,
            "entry_time": entry_time,
            "exit_time": exit_time,
            "purpose": purpose,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        db["visitors"].insert_one(new_visitor)
        return jsonify({'message': 'Visitor log created successfully.'}), 201

@app.route('/api/late-entries', methods=['GET', 'POST'])
@token_required
def manage_late_entries(current_user):
    db = get_db()
    if request.method == 'GET':
        late_entries = list(db["late_entries"].find().sort("created_at", -1))
        for le in late_entries:
            student = db["students"].find_one({"_id": le["student_id"]})
            le["student_name"] = student["name"] if student else "Unknown"
            le["room_number"] = student["room_number"] if student else ""
        return jsonify(late_entries)
        
    if request.method == 'POST':
        data = request.json
        student_id = data.get('student_id')
        reason = data.get('reason')
        entry_time = data.get('entry_time', datetime.datetime.now().isoformat())
        approved_by = current_user['name']
        
        if not student_id or not reason:
            return jsonify({'message': 'Student ID and reason are required.'}), 400
            
        student = db["students"].find_one({"_id": student_id})
        if not student:
            return jsonify({'message': 'Student not found'}), 404
            
        new_late_entry = {
            "_id": f"late_{student_id}_{int(datetime.datetime.utcnow().timestamp())}",
            "student_id": student_id,
            "entry_time": entry_time,
            "reason": reason,
            "approved_by": approved_by,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        db["late_entries"].insert_one(new_late_entry)
        
        # Log attendance type Late Entry if marked for same day
        # (This provides a clean integration for general logs)
        return jsonify({'message': 'Late entry recorded successfully.'}), 201

# =====================================================================
# SYSTEM AUDIT LOGS (Admin Only)
# =====================================================================

@app.route('/api/system-logs', methods=['GET'])
@token_required
@roles_required('Admin')
def get_system_logs(current_user):
    db = get_db()
    logs = list(db["audit_logs"].find().sort("timestamp", -1).limit(100))
    return jsonify(logs)

# =====================================================================
# NOTIFICATIONS (Dashboard Feed)
# =====================================================================

@app.route('/api/notifications', methods=['GET', 'PUT'])
@token_required
def get_notifications(current_user):
    db = get_db()
    if request.method == 'GET':
        notifs = list(db["notifications"].find().sort("timestamp", -1).limit(20))
        return jsonify(notifs)
    
    if request.method == 'PUT':
        # Mark all as read
        db["notifications"].update_many({"status": "Unread"}, {"$set": {"status": "Read"}})
        return jsonify({'message': 'All alerts marked as read.'})

# =====================================================================
# ANALYTICS DASHBOARD
# =====================================================================

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user):
    db = get_db()
    
    # 1. Hostel Occupancy
    rooms = list(db["rooms"].find())
    total_beds = sum(r['capacity'] for r in rooms)
    occupied_beds = sum(r['occupied'] for r in rooms)
    available_beds = total_beds - occupied_beds
    
    # Room-wise occupancy percentage
    room_occupancy = []
    for r in rooms:
        pct = round((r['occupied'] / r['capacity']) * 100, 1) if r['capacity'] > 0 else 0
        room_occupancy.append({
            "room": r['_id'],
            "occupied": r['occupied'],
            "capacity": r['capacity'],
            "percentage": pct
        })
        
    # 2. Defaulter Summary counts
    def_85 = db["students"].count_documents({"attendance_percentage": {"$lt": 85.0}})
    def_80 = db["students"].count_documents({"attendance_percentage": {"$lt": 80.0}})
    def_75 = db["students"].count_documents({"attendance_percentage": {"$lt": 75.0}})
    def_65 = db["students"].count_documents({"attendance_percentage": {"$lt": 65.0}})
    
    # 3. Attendance trends (Last 7 days)
    today = datetime.date.today()
    attendance_trends = []
    
    for i in range(7):
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        
        # Calculate morning and night averages
        for a_type in ["morning", "night"]:
            total = db["attendance"].count_documents({"date": day_str, "type": a_type})
            presents = db["attendance"].count_documents({"date": day_str, "type": a_type, "status": {"$in": ["Present", "Late Entry"]}})
            leaves = db["attendance"].count_documents({"date": day_str, "type": a_type, "status": "Leave"})
            
            denom = total - leaves
            pct = 100.0
            if denom > 0:
                pct = round((presents / denom) * 100, 1)
                
            attendance_trends.append({
                "date": day_str,
                "label": f"{day.strftime('%a')} ({a_type.capitalize()})",
                "percentage": pct,
                "present": presents,
                "absent": total - presents - leaves,
                "leave": leaves,
                "total": total
            })
            
    # Reverse trends to show chronologically
    attendance_trends.reverse()
    
    # 4. Status counts
    total_students = db["students"].count_documents({})
    on_leave = db["students"].count_documents({"status": "On Leave"})
    suspended = db["students"].count_documents({"status": "Suspended"})
    active = db["students"].count_documents({"status": "Active"})
    
    return jsonify({
        "occupancy": {
            "total_beds": total_beds,
            "occupied_beds": occupied_beds,
            "available_beds": available_beds,
            "percentage": round((occupied_beds / total_beds) * 100, 1) if total_beds > 0 else 0
        },
        "room_occupancy": room_occupancy,
        "defaulters": {
            "below_85": def_85,
            "below_80": def_80,
            "below_75": def_75,
            "below_65": def_65
        },
        "trends": attendance_trends,
        "student_status": {
            "total": total_students,
            "active": active,
            "leave": on_leave,
            "suspended": suspended
        }
    })

# =====================================================================
# DASHBOARD SUMMARY CARDS
# =====================================================================

@app.route('/api/dashboard/summary', methods=['GET'])
@token_required
def get_dashboard_summary(current_user):
    db = get_db()
    today_str = datetime.date.today().isoformat()
    
    # Count totals
    total_students = db["students"].count_documents({})
    on_leave = db["students"].count_documents({"status": "On Leave"})
    
    # Determine latest marked attendance
    # If today's night attendance is marked, use that. Otherwise today's morning, otherwise yesterday's night.
    records_today = list(db["attendance"].find({"date": today_str}))
    
    type_to_show = "morning"
    if any(r.get('type') == 'night' for r in records_today):
        type_to_show = "night"
        
    # Filter today's records for active type and aggregate stats in memory
    filtered_records = [r for r in records_today if r.get('type') == type_to_show]
    presents = sum(1 for r in filtered_records if r.get('status') in ["Present", "Late Entry"])
    absents = sum(1 for r in filtered_records if r.get('status') == "Absent")
    leaves = sum(1 for r in filtered_records if r.get('status') == "Leave")
    
    denom = presents + absents
    pct = round((presents / denom) * 100, 1) if denom > 0 else 100.0
    
    total_rooms = db["rooms"].count_documents({})
    
    # Rooms completed count (where at least one student attendance is marked today for current type)
    rooms_marked = len(set(r["room_number"] for r in filtered_records if r.get("room_number")))
    
    # Alerts count
    alerts_count = db["notifications"].count_documents({"status": "Unread"})
    
    return jsonify({
        "total_students": total_students,
        "present_today": presents,
        "absent_today": absents,
        "on_leave_today": on_leave,
        "attendance_percentage": pct,
        "total_rooms": total_rooms,
        "rooms_completed": rooms_marked,
        "rooms_pending": max(0, total_rooms - rooms_marked),
        "alerts_count": alerts_count,
        "active_type": type_to_show,
        "date": today_str
    })

# =====================================================================
# REPORTS EXPORT BLUEPRINTS
# =====================================================================

@app.route('/api/reports/export', methods=['GET'])
@token_required
def export_reports(current_user):
    report_format = request.args.get('format', 'pdf') # 'pdf' or 'excel'
    report_type = request.args.get('type', 'daily') # 'daily', 'defaulter', 'leave', 'occupancy'
    room_filter = request.args.get('room')
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if not start_date or not end_date:
        start_date = request.args.get('date', datetime.date.today().isoformat())
        end_date = start_date
        
    db = get_db()
    data = []
    
    if report_type == 'daily':
        # Retrieve attendance details for this date range
        q = {"date": {"$gte": start_date, "$lte": end_date}}
        if room_filter:
            q["room_number"] = room_filter
            
        records = list(db["attendance"].find(q).sort([("date", 1), ("room_number", 1)]))
        for r in records:
            stud = db["students"].find_one({"_id": r["student_id"]})
            data.append({
                "date": r.get("date", ""),
                "register_number": stud["register_number"] if stud else "",
                "name": stud["name"] if stud else "Unknown",
                "room_number": r["room_number"],
                "status": r["status"],
                "marked_by": r["marked_by"],
                "time": r["timestamp"].split('T')[1][:5] if 'T' in r["timestamp"] else ""
            })
            
    elif report_type == 'defaulter':
        # Defaulters list (below 85%)
        students = list(db["students"].find({"attendance_percentage": {"$lt": 85.0}}).sort("attendance_percentage", 1))
        for s in students:
            pct = s.get('attendance_percentage', 100.0)
            risk = "Critical" if pct < 65.0 else ("High" if pct < 75.0 else ("Moderate" if pct < 80.0 else "Low"))
            data.append({
                "register_number": s["register_number"],
                "name": s["name"],
                "room_number": s["room_number"],
                "attendance_percentage": pct,
                "risk_level": risk
            })
            
    elif report_type == 'leave':
        # List of approved leave logs
        leaves = list(db["leave_requests"].find().sort("leave_from", -1))
        for l in leaves:
            stud = db["students"].find_one({"_id": l["student_id"]})
            data.append({
                "name": stud["name"] if stud else "Unknown",
                "room_number": stud["room_number"] if stud else "",
                "leave_from": l["leave_from"],
                "leave_to": l["leave_to"],
                "reason": l["reason"],
                "status": l["status"]
            })
            
    elif report_type == 'occupancy':
        # Room list
        rooms = list(db["rooms"].find())
        rooms.sort(key=lambda x: x['_id'])
        for r in rooms:
            data.append({
                "room_number": r["_id"],
                "block": r["block"],
                "floor": r["floor"],
                "capacity": r["capacity"],
                "occupied": r["occupied"],
                "available_beds": r["available_beds"]
            })
            
    date_label = f"{start_date}_to_{end_date}" if start_date != end_date else start_date
    if report_format == 'pdf':
        pdf_bytes = generate_pdf_report(report_type, data)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"jim_hostel_{report_type}_report_{date_label}.pdf"
        )
    elif report_format == 'excel':
        excel_bytes = generate_excel_report(report_type, data)
        return send_file(
            io.BytesIO(excel_bytes),
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f"jim_hostel_{report_type}_report_{date_label}.xlsx"
        )
    else:
        return jsonify({'message': 'Invalid format selection'}), 400

# =====================================================================
# SYSTEM STARTUP & TEST ROUTE
# =====================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'app': 'JIM Hostel Attendance API Server',
        'time': datetime.datetime.utcnow().isoformat(),
        'database_mode': 'Mock persistent files' if get_db().__class__.__name__ == 'MockDatabase' else 'MongoDB cluster'
    })


# =====================================================================
# MESS FOOD POLL
# =====================================================================
@app.route('/api/food-poll/<date>', methods=['GET', 'POST'])
@token_required
def food_poll(current_user, date):
    db = get_db()
    if request.method == 'GET':
        room = request.args.get('room')
        query = {"date": date}
        if room:
            query["room_number"] = room
        records = list(db["food_counts"].find(query))
        return jsonify(records)
        
    if request.method == 'POST':
        data = request.json
        for item in data.get('records', []):
            s_id = item['student_id']
            db["food_counts"].update_one(
                {"date": date, "student_id": s_id},
                {"$set": {
                    "date": date,
                    "student_id": s_id,
                    "class_name": item.get('class_name', ''),
                    "room_number": item['room_number'],
                    "breakfast": item.get('breakfast', False),
                    "lunch": item.get('lunch', False),
                    "dinner": item.get('dinner', False),
                    "acknowledged": item.get('acknowledged', True)
                }},
                upsert=True
            )
        return jsonify({"message": "Food poll updated successfully."})
        

@app.route('/api/food-poll/config', methods=['GET', 'POST'])
@token_required
def active_poll_config(current_user):
    db = get_db()
    if request.method == 'POST':
        if current_user.get('role') not in ['Admin', 'AD']:
            return jsonify({'message': 'Unauthorized'}), 403
        data = request.json
        db["config"].update_one({"_id": "mess_poll_date"}, {"$set": {"date": data.get('date')}}, upsert=True)
        return jsonify({'message': 'Active poll date set.'})
    else:
        doc = db["config"].find_one({"_id": "mess_poll_date"})
        return jsonify({"date": doc.get("date", "") if doc else ""})

@app.route('/api/food-poll/summary/<date>', methods=['GET'])
@token_required
def food_poll_summary(current_user, date):
    db = get_db()
    records = list(db["food_counts"].find({"date": date}))
    summary = {"breakfast": 0, "lunch": 0, "dinner": 0, "total_recorded": len(records), "groups": {}}
    for r in records:
        grp = r.get('class_name', 'Unknown')
        if grp not in summary['groups']:
            summary['groups'][grp] = {"breakfast": 0, "lunch": 0, "dinner": 0}
            
        if r.get('breakfast'): 
            summary['breakfast'] += 1
            summary['groups'][grp]['breakfast'] += 1
        if r.get('lunch'): 
            summary['lunch'] += 1
            summary['groups'][grp]['lunch'] += 1
        if r.get('dinner'): 
            summary['dinner'] += 1
            summary['groups'][grp]['dinner'] += 1
            
    return jsonify(summary)

if __name__ == '__main__':

    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
