"""
Create 5 demo campaigns for Seva Foundation via the JanSeva API.
Each campaign has its own domain-specific CSV uploaded as survey data.
Domains: Food, Education, Shelter, Health, All-4-combined.
"""
import requests, json, datetime, io, os

BASE = 'http://localhost:5000/api'

# ── Login as Seva Foundation ───────────────────────────────────────────────────
resp = requests.post(f'{BASE}/auth/login', json={'email': 'sevafoundation@gmail.com', 'password': 'Password@1234'})
resp_json = resp.json()
token = resp_json.get('data', {}).get('token') or resp_json.get('token')
if not token:
    print('Login failed:', resp.text); exit(1)
print('Logged in. Token:', token[:20], '...')
headers = {'Authorization': f'Bearer {token}'}

# ── CSV Templates ──────────────────────────────────────────────────────────────
FOOD_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_F001,Rampur,Uttar Pradesh,Bareilly,3200,2024-01-10,72,1.5,28,2,35,85,22,18,8,0.4,62,71,42,15,3,12,2.1,24,38,5
VIL_F002,Kheda,Gujarat,Anand,1800,2024-01-10,65,1.8,35,1,42,88,18,14,6,0.6,68,76,38,12,2,8,1.9,18,30,3
VIL_F003,Chandpur,Bihar,Bhojpur,4500,2024-01-10,80,1.2,18,3,22,78,28,25,12,0.2,48,55,52,22,5,18,2.4,35,48,8
VIL_F004,Sultanpur,Uttar Pradesh,Sultanpur,2700,2024-01-10,68,1.6,32,2,38,82,20,16,9,0.4,58,68,44,16,4,10,2.0,26,40,4
VIL_F005,Faridpur,Bihar,Ara,3100,2024-01-10,75,1.3,22,2,28,80,24,21,10,0.3,52,60,48,19,4,14,2.2,30,44,6
VIL_F006,Narhar,Rajasthan,Jhunjhunu,2200,2024-01-10,58,2.0,42,1,48,90,16,12,7,0.7,72,80,35,10,2,6,1.7,15,25,2
"""

EDUCATION_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_E001,Kotra,Rajasthan,Udaipur,2800,2024-02-05,30,2.5,60,0,65,88,12,8,7,0.6,32,28,62,38,8,10,1.8,20,30,3
VIL_E002,Morkheda,Madhya Pradesh,Khandwa,1900,2024-02-05,28,2.6,65,0,70,90,10,7,6,0.7,38,34,58,34,7,8,1.7,18,26,2
VIL_E003,Tigiria,Odisha,Cuttack,3500,2024-02-05,25,2.8,70,0,72,92,8,6,5,0.8,28,22,68,44,10,6,1.6,15,22,2
VIL_E004,Silapathar,Assam,Dhemaji,2100,2024-02-05,32,2.4,58,1,62,86,14,9,8,0.5,42,38,55,32,7,12,2.0,22,34,4
VIL_E005,Tundi,Jharkhand,Dhanbad,4200,2024-02-05,22,2.9,72,0,75,94,7,5,4,0.9,25,18,72,48,12,5,1.5,12,18,1
VIL_E006,Badarpur,Assam,Karimganj,2600,2024-02-05,35,2.3,55,1,58,84,15,10,9,0.4,45,42,52,30,6,14,2.1,25,36,4
"""

