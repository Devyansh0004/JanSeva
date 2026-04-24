import csv
import random
import os
import datetime
from faker import Faker
import numpy as np

fake = Faker('hi_IN')

# Define exactly what columns each survey gets
SURVEY_COLUMNS = {
    'food': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'monthly_income', 'meals_per_day', 'food_source_type', 'food_insecure_months_per_year',
        'child_malnutrition_yn', 'household_size', 'ration_card_yn', 'clean_water_access_yn',
        'crop_failure_last_3yr', 'food_aid_receipt_yn', 'pds_access_yn', 'caloric_intake_score',
        'vulnerability_label' # For ML target
    ],
    'health': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'infant_deaths_last_5yr', 'maternal_deaths_last_5yr', 'chronic_illness_count',
        'distance_to_hospital_km', 'hospital_visits_per_year', 'vaccinated_children_pct',
        'sanitation_access_yn', 'clean_water_access_yn', 'health_insurance_yn',
        'malnourished_children_under5', 'disability_count', 'open_defecation_yn',
        'vulnerability_label'
    ],
    'education': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'school_age_children_count', 'enrolled_children_count', 'dropout_children_count',
        'distance_to_school_km', 'illiterate_adults_count', 'total_adults_count',
        'literate_females_count', 'total_females_count', 'highest_education_level_encoded',
        'highest_education_level', # String representation
        'midday_meal_access_yn', 'internet_access_yn', 'teachers_in_school', 'primary_school_nearby_yn',
        'vulnerability_label'
    ],
    'shelter': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'house_type', 'room_count', 'household_size', 'electricity_access_yn', 'toilet_access_yn',
        'drinking_water_source', 'flood_prone_yn', 'house_damaged_yn', 'persons_per_room',
        'owns_land_yn', 'pmay_beneficiary_yn', 'disaster_affected_yn', 'kitchen_separate_yn',
        'vulnerability_label'
    ],
    'emergency': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'emergency_type', 'affected_households', 'casualties', 'displaced_persons',
        'relief_received_yn', 'infrastructure_damage_level', 'response_time_hours',
        'external_aid_received_yn', 'lives_at_risk', 'evacuation_done_yn'
    ]
}

# 8 Villages with assigned base vulnerability factors
VILLAGES = [
    {"id": "V_001", "name": "Bari", "state": "Rajasthan", "vuln_factor": 0.8}, # Poorer
    {"id": "V_002", "name": "Gopalpur", "state": "Bihar", "vuln_factor": 0.9}, # Poorer
    {"id": "V_003", "name": "Kheda", "state": "Gujarat", "vuln_factor": 0.3}, # Richer
    {"id": "V_004", "name": "Nandur", "state": "Maharashtra", "vuln_factor": 0.4},
    {"id": "V_005", "name": "Dantewada", "state": "Chhattisgarh", "vuln_factor": 0.95}, # Extremely vulnerable
    {"id": "V_006", "name": "Palakkad", "state": "Kerala", "vuln_factor": 0.2}, # High dev index
    {"id": "V_007", "name": "Koraput", "state": "Odisha", "vuln_factor": 0.85},
    {"id": "V_008", "name": "Mawlynnong", "state": "Meghalaya", "vuln_factor": 0.35}
]

