from pymongo import MongoClient

db = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').janseva

# Fix all NGO profiles: set approved and profile complete
res = db.ngos.update_many(
    {},
    {'$set': {'approvalStatus': 'approved', 'isProfileComplete': True}}
)
print(f"Updated {res.modified_count} NGO profiles to approved + complete")

# Verify Seva Foundation
seva = db.ngos.find_one({'name': 'Seva Foundation'})
if seva:
    print(f"Seva Foundation: approvalStatus={seva.get('approvalStatus')} | isProfileComplete={seva.get('isProfileComplete')}")
    
    # Check how many campaigns exist for it
    camp_count = db.campaigns.count_documents({'ngoId': seva['_id']})
    print(f"Seva Foundation campaigns in DB: {camp_count}")
    
    # List them
    camps = list(db.campaigns.find({'ngoId': seva['_id']}, {'title': 1, 'status': 1}))
    for c in camps:
        print(f"  - {c['title']} | status={c['status']}")
else:
    print("ERROR: Seva Foundation NGO not found!")
