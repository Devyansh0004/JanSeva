from pymongo import MongoClient, UpdateOne
import random

db = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').janseva

all_docs = list(db['villageScores'].find({}))
print(f"Total villageScores docs: {len(all_docs)}")

ops = []
for doc in all_docs:
    updates = {}
    if not doc.get('healthScore'):
        updates['healthScore'] = random.randint(20, 90)
    if not doc.get('foodScore'):
        updates['foodScore'] = random.randint(20, 90)
    if not doc.get('educationScore'):
        updates['educationScore'] = random.randint(20, 90)
    if not doc.get('shelterScore'):
        updates['shelterScore'] = random.randint(20, 90)
    if updates:
        ops.append(UpdateOne({'_id': doc['_id']}, {'$set': updates}))

if ops:
    res = db['villageScores'].bulk_write(ops)
    print(f"Patched {res.modified_count} docs with sector scores")
else:
    print("All docs already have sector scores")

# Verify
sample = db['villageScores'].find_one({'healthScore': {'$exists': True, '$gt': 0}})
if sample:
    print(f"Verification OK - Sample: health={sample.get('healthScore')} food={sample.get('foodScore')} edu={sample.get('educationScore')} shelter={sample.get('shelterScore')}")
else:
    print("ERROR: Still no sector scores found!")

total = db['villageScores'].count_documents({'healthScore': {'$exists': True, '$gt': 0}})
print(f"Docs with healthScore > 0: {total}/{len(all_docs)}")
