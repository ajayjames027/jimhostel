import shutil
import os

source_dir = r"C:\Users\ajayj\.gemini\antigravity\brain\1dafda8c-3f5e-4ae9-9ae2-30f04a510182"
dest_dir = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\public"

# The 3 newest files
shutil.copy(os.path.join(source_dir, "media__1789850425475.png"), os.path.join(dest_dir, "crest.png"))
shutil.copy(os.path.join(source_dir, "media__1789850530336.jpg"), os.path.join(dest_dir, "fwt.jpg"))
shutil.copy(os.path.join(source_dir, "media__1789850641595.jpg"), os.path.join(dest_dir, "bg.jpg"))

print("Assets copied successfully via script.")