SHELTER_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_S001,Bargaon,Odisha,Sambalpur,3800,2024-03-01,20,2.8,65,0,70,90,10,7,6,0.7,62,70,35,12,3,58,3.2,62,75,42
VIL_S002,Saraikela,Jharkhand,Saraikela,2400,2024-03-01,18,2.9,70,0,75,92,8,5,5,0.8,68,75,32,10,2,52,3.0,55,68,36
VIL_S003,Govindpur,Jharkhand,Dhanbad,1700,2024-03-01,22,2.7,60,1,65,88,12,8,7,0.6,58,65,38,14,3,65,3.5,70,80,50
VIL_S004,Kharsia,Chhattisgarh,Raigarh,5100,2024-03-01,15,3.0,72,0,78,94,7,5,4,0.9,72,80,28,8,2,45,2.8,48,60,30
VIL_S005,Ambikapur,Chhattisgarh,Surguja,2900,2024-03-01,25,2.5,55,1,60,85,14,10,8,0.5,55,60,42,16,4,70,3.8,75,85,55
"""

HEALTH_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_H001,Kushinagar,Uttar Pradesh,Kushinagar,6200,2024-04-01,35,2.3,45,1,55,42,68,38,18,0.1,55,62,40,16,4,12,2.0,25,38,5
VIL_H002,Mandla,Madhya Pradesh,Mandla,4100,2024-04-01,30,2.5,52,0,62,48,58,32,15,0.15,60,68,36,13,3,10,1.9,22,34,4
VIL_H003,Phulambri,Maharashtra,Aurangabad,2800,2024-04-01,28,2.6,55,0,65,52,52,28,12,0.2,63,72,34,12,3,8,1.8,20,30,3
VIL_H004,Nandgaon,Maharashtra,Nashik,3500,2024-04-01,32,2.4,48,1,58,45,62,35,16,0.12,58,65,38,14,4,11,2.0,23,36,4
VIL_H005,Devgarh,Rajasthan,Pali,1900,2024-04-01,22,2.8,60,0,70,38,72,42,20,0.08,50,58,42,18,5,9,1.8,18,28,3
VIL_H006,Palasner,Maharashtra,Pune,2300,2024-04-01,18,3.0,65,0,75,55,45,22,10,0.25,70,78,30,10,2,6,1.6,15,22,2
"""

MULTI_CSV = """village_id,village_name,state,district,population,survey_date,food_insecure_households_pct,avg_meals_per_day,clean_water_access_pct,crop_failure_last_3_years,ration_card_coverage_pct,vaccination_coverage_pct,infant_mortality_rate_per_1000,malnutrition_children_pct,avg_distance_to_hospital_km,doctors_per_1000,literacy_rate_pct,school_enrollment_pct,student_teacher_ratio,dropout_rate_pct,distance_to_school_km,homeless_or_damaged_homes_pct,avg_persons_per_room,homes_without_electricity_pct,homes_without_sanitation_pct,disaster_affected_pct
VIL_M001,Jharia,Jharkhand,Dhanbad,8500,2024-05-01,68,1.5,25,2,32,45,55,35,18,0.15,38,42,58,28,7,52,3.2,65,72,38
VIL_M002,Bari,Rajasthan,Dholpur,5200,2024-05-01,55,1.8,35,2,42,52,48,28,15,0.2,45,50,52,24,6,45,2.8,55,65,32
VIL_M003,Palasner,Maharashtra,Pune,3800,2024-05-01,45,2.0,42,1,50,58,42,22,12,0.25,52,58,46,20,5,38,2.5,45,55,25
VIL_M004,Banswara,Rajasthan,Banswara,6800,2024-05-01,72,1.3,20,3,28,40,62,40,20,0.1,32,35,62,32,8,58,3.5,70,78,44
VIL_M005,Dumka,Jharkhand,Dumka,4500,2024-05-01,60,1.6,30,2,38,48,52,30,16,0.18,42,48,55,26,6,48,3.0,58,68,35
VIL_M006,Dantewada,Chhattisgarh,Dantewada,3200,2024-05-01,78,1.2,18,3,22,38,68,44,22,0.08,28,32,65,35,9,62,3.8,75,82,48
VIL_M007,Bijapur,Chhattisgarh,Bijapur,2900,2024-05-01,70,1.4,22,2,28,42,60,38,19,0.12,35,38,60,30,8,55,3.3,68,75,42
"""

