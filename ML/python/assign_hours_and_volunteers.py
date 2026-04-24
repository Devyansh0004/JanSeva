"""
1. Assign random volunteering hours (50–500) to all volunteers
2. Recompute volunteer scores based on hours + rating
3. For each campaign, assign 30–40 volunteers via campaignregistrations
"""
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import random, datetime

MONGO_URI = 'mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva'

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

    # ── 1. Assign random hours & rating to volunteers ─────────────────────────
    volunteers = list(db.volunteers.find({}))
    print(f"Found {len(volunteers)} volunteers. Assigning random hours...")

    vol_ops = []
    for v in volunteers:
        hours = random.randint(50, 500)
        rating = round(random.uniform(2.5, 5.0), 1)
        completed = random.randint(5, 80)
        vol_ops.append(UpdateOne(
            {'_id': v['_id']},
            {'$set': {
                'volunteeringHours': hours,
                'rating': rating,
                'completedRequests': completed,
                'isAvailable': random.random() > 0.2,
            }}
        ))

    if vol_ops:
        db.volunteers.bulk_write(vol_ops)
        print(f"  -> Updated {len(vol_ops)} volunteers with hours/rating/completedRequests")

    # ── 2. Recompute volunteer scores ─────────────────────────────────────────
    print("Recomputing volunteer scores...")
    volunteers = list(db.volunteers.find({}))  # refetch with updated data

    db.volunteerscores.drop()
    score_docs = []
    for v in volunteers:
        skills = v.get('skills', [])
        hours = v.get('volunteeringHours', 0)
        rating = v.get('rating', 3.0)
        completed = v.get('completedRequests', 0)

        skill_score = round(sum(SKILL_WEIGHTS.get(s, 0.2) for s in skills) / max(len(skills), 1) * 100, 2)
        # Experience score: hours (max 500h = 40pts) + completed (max 80 = 40pts) + rating (max 5 = 20pts)
        experience_score = round(
            min(hours / 500, 1.0) * 40 +
            min(completed / 80, 1.0) * 40 +
            (rating / 5.0) * 20,
            2
        )
        reliability_score = round(random.uniform(40, 95), 2)
        total_score = round((skill_score * 0.4) + (experience_score * 0.4) + (reliability_score * 0.2), 2)
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
    print(f"  -> Inserted {len(score_docs)} volunteer score docs")

    # Print tier distribution
    tiers = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
    for s in score_docs:
        tiers[s['tier']] += 1
    print(f"  Tier distribution: A={tiers['A']} B={tiers['B']} C={tiers['C']} D={tiers['D']}")

    # ── 3. Assign 30-40 volunteers to each campaign ───────────────────────────
    print("\nAssigning 30-40 volunteers per campaign...")

    campaigns = list(db.campaigns.find({}))
    vol_scores = list(db.volunteerscores.find({}).sort('totalScore', -1))

    # Get all volunteer userId list (from scores, sorted by score)
    all_vol_ids = [s['volunteerId'] for s in vol_scores]

    reg_ops_count = 0
    camp_update_ops = []

    for camp in campaigns:
        cid = camp['_id']
        existing = list(db.campaignregistrations.find({'campaignId': cid}, {'volunteerId': 1}))
        existing_ids = {str(r['volunteerId']) for r in existing}

        # How many more needed
        target = random.randint(30, 40)
        current_count = len(existing_ids)

        if current_count >= target:
            continue  # already has enough

        needed = target - current_count
        # Pick from scored volunteers not already registered
        candidates = [vid for vid in all_vol_ids if str(vid) not in existing_ids]
        selected = random.sample(candidates, min(needed, len(candidates)))

        if not selected:
            continue

        new_regs = []
        for vid in selected:
            score_doc = next((s for s in vol_scores if str(s['volunteerId']) == str(vid)), None)
            new_regs.append({
                'campaignId': cid,
                'volunteerId': vid,
                'status': 'registered',
                'registeredAt': datetime.datetime.now(datetime.UTC),
                'matchScore': round(score_doc['totalScore'], 2) if score_doc else round(random.uniform(40, 90), 2),
                'assignedVillageId': None,
                'createdAt': datetime.datetime.now(datetime.UTC),
                'updatedAt': datetime.datetime.now(datetime.UTC),
            })

        if new_regs:
            db.campaignregistrations.insert_many(new_regs, ordered=False)
            reg_ops_count += len(new_regs)

        # Update campaign.volunteers array
        camp_update_ops.append(UpdateOne(
            {'_id': cid},
            {'$addToSet': {'volunteers': {'$each': selected}}}
        ))

    if camp_update_ops:
        db.campaigns.bulk_write(camp_update_ops)

    print(f"  -> Added {reg_ops_count} new registrations across {len(camp_update_ops)} campaigns")

    # ── 4. Summary ────────────────────────────────────────────────────────────
    total_regs = db.campaignregistrations.count_documents({})
    sample_vol = db.volunteers.find_one({'volunteeringHours': {'$gt': 0}})
    sample_user = db.users.find_one({'_id': sample_vol['userId']}) if sample_vol else None
    print(f"\nSummary:")
    print(f"  Total campaign registrations: {total_regs}")
    print(f"  Total volunteer scores: {db.volunteerscores.count_documents({})}")
    if sample_vol and sample_user:
        print(f"  Sample volunteer: {sample_user.get('name')} | hours={sample_vol.get('volunteeringHours')} | rating={sample_vol.get('rating')}")

    client.close()
    print("\nDone!")

if __name__ == '__main__':
    main()
