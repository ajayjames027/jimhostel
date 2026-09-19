import os

def patch():
    with open("app.py", "r") as f:
        content = f.read()
        
    config_routes = """
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
"""
    
    if "/api/food-poll/config" not in content:
        content = content.replace(
            "@app.route('/api/food-poll/summary/<date>', methods=['GET'])",
            config_routes + "\n@app.route('/api/food-poll/summary/<date>', methods=['GET'])"
        )
        with open("app.py", "w") as f:
            f.write(content)
            
if __name__ == "__main__":
    patch()
