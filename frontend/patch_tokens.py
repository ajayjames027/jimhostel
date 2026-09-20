import os

for file_name in [r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\StudentManagement.jsx", r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src\pages\Admin\RoomManagement.jsx"]:
    with open(file_name, "r", encoding="utf-8") as f:
        text = f.read()
    
    text = text.replace("localStorage.getItem('token')", "localStorage.getItem('jim_token')")
    
    with open(file_name, "w", encoding="utf-8") as f:
        f.write(text)
print("Patch applied for local storage tokens.")
