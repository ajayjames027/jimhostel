import re

app_py = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\backend\app.py"
with open(app_py, "r", encoding="utf-8") as f:
    text = f.read()

block_to_remove = """@app.route('/api/my-leaves', methods=['GET'])
@token_required
def get_my_leaves(current_user):
    db = get_db()
    leaves = list(db["leave_requests"].find({"student_id": current_user["username"]}).sort([("timestamp", -1)]))
    for l in leaves:
        l["_id"] = str(l["_id"])
    return jsonify(leaves)"""

# Find all occurrences of the block
occurrences = text.count(block_to_remove)

if occurrences > 1:
    # We want to keep exactly one. So we replace it all with a unique token, then put one back.
    # Or just use replace with max occurrences.
    text = text.replace(block_to_remove, "", occurrences - 1)
    
    with open(app_py, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Removed {occurrences - 1} duplicate blocks")
else:
    print(f"Found {occurrences} block(s), no action taken")
