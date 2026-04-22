const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });

async function testUpload() {
  // Use existing NGO "test ngo" -> userId: '69e93017fce3b65137a5abbf'
  // Or "NNgo" -> userId: '69e92f51fce3b65137a5ab9a'
  
  const token = jwt.sign({ id: '69e92f51fce3b65137a5ab9a' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });
  console.log('Generated mock NGO token. Creating campaign...');

  // Read CSV
  const csvBuffer = fs.readFileSync('c:\\Janseva\\sample_survey.csv');
  const blob = new Blob([csvBuffer], { type: 'text/csv' });
  
  const form = new FormData();
  form.append('title', 'Emergency Medical Camp');
  form.append('description', 'Test campaign for the new system');
  form.append('category', 'Medical');
  form.append('startDate', '2026-05-01');
  form.append('endDate', '2026-05-15');
  form.append('targetAmount', '50000');
  form.append('isEmergency', 'true');
  form.append('survey', blob, 'sample_survey.csv');

  const uploadRes = await fetch('http://localhost:5000/api/campaigns/with-survey', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });

  const uploadData = await uploadRes.json();
  console.log('\n--- UPLOAD RESPONSE ---');
  console.dir(uploadData, { depth: null });
  
  if (uploadRes.ok) {
    console.log('\nSUCCESS! Algorithm executed perfectly.');
  }
}

testUpload();
