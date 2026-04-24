from pymongo import MongoClient
import random
import datetime
from bson import ObjectId

def seed_campaigns():
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva

    ngos = list(db.ngos.find())
    villages = list(db.villages.find())
    volunteers = list(db.volunteerscores.find({"tier": {"$exists": True}}))

    if not ngos or not villages or not volunteers:
        print("Missing required data (ngos, villages, or volunteers with tiers). Run other seeders first.")
        return

    print("Generating 10 pre-seeded campaigns...")

    campaigns_data = []
    reports_data = []

    titles = [
        "Medical Camp Phase 1", "Winter Relief Distribution", "Village School Restoration",
        "Sanitation Drive 2026", "Emergency Flood Relief", "Women's Literacy Program",
        "Clean Water Initiative", "Temporary Shelter Building", "Malnutrition Eradication", "Rural Health Screening"
    ]

    domains = ['Healthcare & Wellness', 'Food Security & Distribution', 'Education & Mentorship', 'Shelter & Caregiving', 'Emergency & Disaster Response']

    for i in range(10):
        ngo = random.choice(ngos)
        village = random.choice(villages)
        
        # 5 active, 5 completed
        status = "Active" if i < 5 else "Completed"
        
        # Select volunteers with mixed tiers (A, B, C, D)
        tier_a = [v for v in volunteers if v.get("tier") == "A"]
        tier_bc = [v for v in volunteers if v.get("tier") in ["B", "C"]]
        tier_d = [v for v in volunteers if v.get("tier") == "D"]
        
        selected_vols = []
        if tier_a: selected_vols.append(random.choice(tier_a)['volunteerId'])
        if tier_bc: selected_vols.extend([v['volunteerId'] for v in random.sample(tier_bc, min(2, len(tier_bc)))])
        if tier_d: selected_vols.append(random.choice(tier_d)['volunteerId'])
        
        # Fill rest randomly
        remaining = 5 - len(selected_vols)
        if remaining > 0:
            others = [v['volunteerId'] for v in random.sample(volunteers, remaining)]
            selected_vols.extend(others)

        start_date = datetime.datetime.utcnow() + datetime.timedelta(days=(random.randint(1, 10) if status == "Active" else -random.randint(10, 30)))
        end_date = start_date + datetime.timedelta(days=random.randint(5, 15))

        campaign_doc = {
            "ngoId": ngo["_id"],
            "title": f"{titles[i]} - {village.get('village_name', 'Village')}",
            "description": f"Targeted campaign in {village.get('village_name', 'Village')} focusing on {village.get('primaryDomain', 'general aid')}.",
            "category": random.choice(domains),
            "isEmergency": status == "Active" and random.random() < 0.2,
            "targetAmount": random.randint(50000, 500000),
            "raisedAmount": random.randint(10000, 400000),
            "volunteerTarget": 5,
            "volunteers": selected_vols,
            "startDate": start_date,
            "endDate": end_date,
            "status": status,
            "state": village.get('state', 'Unknown'),
            "city": village.get('district') or village.get('village_name', 'Unknown'),
            "ngoSummary": {
                "name": ngo['name'],
                "city": ngo['city'],
                "state": ngo['state']
            },
            "villageId": village.get("village_id", str(village["_id"])),
            "primaryDomain": village.get("primaryDomain") or random.choice(domains),
            "volunteerSlots": 5,
            "assignmentRoundRobin": random.randint(0, 10),
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        
        camp_id = db.campaigns.insert_one(campaign_doc).inserted_id

        if status == "Completed":
            report_doc = {
                "campaignId": camp_id,
                "ngoId": ngo["_id"],
                "villageId": village.get("village_id", str(village["_id"])),
                "hoursLogged": random.randint(100, 500),
                "householdsCovered": random.randint(50, 200),
                "beforeVulnerabilityScore": round(village.get("overall_priority_score", 0) + random.uniform(5, 15), 1),
                "afterVulnerabilityScore": village.get("overall_priority_score", 0),
                "volunteerPerformance": [
                    {"volunteerId": vid, "hours": random.randint(10, 50), "rating": round(random.uniform(4.0, 5.0), 1)}
                    for vid in selected_vols
                ],
                "generatedAt": datetime.datetime.utcnow()
            }
            reports_data.append(report_doc)

    if reports_data:
        db.campaignreports.insert_many(reports_data)

    print("Successfully seeded 10 campaigns and reports.")

if __name__ == "__main__":
    seed_campaigns()
