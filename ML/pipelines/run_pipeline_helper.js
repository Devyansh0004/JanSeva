const mongoose = require('mongoose');
const { buildVulnerabilityPipeline, buildOverallVulnerabilityPipeline } = require('./villageVulnerability');
const smartMatch = require('./smartMatch');

async function runHelper() {
  const args = process.argv.slice(2);
  const campaignIdStr = args[0];
  const domain = args[1];

  await mongoose.connect('mongodb+srv://Harry_123:Harry123@cluster0.whzu2ah.mongodb.net/janseva');
  const db = mongoose.connection.db;

  try {
    // 1. Run domain vulnerability
    const domainMap = { 
      'Healthcare & Wellness': 'healthScore', 
      'Food Security & Distribution': 'foodScore', 
      'Education & Mentorship': 'educationScore', 
      'Shelter & Caregiving': 'shelterScore',
      'Emergency & Disaster Response': 'healthScore' // fallback
    };
    
    // We map the domain string to the survey type
    let surveyType = 'health';
    if (domain.includes('Food')) surveyType = 'food';
    if (domain.includes('Education')) surveyType = 'education';
    if (domain.includes('Shelter')) surveyType = 'shelter';
    if (domain.includes('Emergency')) surveyType = 'emergency';

    const p = buildVulnerabilityPipeline(surveyType, domainMap[domain] || 'healthScore');
    
    // Modify pipeline to filter by campaignId if we inserted campaignId into surveyresponses.
    // Wait, the python script will insert surveyresponses. We just need to ensure the pipeline runs.
    if (p) {
      await db.collection('surveyresponses').aggregate(p).toArray();
    }
    
    // 2. Run overall vulnerability
    await db.collection('villageScores').aggregate(buildOverallVulnerabilityPipeline()).toArray();
    
    // 3. Smart Matching
    const report = await smartMatch(campaignIdStr, domain);
    
    console.log(JSON.stringify({ success: true, report }));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  process.exit(0);
}

runHelper();
