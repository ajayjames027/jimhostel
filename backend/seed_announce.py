import pymongo
import datetime

uri = "mongodb+srv://admin:admin123@cluster0.ixnibxv.mongodb.net/?retryWrites=true&w=majority"
client = pymongo.MongoClient(uri, tlsAllowInvalidCertificates=True)
db = client["jim_hostel"]

# Insert dummy announcements
anns = [
    {
        "message": "Welcome to the new JIM Hostel Automated Portal! Make sure to verify your profile tonight.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "author": "Dr. Joseph (Director)",
        "author_role": "Director"
    },
    {
        "message": "Routine Maintenance check for the South Wing starts tomorrow at 10 AM.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "author": "Admin System",
        "author_role": "Admin"
    }
]

db["announcements"].insert_many(anns)
print("Seeding announcements success!")
