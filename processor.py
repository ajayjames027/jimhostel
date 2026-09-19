import re
import ast

def process():
    # Read the text
    with open("extracted.txt", "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    old_ii_mba_raw = [
        ("DARWIN INFANT RAAJ P", "A1", "9025778062"),
        ("JASON HANSEL SAMUEL J", "A1", "9629080707"),
        ("SANJEEV KUMAR", "A1", "9788145265"),
        ("JAVANSKER J", "A1", "7358912053"),
        ("VISHWANATHAN I", "A1", "7397101696"),
        ("ABISHAK RAJ S", "A1", "8778672197"),
        ("PRAVEENRAJ R", "A2", "9944204775"),
        ("EDISAN", "A2", "9791852919"),
        ("DICKSON D", "A2", "9344337927"),
        ("DANIEL A", "A2", "9342734528"),
        ("NITHISH M", "A2", "8608350046"),
        ("JANICK ANTO", "A2", "9791601172"),
        ("KISHORE KUMAR V", "A3", "8220207197"),
        ("MILAN SHIJOE J", "A3", "9087570647"),
        ("AKILAN SEBASTIN V", "A3", "6382442388"),
        ("RENO SINGAR X", "A3", "9585957204"),
        ("ANTO JEFFIN J", "A3", "7339153605"),
        ("KEVIN JOSHVA S", "A3", "9843851625"),
        ("VENKATESHWAR", "A4", "9944882503"),
        ("YUVARAJAN R A", "A4", "6385377743"),
        ("RUBAN A", "A4", "8072701241"),
        ("SUNIL SANGEETH J", "A4", "9025801784"),
        ("ROBIN J", "A4", "7708051236"),
        ("GODWINGINUS A", "A4", "8667044995"),
        ("ASWIN R", "A5", "9042210699"),
        ("ARMEL", "A5", "7397527914"),
        ("TENNIS DASS M", "A5", "7094624774"),
        ("GABRIEL THANGAM SEBASTIAN", "A5", "9840344348"),
        ("INFANT TOM F", "A5", "9344250771"),
        ("ABITHEJ P", "A5", "7418393614"),
        ("VELANGANNI SELVARAJ S", "A6", "7010850801"),
        ("ANTONY GNANA AAKASH A", "A6", "7418781972"),
        ("JEGAN A", "A6", "8610063279"),
        ("JACK J FERNANDEZ", "A6", "9345764068"),
        ("RUBANRAJ G", "A6", "9952820710"),
        ("ROSHAN J", "A6", "7598042356"),
        ("REJI JEGAN V", "B1", "8248496882"),
        ("JINOSOBAN M", "B1", "9486744865"),
        ("GAJA BALAJI", "B1", "9842499533"),
        ("SUJET RAJA S", "B1", "8778294332"),
        ("PRAVIN PON", "B1", "8925451036"),
        ("SUDHARSAN REDDY R", "B1", "7598633818"),
        ("HARI SANKARAN R", "B5", "7904254696"),
        ("VALAN J", "B5", "9677860013"),
        ("JANARIUS", "B5", "7099809937")
    ]
    
    old_i_mba_raw = [
        ("NIVONE PRABAKARAN", "B2", "JIM2620002", "9342429316"),
        ("PRAVEEN KUMAR S", "B2", "JIM2620007", "8754159757"),
        ("DEEPAK XAVIER S", "B2", "JIM2620013", "9087102725"),
        ("SUJITH J", "B2", "JIM2620016", "9344105671"),
        ("ESTAN J", "B2", "JIM2620020", "9524340209"),
        ("GOKUL V", "B2", "JIM2620024", "8870841494"),
        ("HARISH RAGAVENDRA", "B3", "JIM2620030", "8148098831"),
        ("ROSHAN J", "B3", "JIM2620034", "7708982072"),
        ("SARON TONI SELVAN", "B3", "JIM2620043", "9344177810"),
        ("M NAVEEN PRASAD", "B3", "JIM2620050", "9600345535"),
        ("PREMKALYAAN V", "B3", "JIM2620057", "9384138338"),
        ("ALEX A", "B3", "JIM2620114", "9150874031"),
        ("R KAUSHIK", "B4", "JIM2620157", "7598663277"),
        ("GOPI S", "B4", "JIM2620129", "7538882926"),
        ("S ASWIN", "B4", "JIM2620221", "8610245505"),
        ("ALEXIN PIO S", "B4", "JIM2620265", "7200189645"),
        ("THOMAS DANIEL S", "B4", "JIM2620207", "7708116381"),
        ("ANTO BRIGHTEN J", "B4", "JIM2620276", "7373630552"),
        ("Engine Britto", "B4", "JIM2620280", "9876543201"),
        ("Varun", "B4", "JIM2620285", "9876543202"),
        ("JONES HARISH P", "B5", "JIM2620085", "7824038046"),
        ("V R JUDE MICHAEL", "B5", "JIM2620143", "9790245562"),
        ("LEOMARAN P", "B5", "JIM2620253", "9876543203"),
        ("HARIPRAKASH B", "B5", "JIM2620296", "9876543204"),
        ("LEONI RAJA SINGH D", "B6", "JIM2620118", "8973562393"),
        ("ANTO ABINESH V", "B6", "JIM2620136", "9942321421"),
        ("JOE CANICE VALAN E", "B6", "JIM2620140", "9626497731"),
        ("DANIAL J", "B6", "JIM2620141", "8300831283"),
        ("JAI BALAJEE G", "B8", "JIM2620146", "7010182048"),
        ("JIFFIN JUDE A", "B8", "JIM2620224", "9600073255"),
        ("ALVIS JOY A", "B8", "JIM2620226", "9092381365"),
        ("MOVIN RAJ I", "B8", "JIM2620084", "9043275398"),
        ("SUBASHCHANDRABO", "B8", "JIM2620247", "8778193352")
    ]
    
    def find_mapping(name, is_i_mba):
        n = name.lower()
        if is_i_mba:
            for on, rom, reg, mob in old_i_mba_raw:
                if on.lower()[:5] == n[:5] or n in on.lower() or on.lower() in n:
                    return reg, mob
            # Fallback for new students
            return "JIM2620999", "9999999999"
        else:
            for on, rom, mob in old_ii_mba_raw:
                if on.lower()[:5] == n[:5] or n in on.lower() or on.lower() in n:
                    return mob
            return "9999999999"

    ii_mba = []
    i_mba = []
    
    # Simple regex to capture: sl_no room class name
    cnt = 0
    buffer = ""
    for line in lines:
        line = line.strip()
        m = re.match(r'^(\d+)\s+([A-B]\d)\s+(I{1,2}\s+MBA)\s+(.+)', line)
        if m:
            sl, room, cls, name = m.groups()
            name = name.strip()
            # remove trailing numbers like ' 6' or ' 5' isolated
            name = re.sub(r'\s+\d+$', '', name)
            if cls == "II MBA":
                ii_mba.append((name, room, find_mapping(name, False)))
            else:
                reg, mob = find_mapping(name, True)
                i_mba.append((name, room, reg, mob))
        else:
            # check if it's a split name 
            if line and not line.isdigit() and "Total" not in line and "MBA" not in line and "BOYS" not in line and "SL.NO" not in line:
                # append to previous
                pass

    with open("seed_replacement.py", "w") as f:
        f.write('students_ii_mba_raw = [\n')
        for i in ii_mba:
            f.write(f'    {repr(i)},\n')
        f.write(']\n\n')
        f.write('students_i_mba_raw = [\n')
        for i in i_mba:
            f.write(f'    {repr(i)},\n')
        f.write(']\n')

if __name__ == "__main__":
    process()