def generate_surveys():
    out_dir = os.path.join(os.path.dirname(__file__), '../synthetic_surveys')
    os.makedirs(out_dir, exist_ok=True)
    
    # Open CSV files for writing
    files = {}
    writers = {}
    for survey_type, cols in SURVEY_COLUMNS.items():
        filepath = os.path.join(out_dir, f'synthetic_{survey_type}.csv')
        f = open(filepath, 'w', newline='', encoding='utf-8')
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        files[survey_type] = f
        writers[survey_type] = writer

    surveyor_ids = [f"SRV_{i:03d}" for i in range(1, 10)]
    survey_date = datetime.date(2025, 1, 15)

    for village in VILLAGES:
        vf = village['vuln_factor'] # 0.0 (perfect) to 1.0 (worst)
        
        # 100 households per village
        for i in range(100):
            hh_id = f"HH_{village['id']}_{i:03d}"
            surveyor = random.choice(surveyor_ids)
            
            # Household baseline vulnerability incorporates village level + some random variance
            hh_vf = np.clip(np.random.normal(vf, 0.15), 0, 1)
            
            # Generative Models for Correlated Variables based on hh_vf
            # If hh_vf is high, they are poor, lacking sanitation, malnourished, etc.
            
            # 1. FOOD
            income = int(np.random.normal((1-hh_vf)*30000 + 2000, 1000))
            income = max(500, income)
            meals = 3 if hh_vf < 0.4 else (2 if hh_vf < 0.8 else random.choice([1, 2]))
            malnutrition = 1 if (hh_vf > 0.6 and random.random() < hh_vf) else 0
            
            writers['food'].writerow({
                'village_id': village['id'], 'village_name': village['name'],
                'household_id': hh_id, 'surveyor_id': surveyor, 'survey_date': survey_date,
                'monthly_income': income,
                'meals_per_day': meals,
                'food_source_type': 'Market' if hh_vf < 0.5 else ('Self-grown' if random.random() > 0.5 else 'PDS/Ration'),
                'food_insecure_months_per_year': int(hh_vf * 6 + random.randint(0, 2)),
                'child_malnutrition_yn': malnutrition,
                'household_size': int(np.random.normal(4 + hh_vf*2, 1)),
                'ration_card_yn': 1 if random.random() < 0.8 else 0,
                'clean_water_access_yn': 0 if hh_vf > 0.7 else 1,
                'crop_failure_last_3yr': random.randint(0, 3) if hh_vf > 0.5 else 0,
                'food_aid_receipt_yn': 1 if hh_vf > 0.8 else 0,
                'pds_access_yn': 1 if hh_vf < 0.9 else 0,
                'caloric_intake_score': int((1-hh_vf)*100),
                'vulnerability_label': int(hh_vf * 100)
            })
            
            # 2. HEALTH
            infant_deaths = 1 if (hh_vf > 0.8 and random.random() < 0.1) else 0
            sanitation = 0 if hh_vf > 0.6 else 1
            writers['health'].writerow({
                'village_id': village['id'], 'village_name': village['name'],
                'household_id': hh_id, 'surveyor_id': surveyor, 'survey_date': survey_date,
                'infant_deaths_last_5yr': infant_deaths,
                'maternal_deaths_last_5yr': 0,
                'chronic_illness_count': int(hh_vf * random.randint(0, 3)),
                'distance_to_hospital_km': int(hh_vf * 30 + 1),
                'hospital_visits_per_year': random.randint(0, 5),
                'vaccinated_children_pct': int((1-hh_vf) * 100),
                'sanitation_access_yn': sanitation,
                'clean_water_access_yn': 0 if hh_vf > 0.7 else 1,
                'health_insurance_yn': 1 if hh_vf < 0.4 else 0,
                'malnourished_children_under5': malnutrition,
                'disability_count': 1 if random.random() < 0.05 else 0,
                'open_defecation_yn': 1 - sanitation,
                'vulnerability_label': int(hh_vf * 100)
            })

            # 3. EDUCATION
            school_age = random.randint(0, 4)
            enrolled = int(school_age * (1 - hh_vf*random.random()))
            writers['education'].writerow({
                'village_id': village['id'], 'village_name': village['name'],
                'household_id': hh_id, 'surveyor_id': surveyor, 'survey_date': survey_date,
                'school_age_children_count': school_age,
                'enrolled_children_count': enrolled,
                'dropout_children_count': school_age - enrolled,
                'distance_to_school_km': int(hh_vf * 15 + 1),
                'illiterate_adults_count': int(hh_vf * 4),
                'total_adults_count': 4,
                'literate_females_count': int((1-hh_vf) * 2),
                'total_females_count': 2,
                'highest_education_level_encoded': int((1-hh_vf)*4),
                'highest_education_level': ['None', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate'][int((1-hh_vf)*4)],
                'midday_meal_access_yn': 1 if enrolled > 0 else 0,
                'internet_access_yn': 1 if hh_vf < 0.3 else 0,
                'teachers_in_school': int((1-hh_vf) * 10 + 1),
                'primary_school_nearby_yn': 1 if hh_vf < 0.7 else 0,
                'vulnerability_label': int(hh_vf * 100)
            })

            # 4. SHELTER
            house_type = 'Kutcha' if hh_vf > 0.7 else ('Semi-Pucca' if hh_vf > 0.3 else 'Pucca')
            writers['shelter'].writerow({
                'village_id': village['id'], 'village_name': village['name'],
                'household_id': hh_id, 'surveyor_id': surveyor, 'survey_date': survey_date,
                'house_type': house_type,
                'room_count': max(1, int((1-hh_vf) * 5)),
                'household_size': int(np.random.normal(4 + hh_vf*2, 1)),
                'electricity_access_yn': 0 if hh_vf > 0.8 else 1,
                'toilet_access_yn': sanitation,
                'drinking_water_source': 'Well/River' if hh_vf > 0.7 else 'Tap',
                'flood_prone_yn': 1 if random.random() < 0.2 else 0,
                'house_damaged_yn': 1 if hh_vf > 0.8 else 0,
                'persons_per_room': int(np.random.normal(hh_vf * 5 + 1, 1)),
                'owns_land_yn': 1 if hh_vf < 0.5 else 0,
                'pmay_beneficiary_yn': 1 if (hh_vf > 0.5 and hh_vf < 0.9) else 0,
                'disaster_affected_yn': 1 if random.random() < 0.1 else 0,
                'kitchen_separate_yn': 1 if hh_vf < 0.5 else 0,
                'vulnerability_label': int(hh_vf * 100)
            })
            
            # 5. EMERGENCY
            if random.random() < 0.1: # Only ~10% have emergency surveys
                writers['emergency'].writerow({
                    'village_id': village['id'], 'village_name': village['name'],
                    'household_id': hh_id, 'surveyor_id': surveyor, 'survey_date': survey_date,
                    'emergency_type': random.choice(['Flood', 'Fire', 'Earthquake', 'Drought']),
                    'affected_households': random.randint(10, 200),
                    'casualties': random.randint(0, 5),
                    'displaced_persons': random.randint(0, 100),
                    'relief_received_yn': 1 if random.random() > 0.5 else 0,
                    'infrastructure_damage_level': random.choice(['Low', 'Medium', 'High', 'Critical']),
                    'response_time_hours': random.randint(12, 120),
                    'external_aid_received_yn': random.choice([0, 1]),
                    'lives_at_risk': random.randint(0, 50),
                    'evacuation_done_yn': random.choice([0, 1])
                })

    for f in files.values():
        f.close()

    print(f"Synthetic surveys generated in {out_dir}")

if __name__ == "__main__":
    generate_surveys()
