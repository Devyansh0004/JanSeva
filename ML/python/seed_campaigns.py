from pymongo import MongoClient
from bson import ObjectId
import random
import datetime
import math
import os
import pandas as pd

def seed_campaigns():
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva
    
    ngos = list(db.ngos.find())
    villages = list(db.villages.find())
    
    # If fewer than 15 villages exist, seed more
    if len(villages) < 15:
        print(f"Only {len(villages)} villages found. Seeding synthetic villages...")
        syn_villages = []
        for i in range(15 - len(villages)):
            syn_villages.append({
                "villageId": f"SYN_{i}",
                "villageName": f"Synthetic Village {i}",
                "state": "Maharashtra",
                "district": "Pune",
                "population": random.randint(500, 3000),
                "createdAt": datetime.datetime.now(datetime.UTC),
                "updatedAt": datetime.datetime.now(datetime.UTC)
            })
        db.villages.insert_many(syn_villages)
        villages = list(db.villages.find())

    volunteers_a = list(db.volunteerscores.find({"tier": "A"}))
    volunteers_b = list(db.volunteerscores.find({"tier": {"$in": ["B", "C"]}}))
    volunteers_c = list(db.volunteerscores.find({"tier": "D"})) # Treating D as the lowest tier 
    
    if len(volunteers_a) == 0: volunteers_a = volunteers_b
    if len(volunteers_c) == 0: volunteers_c = volunteers_b
    
    domains = ['Healthcare & Wellness', 'Food Security & Distribution', 'Education & Mentorship', 'Shelter & Caregiving']
    
    out_dir = 'ML/seeded_campaign_csvs/'
    os.makedirs(out_dir, exist_ok=True)
    
    print("Seeding campaigns...")
    
    for ngo in ngos:
        num_camps = random.randint(1, 2)
        for _ in range(num_camps):
            target_village_count = random.randint(3, 5)
            target_villages = random.sample(villages, target_village_count)
            budget = random.randint(1000, 10000)
            domain = random.choice(domains)
            status = random.choice(["Active", "Completed"])
            
            camp_id = ObjectId()
            
            # Create Campaign
            start_date = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=(random.randint(1, 10) if status == "Active" else -random.randint(10, 30)))
            end_date = start_date + datetime.timedelta(days=random.randint(5, 15))
            
            # Select 100 volunteers: ~25 A, ~50 B, ~25 C
            sel_vols = []
            if len(volunteers_a) >= 25: sel_vols.extend(random.sample(volunteers_a, 25))
            else: sel_vols.extend(volunteers_a)
            if len(volunteers_b) >= 50: sel_vols.extend(random.sample(volunteers_b, 50))
            else: sel_vols.extend(volunteers_b)
            if len(volunteers_c) >= 25: sel_vols.extend(random.sample(volunteers_c, 25))
            else: sel_vols.extend(volunteers_c)
            
            # ensure 100
            diff = 100 - len(sel_vols)
            if diff > 0 and len(volunteers_b) > 0:
                sel_vols.extend(random.choices(volunteers_b, k=diff))
                
            sel_vol_ids = [v["volunteerId"] for v in sel_vols]
            
            campaign_doc = {
                "_id": camp_id,
                "ngoId": ngo["_id"],
                "title": f"{domain.split()[0]} Drive by {ngo['name']}",
                "description": f"Synthetic {domain} campaign for {target_village_count} villages.",
                "category": domain.split()[0], # Approx category
                "isEmergency": status == "Active" and random.random() < 0.2,
                "targetAmount": budget,
                "raisedAmount": random.randint(int(budget*0.5), budget),
                "volunteerTarget": 100,
                "volunteers": sel_vol_ids, # $addToSet requirement
                "startDate": start_date,
                "endDate": end_date,
                "status": status,
                "state": ngo.get('state', 'Unknown'),
                "city": ngo.get('city', 'Unknown'),
                "ngoSummary": {
                    "name": ngo['name'],
                    "city": ngo['city'],
                    "state": ngo['state']
                },
                "createdAt": datetime.datetime.now(datetime.UTC),
                "updatedAt": datetime.datetime.now(datetime.UTC)
            }
            db.campaigns.insert_one(campaign_doc)
            
            # Update volunteers assignedRequests
            db.volunteers.update_many(
                {"userId": {"$in": sel_vol_ids}},
                {"$addToSet": {"assignedRequests": camp_id}}
            )
            
            # Generate Synthetic CSV
            csv_data = []
            survey_type = 'health'
            if 'Food' in domain: survey_type = 'food'
            elif 'Education' in domain: survey_type = 'education'
            elif 'Shelter' in domain: survey_type = 'shelter'
            
            cols = ['village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date', 'domain_indicator_1', 'domain_indicator_2']
            hh_id = 1
            
            survey_rows = []
            village_vulnerability_scores = []
            
            for v in target_villages:
                v_score = random.randint(30, 95)
                village_vulnerability_scores.append({"vid": v["villageId"], "vname": v["villageName"], "score": v_score})
                num_hh = random.randint(25, 30)
                for _ in range(num_hh):
                    # just basic row for DB seeding so surveyresponses has data
                    r = {
                        "village_id": v["villageId"],
                        "village_name": v["villageName"],
                        "household_id": f"HH_{hh_id}",
                        "surveyor_id": "SRV_01",
                        "survey_date": "2024-05-01",
                        "domain_indicator_1": random.randint(0, 10),
                        "domain_indicator_2": random.randint(0, 10)
                    }
                    csv_data.append(r)
                    survey_rows.append({
                        "campaignId": camp_id,
                        "sessionId": f"camp_{camp_id}",
                        "surveyType": survey_type,
                        "villageId": v["villageId"],
                        "villageName": v["villageName"],
                        "householdId": f"HH_{hh_id}",
                        "surveyorId": "SRV_01",
                        "surveyDate": datetime.datetime.now(datetime.UTC),
                        "data": r,
                        "createdAt": datetime.datetime.now(datetime.UTC),
                        "updatedAt": datetime.datetime.now(datetime.UTC)
                    })
                    hh_id += 1
            
            # Write CSV
            df = pd.DataFrame(csv_data)
            df.to_csv(f"{out_dir}{str(camp_id)}_{survey_type}.csv", index=False)
            
            # Insert surveys
            if survey_rows:
                db.surveyresponses.insert_many(survey_rows)
            
            # Create VillageScores (per campaign)
            v_scores_docs = []
            for vs in village_vulnerability_scores:
                v_scores_docs.append({
                    "campaignId": camp_id,
                    "villageId": vs["vid"],
                    "villageName": vs["vname"],
                    "state": "Unknown",
                    "overallVulnerabilityScore": vs["score"],
                    "vulnerabilityClass": "CRITICAL" if vs["score"] > 75 else ("HIGH" if vs["score"] > 65 else "MEDIUM"),
                    "primaryDomain": domain,
                    "computedAt": datetime.datetime.now(datetime.UTC),
                    "createdAt": datetime.datetime.now(datetime.UTC),
                    "updatedAt": datetime.datetime.now(datetime.UTC)
                })
            if v_scores_docs:
                # We can't $merge easily with python dicts directly if duplicate key, we'll just insert_many since {villageId, campaignId} is unique
                try:
                    db.villagescores.insert_many(v_scores_docs, ordered=False)
                except Exception as e:
                    pass
            
            # Insert CampaignRegistrations
            registrations = []
            # We distribute volunteers to villages based on vulnerability proportional allocation roughly
            # For simplicity, assign equally chunks
            chunk_size = math.ceil(len(sel_vols) / len(target_villages))
            assignments_docs = []
            
            for idx, tv in enumerate(target_villages):
                v_vols = sel_vols[idx*chunk_size:(idx+1)*chunk_size]
                if not v_vols: continue
                
                v_vol_ids = [v["volunteerId"] for v in v_vols]
                
                assignments_docs.append({
                    "campaignId": camp_id,
                    "village_id": tv["villageId"],
                    "village_name": tv["villageName"],
                    "domain": domain,
                    "priority_rank": idx + 1,
                    "domain_score": village_vulnerability_scores[idx]["score"],
                    "funds_assigned": int(budget / len(target_villages)),
                    "volunteers_needed": len(v_vols),
                    "volunteers_assigned": v_vol_ids,
                    "group_id": f"GRP_{tv['villageId']}",
                    "group_rank_spread": [v.get("totalScore", 50) for v in v_vols],
                    "createdAt": datetime.datetime.now(datetime.UTC),
                    "updatedAt": datetime.datetime.now(datetime.UTC)
                })
                
                for v in v_vols:
                    registrations.append({
                        "campaignId": camp_id,
                        "volunteerId": v["volunteerId"],
                        "status": "matched",
                        "registeredAt": datetime.datetime.now(datetime.UTC),
                        "matchScore": round(random.uniform(70, 95), 2),
                        "assignedVillageId": tv["villageId"], # string
                        "createdAt": datetime.datetime.now(datetime.UTC),
                        "updatedAt": datetime.datetime.now(datetime.UTC)
                    })
            
            if assignments_docs:
                db.assignments.insert_many(assignments_docs)
            if registrations:
                db.campaignregistrations.insert_many(registrations)
                
            # Create campaignreport
            db.campaignreports.insert_one({
                "campaignId": camp_id,
                "ngoId": ngo["_id"],
                "villageId": target_villages[0]["villageId"],
                "hoursLogged": random.randint(100, 500) if status == "Completed" else 0,
                "householdsCovered": hh_id - 1,
                "beforeVulnerabilityScore": round(random.uniform(60, 90), 1),
                "afterVulnerabilityScore": round(random.uniform(30, 50), 1) if status == "Completed" else None,
                "generatedAt": datetime.datetime.now(datetime.UTC)
            })

    print("Seeded campaigns successfully.")

if __name__ == "__main__":
    seed_campaigns()
