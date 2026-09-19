import re

def update_seed():
    with open("seed.py", "r") as f:
        content = f.read()
        
    with open("seed_replacement.py", "r") as f:
        replacement = f.read()

    new_content = re.sub(
        r'# Cohort 1: II MBA Students.*?\]\n', 
        '# Cohort 1: II MBA Students (Boys Hostel - Toulouse Arena)\n' + replacement + '\n', 
        content, 
        flags=re.DOTALL
    )
    
    # Update room_list
    new_content = new_content.replace(
        '"B1", "B2", "B3", "B4", "B5", "B6", "B8"',
        '"B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"'
    )
    
    with open("seed.py", "w") as f:
        f.write(new_content)

if __name__ == "__main__":
    update_seed()
