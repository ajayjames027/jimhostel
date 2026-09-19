import sys
import re

def patch():
    # 1. Update reports_generator.py
    with open("reports_generator.py", "r") as f:
        content = f.read()

    food_poll_pdf = """
        elif report_type == 'food_poll':
            headers = ["Student Name", "Room Number", "Group", "Breakfast", "Lunch", "Dinner"]
            col_widths = [2.0*inch, 1.2*inch, 1.0*inch, 1.0*inch, 1.0*inch, 1.0*inch]
            rows = [[Paragraph(h, header_style) for h in headers]]
            for item in data:
                b = "Yes" if item.get('breakfast') else "No"
                l = "Yes" if item.get('lunch') else "No"
                d = "Yes" if item.get('dinner') else "No"
                rows.append([
                    Paragraph(item.get('name', ''), body_style),
                    Paragraph(item.get('room_number', ''), body_style),
                    Paragraph(item.get('class_name', ''), body_style),
                    Paragraph(b, body_style),
                    Paragraph(l, body_style),
                    Paragraph(d, body_style)
                ])
"""
    if "elif report_type == 'food_poll':" not in content:
        content = content.replace("else:\n            headers = [\"Info\"]", food_poll_pdf.strip('\n') + "\n        else:\n            headers = [\"Info\"]")
        with open("reports_generator.py", "w") as f:
            f.write(content)
            
    # 2. Update app.py
    with open("app.py", "r") as f:
        content_app = f.read()
        
    new_routes = """
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
        data.append(p)
        
    data.sort(key=lambda x: (x.get('class_name',''), x.get('room_number','')))
    pdf_bytes = generate_pdf_report("food_poll", data)
    return send_file(io.BytesIO(pdf_bytes), mimetype='application/pdf', as_attachment=True, download_name=f'MessPoll_{date}.pdf')
"""
    if "/api/maintenance" not in content_app:
        content_app = content_app.replace("# =====================================================================\n# AUTH ROUTES", new_routes + "\n# =====================================================================\n# AUTH ROUTES")
        with open("app.py", "w") as f:
            f.write(content_app)

if __name__ == "__main__":
    patch()
