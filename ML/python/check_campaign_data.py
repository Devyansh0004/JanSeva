from pymongo import MongoClient

db = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').janseva

# Find campaigns that have linked villageScores
campaigns = list(db.campaigns.find({}, {'_id': 1, 'title': 1, 'ngoSummary': 1}))
print(f"Total campaigns: {len(campaigns)}")

for camp in campaigns[:10]:
    cid = camp['_id']
    vs_count = db['villageScores'].count_documents({'campaignId': cid})
    vs_with_scores = db['villageScores'].count_documents({'campaignId': cid, 'healthScore': {'$exists': True, '$gt': 0}})
    regs = db['campaignregistrations'].count_documents({'campaignId': cid})
    print(f"Campaign: {str(cid)} | title: {camp.get('title','?')[:40]} | villageScores: {vs_count} (with sector: {vs_with_scores}) | regs: {regs}")