CAMPAIGNS = [
    {
        'title': 'Seva Food Security Drive 2024',
        'description': 'Targeting food insecurity in 6 villages across UP and Bihar. Providing ration kits, nutritional support, and clean water access to the most vulnerable families.',
        'category': 'Food',
        'startDate': (datetime.datetime.now() + datetime.timedelta(days=5)).strftime('%Y-%m-%d'),
        'endDate': (datetime.datetime.now() + datetime.timedelta(days=25)).strftime('%Y-%m-%d'),
        'targetAmount': 450000,
        'isEmergency': False,
        'domainTargets': {'food': {'villages': 4, 'volunteers': 15}},
        'csv': FOOD_CSV,
        'filename': 'food_survey.csv',
    },
    {
        'title': 'Seva Rural Education Mission',
        'description': 'Addressing critical dropout rates and poor enrollment in 6 villages across Rajasthan, Odisha, and Assam. Deploying teaching volunteers and setting up mobile classrooms.',
        'category': 'Education',
        'startDate': (datetime.datetime.now() + datetime.timedelta(days=12)).strftime('%Y-%m-%d'),
        'endDate': (datetime.datetime.now() + datetime.timedelta(days=35)).strftime('%Y-%m-%d'),
        'targetAmount': 320000,
        'isEmergency': False,
        'domainTargets': {'education': {'villages': 4, 'volunteers': 12}},
        'csv': EDUCATION_CSV,
        'filename': 'education_survey.csv',
    },
    {
        'title': 'Seva Shelter Restoration Camp',
        'description': 'Emergency shelter restoration for disaster-affected families in 5 villages across Odisha, Jharkhand, and Chhattisgarh. Providing construction materials and skilled labour.',
        'category': 'Shelter',
        'startDate': (datetime.datetime.now() + datetime.timedelta(days=20)).strftime('%Y-%m-%d'),
        'endDate': (datetime.datetime.now() + datetime.timedelta(days=45)).strftime('%Y-%m-%d'),
        'targetAmount': 580000,
        'isEmergency': True,
        'domainTargets': {'shelter': {'villages': 3, 'volunteers': 18}},
        'csv': SHELTER_CSV,
        'filename': 'shelter_survey.csv',
    },
    {
        'title': 'Seva Rural Health Camp 2024',
        'description': 'Mobile medical units serving 6 villages in Maharashtra and UP with high infant mortality and low vaccination coverage. Deploying doctors and first aid volunteers.',
        'category': 'Medical',
        'startDate': (datetime.datetime.now() + datetime.timedelta(days=28)).strftime('%Y-%m-%d'),
        'endDate': (datetime.datetime.now() + datetime.timedelta(days=50)).strftime('%Y-%m-%d'),
        'targetAmount': 620000,
        'isEmergency': False,
        'domainTargets': {'medical': {'villages': 4, 'volunteers': 20}},
        'csv': HEALTH_CSV,
        'filename': 'health_survey.csv',
    },
    {
        'title': 'Seva Integrated Village Aid 2024',
        'description': 'Comprehensive multi-domain relief across 7 of the most vulnerable villages in Jharkhand, Rajasthan, and Chhattisgarh — covering food, health, education, and shelter simultaneously.',
        'category': 'Multi-Domain Aid',
        'startDate': (datetime.datetime.now() + datetime.timedelta(days=35)).strftime('%Y-%m-%d'),
        'endDate': (datetime.datetime.now() + datetime.timedelta(days=65)).strftime('%Y-%m-%d'),
        'targetAmount': 950000,
        'isEmergency': True,
        'domainTargets': {
            'food': {'villages': 3, 'volunteers': 10},
            'medical': {'villages': 3, 'volunteers': 10},
            'education': {'villages': 2, 'volunteers': 8},
            'shelter': {'villages': 2, 'volunteers': 8},
        },
        'csv': MULTI_CSV,
        'filename': 'multi_domain_survey.csv',
    },
]

created = []
for camp in CAMPAIGNS:
    form = {
        'title': (None, camp['title']),
        'description': (None, camp['description']),
        'category': (None, camp['category']),
        'startDate': (None, camp['startDate']),
        'endDate': (None, camp['endDate']),
        'targetAmount': (None, str(camp['targetAmount'])),
        'isEmergency': (None, str(camp['isEmergency']).lower()),
        'domainTargets': (None, json.dumps(camp['domainTargets'])),
    }
    files = {k: v for k, v in form.items()}
    files['survey'] = (camp['filename'], io.BytesIO(camp['csv'].strip().encode()), 'text/csv')

    r = requests.post(f'{BASE}/campaigns/with-survey', headers=headers, files=files)
    data = r.json()
    if r.ok:
        cid = data['data']['campaign']['_id']
        vp = data['data'].get('villagesProcessed', 0)
        ac = data['data'].get('assignmentsCreated', 0)
        print(f"  Created: {camp['title'][:50]} | id={cid} | villages={vp} | assignments={ac}")
        created.append(cid)
    else:
        print(f"  FAILED: {camp['title'][:50]} | {data.get('message', r.text[:100])}")

print(f"\nTotal campaigns created: {len(created)}")
print("Campaign IDs:")
for cid in created:
    print(f"  {cid}")
