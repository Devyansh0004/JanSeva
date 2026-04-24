import os
import csv
import datetime

# Same columns as the main generator
SURVEY_COLUMNS = {
    'food': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'monthly_income', 'meals_per_day', 'food_source_type', 'food_insecure_months_per_year',
        'child_malnutrition_yn', 'household_size', 'ration_card_yn', 'clean_water_access_yn',
        'crop_failure_last_3yr', 'food_aid_receipt_yn', 'pds_access_yn', 'caloric_intake_score'
    ],
    'health': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'infant_deaths_last_5yr', 'maternal_deaths_last_5yr', 'chronic_illness_count',
        'distance_to_hospital_km', 'hospital_visits_per_year', 'vaccinated_children_pct',
        'sanitation_access_yn', 'clean_water_access_yn', 'health_insurance_yn',
        'malnourished_children_under5', 'disability_count', 'open_defecation_yn'
    ],
    'education': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'school_age_children_count', 'enrolled_children_count', 'dropout_children_count',
        'distance_to_school_km', 'illiterate_adults_count', 'total_adults_count',
        'literate_females_count', 'total_females_count', 'highest_education_level_encoded',
        'highest_education_level',
        'midday_meal_access_yn', 'internet_access_yn', 'teachers_in_school', 'primary_school_nearby_yn'
    ],
    'shelter': [
        'village_id', 'village_name', 'household_id', 'surveyor_id', 'survey_date',
        'house_type', 'room_count', 'household_size', 'electricity_access_yn', 'toilet_access_yn',
        'drinking_water_source', 'flood_prone_yn', 'house_damaged_yn', 'persons_per_room',
        'owns_land_yn', 'pmay_beneficiary_yn', 'disaster_affected_yn', 'kitchen_separate_yn'
    ]
}

def generate_test_csvs():
    out_dir = os.path.join(os.path.dirname(__file__), '../test_csvs')
    os.makedirs(out_dir, exist_ok=True)
    
    village_id = "V_TEST_101"
    village_name = "Dantewada Test"
    survey_date = datetime.date.today().isoformat()
    
    files = {}
    writers = {}
    for survey_type, cols in SURVEY_COLUMNS.items():
        filepath = os.path.join(out_dir, f'{survey_type}_test_dantewada.csv')
        f = open(filepath, 'w', newline='', encoding='utf-8')
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        files[survey_type] = f
        writers[survey_type] = writer

    # Generate 100 HIGH VULNERABILITY rows
    for i in range(100):
        hh_id = f"HH_T_{i:03d}"
        
        writers['food'].writerow({
            'village_id': village_id, 'village_name': village_name,
            'household_id': hh_id, 'surveyor_id': 'SRV_101', 'survey_date': survey_date,
            'monthly_income': 1500, 'meals_per_day': 1, 'food_source_type': 'Market',
            'food_insecure_months_per_year': 8, 'child_malnutrition_yn': 1,
            'household_size': 6, 'ration_card_yn': 0, 'clean_water_access_yn': 0,
            'crop_failure_last_3yr': 2, 'food_aid_receipt_yn': 0, 'pds_access_yn': 0,
            'caloric_intake_score': 15
        })
        
        writers['health'].writerow({
            'village_id': village_id, 'village_name': village_name,
            'household_id': hh_id, 'surveyor_id': 'SRV_101', 'survey_date': survey_date,
            'infant_deaths_last_5yr': 1, 'maternal_deaths_last_5yr': 0, 'chronic_illness_count': 3,
            'distance_to_hospital_km': 45, 'hospital_visits_per_year': 1, 'vaccinated_children_pct': 10,
            'sanitation_access_yn': 0, 'clean_water_access_yn': 0, 'health_insurance_yn': 0,
            'malnourished_children_under5': 1, 'disability_count': 0, 'open_defecation_yn': 1
        })

        writers['education'].writerow({
            'village_id': village_id, 'village_name': village_name,
            'household_id': hh_id, 'surveyor_id': 'SRV_101', 'survey_date': survey_date,
            'school_age_children_count': 3, 'enrolled_children_count': 0, 'dropout_children_count': 3,
            'distance_to_school_km': 20, 'illiterate_adults_count': 4, 'total_adults_count': 4,
            'literate_females_count': 0, 'total_females_count': 2, 'highest_education_level_encoded': 0,
            'highest_education_level': 'None',
            'midday_meal_access_yn': 0, 'internet_access_yn': 0, 'teachers_in_school': 1, 'primary_school_nearby_yn': 0
        })

        writers['shelter'].writerow({
            'village_id': village_id, 'village_name': village_name,
            'household_id': hh_id, 'surveyor_id': 'SRV_101', 'survey_date': survey_date,
            'house_type': 'Kutcha', 'room_count': 1, 'household_size': 6,
            'electricity_access_yn': 0, 'toilet_access_yn': 0,
            'drinking_water_source': 'River', 'flood_prone_yn': 1, 'house_damaged_yn': 1,
            'persons_per_room': 6, 'owns_land_yn': 0, 'pmay_beneficiary_yn': 0, 'disaster_affected_yn': 1,
            'kitchen_separate_yn': 0
        })
        
    for f in files.values():
        f.close()

    print(f"Test CSVs generated in {out_dir}")

if __name__ == "__main__":
    generate_test_csvs()
