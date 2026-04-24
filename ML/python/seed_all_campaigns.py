import requests, datetime
from pymongo import MongoClient
import random

MONGO_URI = 'mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva'
db = MongoClient(MONGO_URI).janseva

seva_ngo = db.ngos.find_one({'name': 'Seva Foundation'})
if not seva_ngo:
    print('Seva Foundation NGO not found!'); exit(1)

seva_campaigns = list(db.campaigns.find({'ngoId': seva_ngo['_id']}))
print(f"Found {len(seva_campaigns)} campaigns for Seva Foundation")

all_vol_scores = list(db.volunteerscores.find({}).sort('totalScore', -1))
all_vol_ids = [s['volunteerId'] for s in all_vol_scores]

total_added = 0
for camp in seva_campaigns:
    cid = camp['_id']
    existing = list(db.campaignregistrations.find({'campaignId': cid}, {'volunteerId': 1}))
    existing_ids = {str(r['volunteerId']) for r in existing}
    
    if len(existing_ids) > 0:
        print(f"  {camp['title'][:40]}: already has {len(existing_ids)} volunteers, skipping.")
        continue

    # Need to add volunteers
    target = random.randint(30, 40)
    candidates = all_vol_ids.copy()
    random.shuffle(candidates)
    selected = candidates[:target]

    new_regs = []
    for vid in selected:
        score_doc = next((s for s in all_vol_scores if str(s['volunteerId']) == str(vid)), None)
        new_regs.append({
            'campaignId': cid, 'volunteerId': vid, 'status': 'registered',
            'registeredAt': datetime.datetime.now(datetime.UTC),
            'matchScore': round(score_doc['totalScore'], 2) if score_doc else round(random.uniform(40, 85), 2),
            'assignedVillageId': None,
            'createdAt': datetime.datetime.now(datetime.UTC),
            'updatedAt': datetime.datetime.now(datetime.UTC),
        })

    if new_regs:
        db.campaignregistrations.insert_many(new_regs, ordered=False)
        total_added += len(new_regs)
        print(f"  {camp['title'][:40]}: +{len(new_regs)} volunteers added.")

print(f"\nTotal registrations added: {total_added}")
