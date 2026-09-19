from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_student_manual():
    doc = SimpleDocTemplate("Student_Portal_Manual.pdf", pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'MainTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor('#1E3A8A'), alignment=1, spaceAfter=20
    )
    sub_title_style = ParagraphStyle(
        'SubTitle', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#2563EB'), spaceBefore=15, spaceAfter=10
    )
    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'], fontName='Helvetica', fontSize=11, leading=16, spaceAfter=10
    )
    bold_style = ParagraphStyle(
        'BoldBody', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11, leading=16, spaceAfter=10
    )
    
    story = []
    
    story.append(Paragraph("JIM Boys Hostel - Student Portal Manual", title_style))
    story.append(Paragraph("Welcome to the new digital management system for JIM Boys Hostel! This platform simplifies your daily interactions for Mess polling, Maintenance requests, and Leaves.", body_style))
    
    story.append(Paragraph("1. How to Login", sub_title_style))
    story.append(Paragraph("<b>URL:</b> Access the portal link shared by your AD on your phone.", body_style))
    story.append(Paragraph("<b>Username Format:</b> roomnumber_firstname (Use Lowercase)", body_style))
    story.append(Paragraph("<i>Example 1:</i> If you are <b>DARWIN INFANT RAAJ P</b> in room <b>A1</b>, your Username is: <b>a1_darwin</b>", body_style))
    story.append(Paragraph("<i>Example 2:</i> If you are <b>DEEPAK XAVIER S</b> in room <b>B7</b>, your Username is: <b>b7_deepak</b>", body_style))
    story.append(Paragraph("<b>Default Global Password:</b> jim123", bold_style))
    story.append(Paragraph("Note: If the system cannot find you, try variations of your first name (as printed strictly above on your official roster!).", body_style))
    
    story.append(Paragraph("2. Mess Food Polling (Important)", sub_title_style))
    story.append(Paragraph("For weekends or long holidays, the AD will launch a 'Multi-Day Food Poll'.", body_style))
    story.append(Paragraph("- You will see blocks for the requested days (e.g. Saturday & Sunday).", body_style))
    story.append(Paragraph("- Tap the Coffee (Breakfast), Sun (Lunch), or Moon (Dinner) icons if you intend to eat in the mess.", body_style))
    story.append(Paragraph("- Once you click <b>'Lock Initial Meal Choices System-Wide'</b>, your response is <b>Locked</b> and cannot be edited. It goes directly to the Master Consolidated count. Please be sure!", body_style))
    
    story.append(Paragraph("3. Applying for Leave", sub_title_style))
    story.append(Paragraph("- Submit the exact dates (From and To) and a brief reason.", body_style))
    story.append(Paragraph("- Once you hit submit, it automatically redirects you to WhatsApp to send a pre-filled instant notification directly to the AD's number (7010437314) for fast approval.", body_style))
    story.append(Paragraph("- Check back on your dashboard to see if your leave is marked <b>'Approved'</b>.", body_style))
    
    story.append(Paragraph("4. Maintenance Requests", sub_title_style))
    story.append(Paragraph("- If you have a broken fan, leaking tap, etc., scroll to 'Report Maintenance'.", body_style))
    story.append(Paragraph("- You can type the issue and even optionally snap/attach a photo from your phone.", body_style))
    story.append(Paragraph("- The AD and the maintenance team will instantly receive this and process fixing it. You can see when it is marked 'Complete'.", body_style))
    
    story.append(Paragraph("5. Real-time Attendance History", sub_title_style))
    story.append(Paragraph("Your dashboard allows you to see the exact time the AD or Warden took attendance, logging whether you were Present, Absent, or Late.", body_style))
    
    story.append(Spacer(1, 40))
    story.append(Paragraph("Keep this document safe and always ensure your meal counts are submitted accurately so food waste is avoided. Thank you for your cooperation!", body_style))
    
    doc.build(story)
    print("PDF GENERATION COMPLETE")

if __name__ == '__main__':
    create_student_manual()
