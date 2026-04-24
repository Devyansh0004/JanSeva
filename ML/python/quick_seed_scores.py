"""
Quick seed script: 
  1. Seeds volunteerscores for all volunteers
  2. Copies villagescores -> villageScores (fixes collection name mismatch)
  3. Adds healthScore/foodScore/educationScore/shelterScore to any villageScores docs missing them
"""
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import random
import datetime

MONGO_URI = 'mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva'

SKILLS = ['First Aid', 'Cooking', 'Driving', 'Teaching', 'Medical', 'Counselling', 'Construction', 'IT Support', 'Logistics', 'Translation']
SKILL_WEIGHTS = {
    'Medical': 1.0, 'First Aid': 0.9, 'Counselling': 0.8,
    'Teaching': 0.65, 'Construction': 0.55, 'Cooking': 0.50,
    'Logistics': 0.45, 'Driving': 0.40, 'Translation': 0.25, 'IT Support': 0.15
}

def compute_tier(score):
    if score >= 80: return 'A'
    if score >= 60: return 'B'
    if score >= 40: return 'C'
    return 'D'

def main():
    client = MongoClient(MONGO_URI)
    db = client.janseva

    # ── 1. Seed volunteerscores ──────────────────────────────────────────────
    volunteers = list(db.volunteers.find())
    print(f"Found {len(volunteers)} volunteers. Seeding scores...")

    db.volunteerscores.drop()

    score_docs = []
    for v in volunteers:
        skills = v.get('skills', random.sample(SKILLS, 3))
        skill_score = round(sum(SKILL_WEIGHTS.get(s, 0.2) for s in skills) / max(len(skills), 1) * 100, 2)
        experience_score = round(min(v.get('completedRequests', 0) * 2, 40) + v.get('rating', 3.0) * 4, 2)
        reliability_score = round(random.uniform(30, 90), 2)
        total_score = round((skill_score * 0.4) + (experience_score * 0.35) + (reliability_score * 0.25), 2)
        tier = compute_tier(total_score)
        score_docs.append({
            'volunteerId': v['userId'],
            'volunteerProfileId': v['_id'],
            'skillScore': skill_score,
            'experienceScore': experience_score,
            'reliabilityScore': reliability_score,
            'totalScore': total_score,
            'tier': tier,
            'skills': skills,
            'computedAt': datetime.datetime.now(datetime.UTC),
        })

    if score_docs:
        db.volunteerscores.insert_many(score_docs)
    print(f"  -> Inserted {len(score_docs)} volunteer score docs.")

    # ── 2. Fix collection name: villagescores -> villageScores ───────────────
    # The Python seeder wrote to 'villagescores' but JS reads 'villageScores'
    lowercase_docs = list(db['villagescores'].find())
    if lowercase_docs:
        print(f"Found {len(lowercase_docs)} docs in 'villagescores' (lowercase). Copying to 'villageScores'...")
        # Add missing sector scores if absent
        for doc in lowercase_docs:
            doc.pop('_id', None)
            for field in ['healthScore', 'foodScore', 'educationScore', 'shelterScore']:
                if field not in doc or doc[field] is None:
                    doc[field] = random.randint(20, 90)
        
        # Upsert into correct collection
        ops = []
        for doc in lowercase_docs:
            filter_key = {}
            if 'campaignId' in doc and 'villageId' in doc:
                filter_key = {'campaignId': doc['campaignId'], 'villageId': doc['villageId']}
            elif 'villageId' in doc:
                filter_key = {'villageId': doc['villageId']}
            else:
                continue
            ops.append(UpdateOne(filter_key, {'$set': doc}, upsert=True))
        
        if ops:
            result = db['villageScores'].bulk_write(ops)
            print(f"  -> Upserted {result.upserted_count} + modified {result.modified_count} docs into 'villageScores'.")
    else:
        print("No docs in 'villagescores' (lowercase). Skipping copy.")

    # ── 3. Patch existing villageScores missing sector scores ────────────────
    missing_sector = list(db['villageScores'].find({
        '$or': [
            {'healthScore': {'$exists': False}},
            {'foodScore': {'$exists': False}},
            {'educationScore': {'$exists': False}},
            {'shelterScore': {'$exists': False}},
        ]
    }))
    if missing_sector:
        print(f"Patching {len(missing_sector)} villageScores docs missing sector scores...")
        patch_ops = []
        for doc in missing_sector:
            patch_ops.append(UpdateOne(
                {'_id': doc['_id']},
                {'$set': {
                    'healthScore': doc.get('healthScore', random.randint(20, 90)),
                    'foodScore': doc.get('foodScore', random.randint(20, 90)),
                    'educationScore': doc.get('educationScore', random.randint(20, 90)),
                    'shelterScore': doc.get('shelterScore', random.randint(20, 90)),
                }}
            ))
        db['villageScores'].bulk_write(patch_ops)
        print(f"  -> Patched {len(patch_ops)} docs.")
    else:
        print("All villageScores docs already have sector scores.")

    # ── 4. Summary ────────────────────────────────────────────────────────────
    total_vs = db['villageScores'].count_documents({})
    total_scores = db.volunteerscores.count_documents({})
    print(f"\n✅ Done! volunteerscores: {total_scores} | villageScores: {total_vs}")
    client.close()

if __name__ == '__main__':
    main()
