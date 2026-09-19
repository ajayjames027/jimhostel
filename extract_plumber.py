import os
import pdfplumber

def extract_pdf():
    pdf_path = "c:\\Users\\ajayj\\OneDrive\\Documents\\JIM_Hostel\\1-JIM - Google Drive.pdf"
    if not os.path.exists(pdf_path):
        print("File not found.")
        return
    
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        with open("extracted.txt", "w", encoding="utf-8") as f:
            f.write(text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf()
