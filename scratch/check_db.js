
const mongoose = require('../Backend/node_modules/mongoose');
const dotenv = require('../Backend/node_modules/dotenv');
dotenv.config({ path: './Backend/.env' });

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const campaignId = '69eb53e5f7f892d2bac5a2a2';
    const regs = await db.collection('campaignregistrations').find({ campaignId: new mongoose.Types.ObjectId(campaignId) }).toArray();
    console.log(`Registrations for ${campaignId}:`, regs.length);
    const banswara = await db.collection('villageScores').findOne({ villageName: /Banswara/i });
    if (banswara) {
      const assignment = await db.collection('assignments').findOne({ village_id: banswara.villageId });
      console.log('Assignment for Banswara:', assignment);
    }
    process.exit(0);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkDB();
