import os

files_to_patch = [
    r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\StudentManagement.jsx",
    r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\RoomManagement.jsx"
]

for file_path in files_to_patch:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            
        # Replace the hardcoded string with dynamic API configuration
        text = text.replace("'http://localhost:5000/api", "API.defaults.baseURL + '")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)

print("Dynamic route paths patched!")
