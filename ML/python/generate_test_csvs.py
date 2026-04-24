import pandas as pd
import numpy as np
import os
import random

def generate_test_csvs():
    out_dir = 'ML/test_csvs/'
    os.makedirs(out_dir, exist_ok=True)
    
    # 4 Indian villages
    villages = [
        {"id": "V_T1", "name": "Bassi", "type": "CRITICAL"},
        {"id": "V_T2", "name": "Mawlynnong", "type": "HIGH"},
        {"id": "V_T3", "name": "Hiware Bazar", "type": "MEDIUM"},
        {"id": "V_T4", "name": "Pothanikkad", "type": "LOW"}
    ]
    
    # Define columns and their "bad" indicators (high weight in ML)
    schemas = {
        "food": {
            "cols": ['village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
                     'monthly_income', 'meals_per_day', 'food_source_type', 'food_insecure_months_per_year',
                     'child_malnutrition_yn', 'household_size', 'ration_card_yn', 'clean_water_access_yn',
                     'crop_failure_last_3yr', 'food_aid_receipt_yn', 'pds_access_yn', 'caloric_intake_score'],
            # For critical, we lower income, meals, increase food insecure months, etc.
            "critical_logic": lambda: [
                random.randint(1000, 3000), random.randint(1, 2), random.choice(['Market', 'Aid']),
                random.randint(5, 9), 1, random.randint(5, 10), 0, 0, 1, 0, 0, random.randint(10, 30)
            ],
            "high_logic": lambda: [
                random.randint(2500, 5000), 2, random.choice(['Market', 'Self-grown']),
                random.randint(3, 6), random.choice([0, 1]), random.randint(4, 8), random.choice([0, 1]), 0, 1, 0, random.choice([0, 1]), random.randint(25, 45)
            ],
            "medium_logic": lambda: [
                random.randint(4000, 8000), 3, random.choice(['Market', 'Self-grown']),
                random.randint(1, 3), 0, random.randint(3, 6), 1, 1, 0, 0, 1, random.randint(40, 60)
            ],
            "low_logic": lambda: [
                random.randint(8000, 20000), random.randint(3, 4), 'Market',
                0, 0, random.randint(2, 5), 1, 1, 0, 0, 1, random.randint(60, 90)
            ]
        },
        "health": {
            "cols": ['village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
                     'infant_deaths_last_5yr', 'maternal_deaths_last_5yr', 'chronic_illness_count',
                     'distance_to_hospital_km', 'hospital_visits_per_year', 'vaccinated_children_pct',
                     'sanitation_access_yn', 'clean_water_access_yn', 'health_insurance_yn',
                     'malnourished_children_under5', 'disability_count', 'open_defecation_yn'],
            "critical_logic": lambda: [
                random.randint(2, 5), random.randint(0, 2), random.randint(3, 6),
                random.randint(20, 50), random.randint(0, 2), random.randint(10, 30),
                0, 0, 0, random.randint(2, 5), random.randint(1, 3), 1
            ],
            "high_logic": lambda: [
                random.randint(1, 3), 0, random.randint(2, 4),
                random.randint(10, 25), random.randint(1, 3), random.randint(30, 60),
                0, random.choice([0, 1]), 0, random.randint(1, 3), random.randint(0, 2), 1
            ],
            "medium_logic": lambda: [
                random.choice([0, 1]), 0, random.randint(1, 3),
                random.randint(5, 15), random.randint(2, 5), random.randint(60, 85),
                1, 1, random.choice([0, 1]), random.choice([0, 1]), random.choice([0, 1]), 0
            ],
            "low_logic": lambda: [
                0, 0, random.randint(0, 1),
                random.randint(1, 5), random.randint(3, 8), random.randint(85, 100),
                1, 1, 1, 0, 0, 0
            ]
        },
        "education": {
            "cols": ['village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
                     'school_age_children_count', 'enrolled_children_count', 'dropout_children_count',
                     'distance_to_school_km', 'illiterate_adults_count', 'total_adults_count',
                     'literate_females_count', 'total_females_count', 'highest_education_level_encoded',
                     'midday_meal_access_yn', 'internet_access_yn', 'teachers_in_school', 'primary_school_nearby_yn'],
            "critical_logic": lambda: [
                c:=random.randint(3, 6), random.randint(0, c//2), random.randint(c//2, c),
                random.randint(10, 25), a:=random.randint(4, 8), a+random.randint(0, 2),
                0, random.randint(1, 3), "None",
                0, 0, random.randint(0, 1), 0
            ],
            "high_logic": lambda: [
                c:=random.randint(2, 5), random.randint(c//2, c), random.randint(1, c//2+1),
                random.randint(5, 15), a:=random.randint(2, 5), a+random.randint(1, 4),
                random.randint(0, 1), random.randint(1, 3), "Primary",
                random.choice([0, 1]), 0, random.randint(1, 3), 0
            ],
            "medium_logic": lambda: [
                c:=random.randint(1, 4), c, random.choice([0, 1]),
                random.randint(2, 8), a:=random.randint(1, 3), a+random.randint(2, 6),
                random.randint(1, 3), random.randint(2, 4), "Secondary",
                1, random.choice([0, 1]), random.randint(3, 6), 1
            ],
            "low_logic": lambda: [
                c:=random.randint(1, 3), c, 0,
                random.randint(0, 3), 0, random.randint(2, 6),
                random.randint(1, 3), random.randint(1, 3), "Tertiary",
                1, 1, random.randint(5, 12), 1
            ]
        },
        "shelter": {
            "cols": ['village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
                     'house_type', 'room_count', 'household_size', 'electricity_access_yn', 'toilet_access_yn',
                     'drinking_water_source', 'flood_prone_yn', 'house_damaged_yn', 'persons_per_room',
                     'owns_land_yn', 'pmay_beneficiary_yn', 'disaster_affected_yn', 'kitchen_separate_yn'],
            "critical_logic": lambda: [
                "Kutcha", r:=random.randint(1, 2), s:=random.randint(6, 10), 0, 0,
                "River/Pond", 1, 1, round(s/r, 1),
                0, 0, 1, 0
            ],
            "high_logic": lambda: [
                "Kutcha", r:=random.randint(1, 3), s:=random.randint(5, 8), random.choice([0, 1]), 0,
                "Well", random.choice([0, 1]), 1, round(s/r, 1),
                0, random.choice([0, 1]), random.choice([0, 1]), 0
            ],
            "medium_logic": lambda: [
                "Semi-Pucca", r:=random.randint(2, 4), s:=random.randint(4, 7), 1, 1,
                "Handpump", 0, 0, round(s/r, 1),
                1, random.choice([0, 1]), 0, 1
            ],
            "low_logic": lambda: [
                "Pucca", r:=random.randint(3, 6), s:=random.randint(2, 5), 1, 1,
                "Piped Tap", 0, 0, round(s/r, 1),
                1, 0, 0, 1
            ]
        }
    }
    
    for domain, schema in schemas.items():
        data = []
        hh_id = 1
        for v in villages:
            num_households = random.randint(24, 28)
            for _ in range(num_households):
                base = [v['id'], v['name'], f"HH_{hh_id}", "SRV_TEST", "2024-05-01"]
                
                if v['type'] == 'CRITICAL':
                    rest = schema['critical_logic']()
                elif v['type'] == 'HIGH':
                    rest = schema['high_logic']()
                elif v['type'] == 'MEDIUM':
                    rest = schema['medium_logic']()
                else:
                    rest = schema['low_logic']()
                    
                data.append(base + rest)
                hh_id += 1
                
        df = pd.DataFrame(data, columns=schema['cols'])
        filepath = os.path.join(out_dir, f'test_{domain}_campaign.csv')
        
        with open(filepath, 'w') as f:
            f.write(f"# Budget: 7500 | Domain: {domain.capitalize()} | Villages: 4\n")
            
        df.to_csv(filepath, mode='a', index=False)
        print(f"Generated {filepath}")

if __name__ == "__main__":
    generate_test_csvs()
