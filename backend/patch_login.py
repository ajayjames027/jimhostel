import os
import re

def patch():
    with open("app.py", "r") as f:
        content = f.read()
        
    student_login_code = """
    db = get_db()
    user = db["users"].find_one({"username": username})
    
    if not user:
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
    """

    old_login_code = """
    db = get_db()
    user = db["users"].find_one({"username": username})
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'message': 'Invalid username or password'}), 401
"""
    # Just replace it roughly
    if "if password == \"jim123\":" not in content:
        # manual replace
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'user = db["users"].find_one({"username": username})' in line:
                # Replace the block
                # Find where it ends
                pass
                
        # Better approach: Regex
        new_c = re.sub(
            r'    db = get_db\(\)\n    user = db\["users"\].find_one\({"username": username}\)\n    \n    if not user or not bcrypt\.checkpw\(password\.encode\(\'utf-8\'\), user\[\'password_hash\'\]\.encode\(\'utf-8\'\)\):\n        return jsonify\(\{\'message\': \'Invalid username or password\'\}\), 401',
            student_login_code.strip('\n'),
            content,
            flags=re.MULTILINE
        )
        
        # also update food poll endpoint to let students POST their own food!
        new_c = new_c.replace(
            "@app.route('/api/food-poll/<date>', methods=['GET', 'POST'])\n@token_required\ndef food_poll(current_user, date):",
            "@app.route('/api/food-poll/<date>', methods=['GET', 'POST'])\n@token_required\ndef food_poll(current_user, date):"
        )
        # Because we didn't restrict role on food-poll, @token_required is enough. For student saving their own:
        # In food-poll POST, we loop records. Student sends record with their own ID. That's fine! 
        # For leaves, /api/leave POST has @token_required... so students can already post their leaves!
        
        with open("app.py", "w") as f:
            f.write(new_c)

if __name__ == "__main__":
    patch()
