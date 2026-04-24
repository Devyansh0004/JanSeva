"""
Comprehensive fix: 
  - For every campaign with no villageScores, create 3-5 realistic Indian village entries
  - For every campaign with no registrations, register 6-10 scored volunteers
  - Uses real Indian village names and district/state data
"""
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import random, datetime

MONGO_URI = 'mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva'

INDIAN_VILLAGES = [
    ("Rampur", "Uttar Pradesh", "Bareilly"),
    ("Kheda", "Gujarat", "Anand"),
    ("Bari", "Rajasthan", "Dholpur"),
    ("Nandgaon", "Maharashtra", "Nashik"),
    ("Palasner", "Maharashtra", "Pune"),
    ("Chandpur", "Bihar", "Bhojpur"),
    ("Sultanpur", "Uttar Pradesh", "Sultanpur"),
    ("Devgarh", "Rajasthan", "Pali"),
    ("Jharia", "Jharkhand", "Dhanbad"),
    ("Kotra", "Rajasthan", "Udaipur"),
    ("Morkheda", "Madhya Pradesh", "Khandwa"),
    ("Badarpur", "Assam", "Karimganj"),
    ("Tigiria", "Odisha", "Cuttack"),
    ("Narhar", "Rajasthan", "Jhunjhunu"),
    ("Kushinagar", "Uttar Pradesh", "Kushinagar"),
    ("Silapathar", "Assam", "Dhemaji"),
    ("Tundi", "Jharkhand", "Dhanbad"),
    ("Faridpur", "Bihar", "Ara"),
    ("Mandla", "Madhya Pradesh", "Mandla"),
    ("Phulambri", "Maharashtra", "Aurangabad"),
    ("Kharsia", "Chhattisgarh", "Raigarh"),
    ("Ambikapur", "Chhattisgarh", "Surguja"),
    ("Saraikela", "Jharkhand", "Saraikela"),
    ("Govindpur", "Jharkhand", "Dhanbad"),
    ("Bargaon", "Odisha", "Sambalpur"),
]

DOMAINS = [
    'Healthcare & Wellness',
    'Food Security & Distribution',
    'Education & Mentorship',
    'Shelter & Caregiving'
]

def random_village_score():
    score = random.randint(30, 92)
    return {
        'overallVulnerabilityScore': score,
        'healthScore': random.randint(20, 95),
        'foodScore': random.randint(20, 95),
        'educationScore': random.randint(20, 95),
        'shelterScore': random.randint(20, 95),
        'vulnerabilityClass': 'CRITICAL' if score > 75 else ('HIGH' if score > 65 else ('MEDIUM' if score > 40 else 'LOW')),
    }

def main():
    client = MongoClient(MONGO_URI)
    db = client.janseva

    campaigns = list(db.campaigns.find({}))
    print(f"Total campaigns: {len(campaigns)}")

    # Get all volunteer scores, sorted by totalScore desc
    vol_scores = list(db['volunteerscores'].find({}).sort('totalScore', -1))
    print(f"Total volunteer scores: {len(vol_scores)}")

    if not vol_scores:
        print("ERROR: No volunteer scores found. Run quick_seed_scores.py first.")
        return

    villages_used = random.sample(INDIAN_VILLAGES, len(INDIAN_VILLAGES))  # shuffle

    vs_ops = []
    reg_ops = []
    camp_updates = []

    for i, camp in enumerate(campaigns):
        cid = camp['_id']
        
        # Check if already has villageScores
        existing_vs = db['villageScores'].count_documents({'campaignId': cid})
        existing_regs = db['campaignregistrations'].count_documents({'campaignId': cid})

        # ── Seed villageScores if missing ────────────────────────────
        if existing_vs == 0:
            domain = random.choice(DOMAINS)
            num_villages = random.randint(3, 5)
            vill_sample = random.sample(villages_used, min(num_villages, len(villages_used)))
            
            for v in vill_sample:
                vname, state, district = v
                vid = f"VIL_{vname.upper()}_{random.randint(100,999)}"
                scores = random_village_score()
                vs_ops.append({
                    'campaignId': cid,
                    'villageId': vid,
                    'villageName': vname,
                    'state': state,
                    'district': district,
                    'population': random.randint(500, 5000),
                    'primaryDomain': domain,
                    'computedAt': datetime.datetime.now(datetime.UTC),
                    **scores
                })

        # ── Seed registrations if missing ────────────────────────────
        if existing_regs == 0:
            num_vols = random.randint(6, 10)
            selected = random.sample(vol_scores, min(num_vols, len(vol_scores)))
            
            for vs in selected:
                reg_ops.append({
                    'campaignId': cid,
                    'volunteerId': vs['volunteerId'],
                    'status': 'registered',
                    'registeredAt': datetime.datetime.now(datetime.UTC),
                    'matchScore': round(vs.get('totalScore', 60), 2),
                    'assignedVillageId': None,
                    'createdAt': datetime.datetime.now(datetime.UTC),
                    'updatedAt': datetime.datetime.now(datetime.UTC),
                })
            
            vol_ids = [vs['volunteerId'] for vs in selected]
            camp_updates.append(UpdateOne(
                {'_id': cid},
                {'$addToSet': {'volunteers': {'$each': vol_ids}}}
            ))

    # Bulk write
    if vs_ops:
        db['villageScores'].insert_many(vs_ops)
        print(f"Inserted {len(vs_ops)} villageScores docs")
    else:
        print("All campaigns already have villageScores")

    if reg_ops:
        db['campaignregistrations'].insert_many(reg_ops)
        print(f"Inserted {len(reg_ops)} campaign registrations")
    else:
        print("All campaigns already have registrations")

    if camp_updates:
        db.campaigns.bulk_write(camp_updates)
        print(f"Updated {len(camp_updates)} campaign volunteer arrays")

    # Final summary
    total_vs = db['villageScores'].count_documents({})
    total_regs = db['campaignregistrations'].count_documents({})
    print(f"\nDone! villageScores total: {total_vs} | campaignregistrations total: {total_regs}")

    # Spot check first campaign
    camp = campaigns[0]
    cid = camp['_id']
    vs = db['villageScores'].count_documents({'campaignId': cid})
    regs = db['campaignregistrations'].count_documents({'campaignId': cid})
    sample_vs = db['villageScores'].find_one({'campaignId': cid})
    print(f"\nCampaign '{camp.get('title')}' ({cid}):")
    print(f"  villageScores: {vs} | registrations: {regs}")
    if sample_vs:
        print(f"  Sample village: {sample_vs.get('villageName')} | health={sample_vs.get('healthScore')} food={sample_vs.get('foodScore')}")

    client.close()

if __name__ == '__main__':
    main()
