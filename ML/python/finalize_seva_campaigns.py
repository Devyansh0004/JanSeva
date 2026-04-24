"""
1. Create the 5th Seva Foundation campaign (Multi-Domain, category='Other')
2. Seed VillageScores for all 5 new Seva campaigns from their Village docs
3. Register 30-40 volunteers per new campaign
"""
import requests, json, io, datetime
from pymongo import MongoClient, UpdateOne
from bson import ObjectId
import random

BASE = 'http://localhost:5000/api'
MONGO_URI = 'mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva'

# ── Login ──────────────────────────────────────────────────────────────────────
resp = requests.post(f'{BASE}/auth/login', json={'email': 'sevafoundation@gmail.com', 'password': 'Password@1234'})
resp_json = resp.json()
token = resp_json.get('data', {}).get('token') or resp_json.get('token')
if not token:
    print('Login failed:', resp.text); exit(1)
print('Logged in.')
headers = {'Authorization': f'Bearer {token}'}

# ── Create 5th campaign ────────────────────────────────────────────────────────
MULTI_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_M001,Jharia,Jharkhand,Dhanbad,8500,2024-05-01,68,1.5,25,2,32,45,55,35,18,0.15,38,42,58,28,7,52,3.2,65,72,38
VIL_M002,Bari,Rajasthan,Dholpur,5200,2024-05-01,55,1.8,35,2,42,52,48,28,15,0.2,45,50,52,24,6,45,2.8,55,65,32
VIL_M003,Govindpur,Jharkhand,Dhanbad,3800,2024-05-01,45,2.0,42,1,50,58,42,22,12,0.25,52,58,46,20,5,38,2.5,45,55,25
VIL_M004,Banswara,Rajasthan,Banswara,6800,2024-05-01,72,1.3,20,3,28,40,62,40,20,0.1,32,35,62,32,8,58,3.5,70,78,44
VIL_M005,Dumka,Jharkhand,Dumka,4500,2024-05-01,60,1.6,30,2,38,48,52,30,16,0.18,42,48,55,26,6,48,3.0,58,68,35
VIL_M006,Dantewada,Chhattisgarh,Dantewada,3200,2024-05-01,78,1.2,18,3,22,38,68,44,22,0.08,28,32,65,35,9,62,3.8,75,82,48
VIL_M007,Bijapur,Chhattisgarh,Bijapur,2900,2024-05-01,70,1.4,22,2,28,42,60,38,19,0.12,35,38,60,30,8,55,3.3,68,75,42"""

form_files = {
    'title': (None, 'Seva Integrated Village Aid 2024'),
    'description': (None, 'Comprehensive multi-domain relief across 7 of the most vulnerable villages in Jharkhand, Rajasthan, and Chhattisgarh — covering food, health, education, and shelter simultaneously. Domain-expert volunteers are matched to the villages most deficient in their specialty.'),
    'category': (None, 'Other'),
    'startDate': (None, (datetime.datetime.now() + datetime.timedelta(days=35)).strftime('%Y-%m-%d')),
    'endDate': (None, (datetime.datetime.now() + datetime.timedelta(days=65)).strftime('%Y-%m-%d')),
    'targetAmount': (None, '950000'),
    'isEmergency': (None, 'false'),
    'domainTargets': (None, json.dumps({
        'food': {'villages': 2, 'volunteers': 10},
        'medical': {'villages': 2, 'volunteers': 10},
        'education': {'villages': 2, 'volunteers': 8},
        'shelter': {'villages': 2, 'volunteers': 8},
    })),
    'survey': ('multi_domain_survey.csv', io.BytesIO(MULTI_CSV.strip().encode()), 'text/csv'),
}

r = requests.post(f'{BASE}/campaigns/with-survey', headers=headers, files=form_files)
data = r.json()
if r.ok:
    cid5 = data['data']['campaign']['_id']
    print(f"Created 5th campaign: {cid5} | villages={data['data'].get('villagesProcessed', 0)}")
else:
    print(f"FAILED 5th campaign: {data.get('message', r.text[:200])}"); cid5 = None

# ── Connect to MongoDB ─────────────────────────────────────────────────────────
db = MongoClient(MONGO_URI).janseva

# ── Find all 5 new Seva campaigns ─────────────────────────────────────────────
seva_ngo = db.ngos.find_one({'name': 'Seva Foundation'})
if not seva_ngo:
    print('Seva Foundation NGO not found!'); exit(1)

new_campaign_titles = [
    'Seva Food Security Drive 2024',
    'Seva Rural Education Mission',
    'Seva Shelter Restoration Camp',
    'Seva Rural Health Camp 2024',
    'Seva Integrated Village Aid 2024',
]
seva_campaigns = list(db.campaigns.find({'ngoId': seva_ngo['_id'], 'title': {'$in': new_campaign_titles}}))
print(f"\nFound {len(seva_campaigns)} Seva campaigns to process")

# ── Seed VillageScores for each campaign from Village docs ────────────────────
def get_vuln_class(score):
    if score >= 75: return 'CRITICAL'
    if score >= 55: return 'HIGH'
    if score >= 35: return 'MEDIUM'
    return 'LOW'

def get_primary_domain(m, f, e, s):
    scores = {'Medical': m, 'Food': f, 'Education': e, 'Shelter': s}
    return max(scores, key=scores.get)

for camp in seva_campaigns:
    cid = camp['_id']
    # Remove old scores
    db.villageScores.delete_many({'campaignId': cid})

    # Get village docs for this campaign
    villages = list(db.villages.find({'campaignId': cid}))
    if not villages:
        print(f"  {camp['title'][:40]}: no villages found, skipping VillageScores")
        continue

    score_docs = []
    for v in villages:
        m = v.get('medical', {}).get('score', 0) or 0
        f = v.get('food', {}).get('score', 0) or 0
        e = v.get('education', {}).get('score', 0) or 0
        s = v.get('shelter', {}).get('score', 0) or 0
        overall = v.get('overall_priority_score') or round((m + f + e + s) / 4, 2)

        score_docs.append({
            'campaignId': cid,
            'villageId': str(v.get('village_id', v.get('_id'))),
            'villageName': v.get('village_name', 'Unknown'),
            'state': v.get('state', ''),
            'district': v.get('district', ''),
            'population': v.get('population', 0),
            'healthScore': round(m, 2),
            'foodScore': round(f, 2),
            'educationScore': round(e, 2),
            'shelterScore': round(s, 2),
            'overallVulnerabilityScore': round(overall, 2),
            'vulnerabilityClass': get_vuln_class(overall),
            'primaryDomain': get_primary_domain(m, f, e, s),
            'computedAt': datetime.datetime.now(datetime.UTC),
        })

    if score_docs:
        db.villageScores.insert_many(score_docs)
        print(f"  {camp['title'][:40]}: {len(score_docs)} VillageScores inserted")

# ── Register 30-40 volunteers to each new Seva campaign ───────────────────────
all_vol_scores = list(db.volunteerscores.find({}).sort('totalScore', -1))
all_vol_ids = [s['volunteerId'] for s in all_vol_scores]

print(f"\nRegistering volunteers to {len(seva_campaigns)} campaigns...")
total_added = 0
for camp in seva_campaigns:
    cid = camp['_id']
    existing = list(db.campaignregistrations.find({'campaignId': cid}, {'volunteerId': 1}))
    existing_ids = {str(r['volunteerId']) for r in existing}

    target = random.randint(30, 40)
    needed = target - len(existing_ids)
    if needed <= 0:
        print(f"  {camp['title'][:40]}: already has {len(existing_ids)} volunteers")
        continue

    candidates = [vid for vid in all_vol_ids if str(vid) not in existing_ids]
    selected = random.sample(candidates, min(needed, len(candidates)))

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
        print(f"  {camp['title'][:40]}: +{len(new_regs)} volunteers (total={len(existing_ids)+len(new_regs)})")

print(f"\nTotal registrations added: {total_added}")
print("Done! Refresh the NGO Dashboard to see all 5 campaigns.")
