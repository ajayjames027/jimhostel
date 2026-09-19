import os
def patch():
    with open("app.py", "r") as f:
        content = f.read()
        
    new_code = """
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
                    "dinner": item.get('dinner', False)
                }},
                upsert=True
            )
        return jsonify({"message": "Food poll updated successfully."})
        
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
"""
    
    if "MESS FOOD POLL" not in content:
        content = content.replace("if __name__ == '__main__':", new_code)
        with open("app.py", "w") as f:
            f.write(content)
            
if __name__ == "__main__":
    patch()
