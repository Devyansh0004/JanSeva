from pymongo import MongoClient
from faker import Faker
import random
import datetime

def seed_volunteers():
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva
    fake = Faker('hi_IN')

    skills = db.volunteers.distinct("skills")
    domains = db.volunteers.distinct("domains")
    availabilities = db.volunteers.distinct("availability")

    if not skills:
        skills = ['Medical', 'First Aid', 'Counselling', 'Teaching', 'Construction', 'Cooking', 'Logistics', 'Driving', 'Translation', 'IT Support']
    if not domains:
        domains = ['Healthcare & Wellness', 'Food Security & Distribution', 'Education & Mentorship', 'Shelter & Caregiving', 'Emergency & Disaster Response']
    if not availabilities:
        availabilities = ['Full-time', 'Part-time', 'Weekends', 'On-call']

    states = [
        {"state": "Maharashtra", "cities": ["Mumbai", "Pune", "Nagpur"]},
        {"state": "Delhi", "cities": ["New Delhi"]},
        {"state": "Karnataka", "cities": ["Bangalore", "Mysore"]},
        {"state": "Tamil Nadu", "cities": ["Chennai", "Coimbatore"]},
        {"state": "Uttar Pradesh", "cities": ["Lucknow", "Kanpur", "Varanasi"]},
        {"state": "Gujarat", "cities": ["Ahmedabad", "Surat"]},
        {"state": "Rajasthan", "cities": ["Jaipur", "Jodhpur"]},
        {"state": "Bihar", "cities": ["Patna", "Gaya"]},
        {"state": "Chhattisgarh", "cities": ["Raipur", "Bhilai"]},
        {"state": "Kerala", "cities": ["Thiruvananthapuram", "Kochi"]}
    ]

    print(f"Generating 200 volunteers using DB skills: {len(skills)}, domains: {len(domains)}...")

    volunteers_data = []
    users_data = []

    for i in range(200):
        # Create user
        name = fake.name()
        email = f"vol_ml_{i}_{int(datetime.datetime.now().timestamp())}@test.com"
        
        user_doc = {
            "name": name,
            "email": email,
            "password": "hashed_password",
            "role": "volunteer",
            "isActive": True,
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow()
        }
        users_data.append(user_doc)

    # Insert users
    if users_data:
        res = db.users.insert_many(users_data)
        user_ids = res.inserted_ids

        for user_id in user_ids:
            # Create volunteer
            state_obj = random.choice(states)
            
            vol_doc = {
                "userId": user_id,
                "gender": random.choice(["Male", "Female", "Other"]),
                "age": random.randint(18, 60),
                "skills": random.sample(skills, random.randint(2, 5)),
                "domains": random.sample(domains, random.randint(1, 3)),
                "availability": random.choice(availabilities),
                "isAvailable": True,
                "completedRequests": random.randint(0, 100),
                "volunteeringHours": random.randint(0, 2000),
                "rating": round(random.uniform(3.0, 5.0), 1),
                "location": {
                    "state": state_obj["state"],
                    "city": random.choice(state_obj["cities"])
                },
                "createdAt": datetime.datetime.utcnow(),
                "updatedAt": datetime.datetime.utcnow()
            }
            volunteers_data.append(vol_doc)

        db.volunteers.insert_many(volunteers_data)
        print("Successfully seeded 200 volunteers.")

if __name__ == "__main__":
    seed_volunteers()
