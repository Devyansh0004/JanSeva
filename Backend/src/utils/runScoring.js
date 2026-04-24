const mongoose = require('mongoose');
const path = require('path');

mongoose.connect('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva').then(async () => {
  const db = mongoose.connection.db;
  
  // Ensure unique index on volunteerId for merge
  try {
    await db.collection('volunteerscores').createIndex({ volunteerId: 1 }, { unique: true, sparse: true });
  } catch(e) { console.log('index exists'); }

  const { buildVolunteerScoringPipeline } = require(path.join(__dirname, '../../../ML/pipelines/volunteerScoring'));
  const pipeline = buildVolunteerScoringPipeline();
  
  await db.collection('volunteers').aggregate(pipeline, { allowDiskUse: true }).toArray();
  const count = await db.collection('volunteerscores').countDocuments();
  console.log('volunteerscores computed:', count);
  
  // Sample output
  const sample = await db.collection('volunteerscores').find().limit(2).toArray();
  console.log('Sample:', JSON.stringify(sample[0], null, 2));
  
  // Tier breakdown
  const tiers = await db.collection('volunteerscores').aggregate([
    { $group: { _id: '$tier', count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  console.log('Tier breakdown:', JSON.stringify(tiers));

  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
