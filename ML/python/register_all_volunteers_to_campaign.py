import argparse
from pymongo import MongoClient
from bson import ObjectId
import datetime

def register_volunteers(campaign_id_str):
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva
    
    camp_id = ObjectId(campaign_id_str)
    campaign = db.campaigns.find_one({"_id": camp_id})
    if not campaign:
        print(f"Campaign {campaign_id_str} not found.")
        return
        
    # We ideally lookup domainskillmap, but for simplicity we fetch all available volunteers 
    # who have domains containing the campaign category/domain (or any domain if category doesn't strictly match).
    # Since domains in DB are complex strings ('Food Security & Distribution'), we use partial matching.
    domain_filter = campaign["category"]
    print(f"Campaign category: {domain_filter}")
    
    # Get required domains by matching the category
    matched_domains = [d for d in db.volunteers.distinct("domains") if domain_filter.lower() in d.lower()]
    if not matched_domains:
        # Fallback to all if not exactly matching
        matched_domains = db.volunteers.distinct("domains")
        
    query = {
        "isAvailable": True,
        "domains": {"$in": matched_domains}
    }
    
    volunteers = list(db.volunteers.find(query))
    if not volunteers:
        print("No eligible volunteers found.")
        return
        
    # Exclude those already registered
    existing_regs = db.campaignregistrations.find({"campaignId": camp_id})
    existing_vol_ids = [str(r["volunteerId"]) for r in existing_regs]
    
    eligible_vols = [v for v in volunteers if str(v["userId"]) not in existing_vol_ids]
    
    if not eligible_vols:
        print("All eligible volunteers are already registered.")
        return
        
    print(f"Found {len(eligible_vols)} eligible volunteers not yet registered.")
    
    regs_to_insert = []
    vol_ids_to_add = []
    for v in eligible_vols:
        regs_to_insert.append({
            "campaignId": camp_id,
            "volunteerId": v["userId"],
            "status": "registered",
            "registeredAt": datetime.datetime.now(datetime.UTC),
            "matchScore": None,
            "assignedVillageId": None,
            "createdAt": datetime.datetime.now(datetime.UTC),
            "updatedAt": datetime.datetime.now(datetime.UTC)
        })
        vol_ids_to_add.append(v["userId"])
        
    # Batch insert
    if regs_to_insert:
        for i in range(0, len(regs_to_insert), 50):
            db.campaignregistrations.insert_many(regs_to_insert[i:i+50], ordered=False)
            
    # Update Campaign.volunteers array
    db.campaigns.update_one(
        {"_id": camp_id},
        {"$addToSet": {"volunteers": {"$each": vol_ids_to_add}}}
    )
    
    print(f"Successfully registered {len(eligible_vols)} volunteers to campaign {campaign_id_str}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--campaign_id", required=True, help="Campaign ID to register volunteers to")
    args = parser.parse_args()
    
    register_volunteers(args.campaign_id)
