import os
import pypdf

def extract_pdf():
    pdf_path = "c:\\Users\\ajayj\\OneDrive\\Documents\\JIM_Hostel\\1-JIM - Google Drive.pdf"
    if not os.path.exists(pdf_path):
        print("File not found.")
        return
    
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf()
