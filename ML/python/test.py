from pymongo import MongoClient
db = MongoClient('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').janseva
docs = list(db.campaignregistrations.find())
count = 0
for d in docs:
    if str(d.get('campaignId')) == '69eb52b5f7f892d2bac5a0da':
        count += 1
print('Total matching string id:', count)
