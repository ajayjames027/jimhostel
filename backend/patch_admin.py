import os

app_file = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\backend\app.py'
with open(app_file, 'r', encoding='utf-8') as f:
    app_text = f.read()

maintenance_delete = """
@app.route('/api/maintenance/<issue_id>', methods=['DELETE'])
@token_required
@roles_required('Admin')
def delete_maintenance(current_user, issue_id):
    db = get_db()
    db["maintenance"].delete_one({"_id": issue_id})
    return jsonify({"message": "Maintenance request deleted."})

@app.route('/api/maintenance/<issue_id>', methods=['PUT'])"""

if "def delete_maintenance(" not in app_text:
    app_text = app_text.replace("@app.route('/api/maintenance/<issue_id>', methods=['PUT'])", maintenance_delete)

leave_delete = """
@app.route('/api/leave/<leave_id>', methods=['DELETE'])
@token_required
@roles_required('Admin')
def delete_leave(current_user, leave_id):
    db = get_db()
    db["leave_requests"].delete_one({"_id": leave_id})
    return jsonify({"message": "Leave request deleted."})

@app.route('/api/leave/<leave_id>', methods=['PUT'])"""

if "def delete_leave(" not in app_text:
    app_text = app_text.replace("@app.route('/api/leave/<leave_id>', methods=['PUT'])", leave_delete)

exports_code = """
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
"""

if "export_students" not in app_text:
    app_text = app_text.replace("# =====================================================================\n# AUTH ROUTES", exports_code)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_text)

# Patching reports_generator.py !!
reports_file = r'c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\backend\reports_generator.py'
with open(reports_file, 'r', encoding='utf-8') as f:
    rep_text = f.read()

students_pdf = """
        if report_type == 'students':
            headers = ["Reg Number", "Name", "Room", "Course"]
            col_widths = [1.2*inch, 2.5*inch, 1.0*inch, 2.0*inch]
            rows = [[Paragraph(h, header_style) for h in headers]]
            for item in data:
                rows.append([
                    Paragraph(item.get('register_number', ''), body_style),
                    Paragraph(item.get('name', ''), body_style),
                    Paragraph(item.get('room_number', ''), body_style),
                    Paragraph(item.get('course', ''), body_style)
                ])
        elif report_type == 'daily':"""

if "report_type == 'students':" not in rep_text:
    rep_text = rep_text.replace("if report_type == 'daily':", students_pdf)

students_excel = """
        if report_type == 'students':
            headers = ["Reg Number", "Name", "Room", "Course", "Email", "Mobile"]
            ws.append(headers)
            for item in data:
                ws.append([
                    item.get('register_number', ''),
                    item.get('name', ''),
                    item.get('room_number', ''),
                    item.get('course', ''),
                    item.get('email', ''),
                    item.get('mobile', '')
                ])
        elif report_type == 'daily':"""

if "headers = [\"Reg Number\"" not in rep_text:
    rep_text = rep_text.replace("if report_type == 'daily':", students_excel)

with open(reports_file, 'w', encoding='utf-8') as f:
    f.write(rep_text)

print("Backend endpoints attached!")
