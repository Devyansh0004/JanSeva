from pymongo import MongoClient

db = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').janseva
vols = list(db.volunteers.find({}))
vmap = {v['_id']: v['userId'] for v in vols if 'userId' in v}
regs = db.campaignregistrations.find({})
updated = 0

for r in regs:
    vid = r.get('volunteerId')
    if vid in vmap:
        db.campaignregistrations.update_one({'_id': r['_id']}, {'$set': {'volunteerId': vmap[vid]}})
        updated += 1

print(f'Updated {updated} regs from volunteer _id to userId')
