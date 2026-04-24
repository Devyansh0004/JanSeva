from pymongo import MongoClient
import datetime
import math

def assign_volunteers():
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva
    
    ngos = list(db.ngos.find())
    
    if len(ngos) < 5:
        print("Less than 5 NGOs found. Please run main seeder first or we can seed here.")
        # Assuming the main DB has at least 35 NGOs (we checked earlier it had 35)
    
    # We only want the newly seeded 500 volunteers to distribute
    # We can fetch 500 volunteers without assignedRequests? Or all 500 volunteers.
    volunteers = list(db.volunteers.find({}).sort("_id", -1).limit(500))
    
    if not volunteers:
        print("No volunteers found.")
        return
        
    volunteers_per_ngo = math.ceil(len(volunteers) / len(ngos))
    
    volunteer_ngos_data = []
    
    # Clear existing associations for these 500
    volunteer_ids = [v["_id"] for v in volunteers]
    db.volunteerngos.delete_many({"volunteerId": {"$in": volunteer_ids}})
    
    ngo_idx = 0
    count_for_current_ngo = 0
    
    for v in volunteers:
        ngo = ngos[ngo_idx]
        
        doc = {
            "volunteerId": v["_id"],
            "ngoId": ngo["_id"],
            "status": "approved",
            "requestedAt": datetime.datetime.now(datetime.UTC),
            "respondedAt": datetime.datetime.now(datetime.UTC),
            "createdAt": datetime.datetime.now(datetime.UTC),
            "updatedAt": datetime.datetime.now(datetime.UTC)
        }
        volunteer_ngos_data.append(doc)
        
        count_for_current_ngo += 1
        if count_for_current_ngo >= volunteers_per_ngo:
            ngo_idx = (ngo_idx + 1) % len(ngos)
            count_for_current_ngo = 0
            
    # Insert in batches
    for i in range(0, len(volunteer_ngos_data), 50):
        db.volunteerngos.insert_many(volunteer_ngos_data[i:i+50])
        
    print(f"Assigned {len(volunteer_ngos_data)} volunteers across {len(ngos)} NGOs.")

if __name__ == "__main__":
    assign_volunteers()
