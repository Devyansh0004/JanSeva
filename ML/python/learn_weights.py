import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from pymongo import MongoClient
import datetime
import os

# Define the numerical and boolean columns for each survey type
# The target variable is 'vulnerability_score' which will be generated in seed_surveys.py
SURVEY_COLUMNS = {
    'food': [
        'monthly_income', 'meals_per_day', 'food_insecure_months_per_year',
        'child_malnutrition_yn', 'household_size', 'ration_card_yn', 'clean_water_access_yn',
        'crop_failure_last_3yr', 'food_aid_receipt_yn', 'pds_access_yn', 'caloric_intake_score'
    ],
    'health': [
        'infant_deaths_last_5yr', 'maternal_deaths_last_5yr', 'chronic_illness_count',
        'distance_to_hospital_km', 'hospital_visits_per_year', 'vaccinated_children_pct',
        'sanitation_access_yn', 'clean_water_access_yn', 'health_insurance_yn',
        'malnourished_children_under5', 'disability_count', 'open_defecation_yn'
    ],
    'education': [
        'school_age_children_count', 'enrolled_children_count', 'dropout_children_count',
        'distance_to_school_km', 'illiterate_adults_count', 'total_adults_count',
        'literate_females_count', 'total_females_count', 'highest_education_level_encoded',
        'midday_meal_access_yn', 'internet_access_yn', 'teachers_in_school', 'primary_school_nearby_yn'
    ],
    'shelter': [
        'room_count', 'household_size', 'electricity_access_yn', 'toilet_access_yn',
        'flood_prone_yn', 'house_damaged_yn', 'persons_per_room',
        'owns_land_yn', 'pmay_beneficiary_yn', 'disaster_affected_yn', 'kitchen_separate_yn'
    ]
}

# The directions for ML learning output mapping
# Some are known inverses (e.g. clean water access reduces vulnerability)
KNOWN_INVERSES = [
    'meals_per_day', 'ration_card_yn', 'clean_water_access_yn', 'food_aid_receipt_yn', 'pds_access_yn',
    'vaccinated_children_pct', 'sanitation_access_yn', 'health_insurance_yn',
    'midday_meal_access_yn', 'internet_access_yn', 'primary_school_nearby_yn',
    'electricity_access_yn', 'toilet_access_yn', 'owns_land_yn', 'pmay_beneficiary_yn', 'kitchen_separate_yn',
    'caloric_intake_score', 'enrolled_children_count', 'highest_education_level_encoded', 'teachers_in_school'
]

def learn_weights():
    client = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva')
    db = client.janseva
    
    # Ensure index on columnweights
    db.columnweights.create_index([("surveyType", 1), ("column", 1)], unique=True)
    
    csv_dir = os.path.join(os.path.dirname(__file__), '../synthetic_surveys')
    if not os.path.exists(csv_dir):
        print("Synthetic surveys not found. Please run seed_surveys.py first.")
        return

    for survey_type, columns in SURVEY_COLUMNS.items():
        csv_path = os.path.join(csv_dir, f'synthetic_{survey_type}.csv')
        if not os.path.exists(csv_path):
            print(f"Skipping {survey_type}, file not found: {csv_path}")
            continue
            
        df = pd.read_csv(csv_path)
        
        # We need a target variable. seed_surveys.py generated 'vulnerability_label' (0-100)
        if 'vulnerability_label' not in df.columns:
            print(f"Error: No vulnerability_label target column in {csv_path}")
            continue
            
        X = df[columns].fillna(0)
        y = df['vulnerability_label']
        
        # Train Random Forest to get feature importances
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        importances = model.feature_importances_
        
        # Save to MongoDB
        weight_docs = []
        for col, weight in zip(columns, importances):
            # Determine direction: Does higher value mean more vulnerable?
            # E.g., higher income -> less vulnerable (inverse)
            direction = "inverse" if col in KNOWN_INVERSES or "income" in col else "positive"
            
            # Map column name if needed (e.g. highest_education_level_encoded -> highest_education_level)
            db_col = col.replace('_encoded', '')
            
            weight_docs.append({
                "surveyType": survey_type,
                "column": db_col,
                "weight": float(weight),
                "direction": direction,
                "learnedAt": datetime.datetime.utcnow()
            })
            
        # Bulk upsert
        for doc in weight_docs:
            db.columnweights.update_one(
                {"surveyType": doc["surveyType"], "column": doc["column"]},
                {"$set": doc},
                upsert=True
            )
            
        print(f"Learned weights for {survey_type}:")
        for doc in sorted(weight_docs, key=lambda x: x["weight"], reverse=True)[:3]:
            print(f"  - {doc['column']}: {doc['weight']:.4f} ({doc['direction']})")

if __name__ == "__main__":
    print("Starting ML Weight Learning...")
    learn_weights()
    print("Done learning weights.")
