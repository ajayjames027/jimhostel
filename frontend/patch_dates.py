import os
import re

directory = r"c:\Users\ajayj\OneDrive\Documents\JIM_Hostel\frontend\src"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace empty toLocaleDateString() with toLocaleDateString('en-GB')
            content = re.sub(r'\.toLocaleDateString\(\)', ".toLocaleDateString('en-GB')", content)
            # Replace empty toLocaleString() with toLocaleString('en-GB')
            content = re.sub(r'\.toLocaleString\(\)', ".toLocaleString('en-GB')", content)
            # Replace specific 'en-US' configs with 'en-GB'
            content = content.replace("'en-US'", "'en-GB'")
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Date localized patch successfully applied to DD-MM-YYYY formats across all UI elements.")
