/**
 * Database Seeder — v2.0
 * Populates MongoDB with realistic sample data.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const Contribution = require('../models/Contribution');
const Campaign = require('../models/Campaign');
const connectDB = require('../config/db');
const logger = require('./logger');

const CATEGORIES = ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];
const SKILLS = ['First Aid', 'Cooking', 'Driving', 'Teaching', 'Medical', 'Counselling', 'Construction', 'IT Support', 'Logistics', 'Translation'];
const AVAILABILITIES = ['Full-time', 'Part-time', 'Weekends', 'On-call'];

const NGO_DATA = [
  { name: 'Seva Foundation', state: 'Maharashtra', city: 'Mumbai', lat: 19.076, lng: 72.8777, focus: ['Food', 'Shelter'] },
  { name: 'HelpHand Trust', state: 'Maharashtra', city: 'Pune', lat: 18.5204, lng: 73.8567, focus: ['Education', 'Medical'] },
  { name: 'Aasra Welfare Society', state: 'Delhi', city: 'New Delhi', lat: 28.6139, lng: 77.2090, focus: ['Shelter', 'Emergency'] },
  { name: 'Pragati Sansthan', state: 'Bihar', city: 'Patna', lat: 25.6093, lng: 85.1376, focus: ['Education', 'Food'] },
  { name: 'Jan Kalyan Trust', state: 'Bihar', city: 'Gaya', lat: 24.7955, lng: 84.9994, focus: ['Medical', 'Food'] },
  { name: 'Sahyog Foundation', state: 'Uttar Pradesh', city: 'Lucknow', lat: 26.8467, lng: 80.9462, focus: ['Education', 'Shelter'] },
  { name: 'Disha Charitable Trust', state: 'Uttar Pradesh', city: 'Varanasi', lat: 25.3176, lng: 82.9739, focus: ['Food', 'Medical'] },
  { name: 'Navjeevan Society', state: 'Gujarat', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714, focus: ['Shelter', 'Education'] },
  { name: 'Karuna Foundation', state: 'Gujarat', city: 'Surat', lat: 21.1702, lng: 72.8311, focus: ['Medical', 'Emergency'] },
  { name: 'Akshaya Patra South', state: 'Karnataka', city: 'Bangalore', lat: 12.9716, lng: 77.5946, focus: ['Food', 'Education'] },
  { name: 'Samarthan NGO', state: 'Karnataka', city: 'Mysore', lat: 12.2958, lng: 76.6394, focus: ['Medical', 'Shelter'] },
  { name: 'Hope Foundation', state: 'Tamil Nadu', city: 'Chennai', lat: 13.0827, lng: 80.2707, focus: ['Education', 'Emergency'] },
  { name: 'Asha Deep Trust', state: 'Tamil Nadu', city: 'Madurai', lat: 9.9252, lng: 78.1198, focus: ['Food', 'Shelter'] },
  { name: 'Unnati Welfare', state: 'Rajasthan', city: 'Jaipur', lat: 26.9124, lng: 75.7873, focus: ['Education', 'Other'] },
  { name: 'Jeevan Dhara Society', state: 'Rajasthan', city: 'Jodhpur', lat: 26.2389, lng: 73.0243, focus: ['Medical', 'Food'] },
  { name: 'Sewa Bharati', state: 'Madhya Pradesh', city: 'Bhopal', lat: 23.2599, lng: 77.4126, focus: ['Shelter', 'Emergency'] },
  { name: 'Manav Seva Sangh', state: 'Madhya Pradesh', city: 'Indore', lat: 22.7196, lng: 75.8577, focus: ['Food', 'Education'] },
  { name: 'Annapurna Trust', state: 'West Bengal', city: 'Kolkata', lat: 22.5726, lng: 88.3639, focus: ['Food', 'Medical'] },
  { name: 'Udaan Foundation', state: 'West Bengal', city: 'Siliguri', lat: 26.7271, lng: 88.3953, focus: ['Education', 'Shelter'] },
  { name: 'Sahara Support Group', state: 'Telangana', city: 'Hyderabad', lat: 17.3850, lng: 78.4867, focus: ['Medical', 'Emergency'] },
  { name: 'Prerna Charitable Trust', state: 'Andhra Pradesh', city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, focus: ['Education', 'Food'] },
  { name: 'Jyoti Foundation', state: 'Kerala', city: 'Kochi', lat: 9.9312, lng: 76.2673, focus: ['Medical', 'Shelter'] },
  { name: 'Sneha Trust Kerala', state: 'Kerala', city: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, focus: ['Emergency', 'Food'] },
  { name: 'Nirmaan Organization', state: 'Punjab', city: 'Chandigarh', lat: 30.7333, lng: 76.7794, focus: ['Shelter', 'Education'] },
  { name: 'Udyog Sathi', state: 'Punjab', city: 'Amritsar', lat: 31.6340, lng: 74.8723, focus: ['Food', 'Other'] },
  { name: 'Pahal Foundation', state: 'Jharkhand', city: 'Ranchi', lat: 23.3441, lng: 85.3096, focus: ['Education', 'Medical'] },
  { name: 'Samvedna Trust', state: 'Chhattisgarh', city: 'Raipur', lat: 21.2514, lng: 81.6296, focus: ['Food', 'Shelter'] },
  { name: 'Arogya Foundation', state: 'Odisha', city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, focus: ['Medical', 'Emergency'] },
  { name: 'Lok Kalyan Samiti', state: 'Assam', city: 'Guwahati', lat: 26.1445, lng: 91.7362, focus: ['Education', 'Food'] },
  { name: 'Himalayan Welfare Trust', state: 'Uttarakhand', city: 'Dehradun', lat: 30.3165, lng: 78.0322, focus: ['Emergency', 'Shelter'] },
  { name: 'Green Earth Society', state: 'Haryana', city: 'Gurugram', lat: 28.4595, lng: 77.0266, focus: ['Other', 'Education'] },
  { name: 'Shakti Foundation', state: 'Goa', city: 'Panaji', lat: 15.4909, lng: 73.8278, focus: ['Medical', 'Food'] },
  { name: 'Tribal Welfare Association', state: 'Manipur', city: 'Imphal', lat: 24.8170, lng: 93.9368, focus: ['Education', 'Shelter'] },
  { name: 'Northeast Aid Society', state: 'Meghalaya', city: 'Shillong', lat: 25.5788, lng: 91.8933, focus: ['Food', 'Emergency'] },
  { name: 'Bharat Vikas Parishad', state: 'Himachal Pradesh', city: 'Shimla', lat: 31.1048, lng: 77.1734, focus: ['Shelter', 'Medical'] },
];

const INDIAN_STATES = [...new Set(NGO_DATA.map(n => n.state))];
const INDIAN_CITIES = {};
NGO_DATA.forEach(n => {
  if (!INDIAN_CITIES[n.state]) INDIAN_CITIES[n.state] = [];
  if (!INDIAN_CITIES[n.state].includes(n.city)) INDIAN_CITIES[n.state].push(n.city);
});

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  await connectDB();
  logger.info('Seeder connected to DB. Clearing existing data...');

  await Promise.all([
    User.deleteMany({}),
    ServiceRequest.deleteMany({}),
    Volunteer.deleteMany({}),
    NGO.deleteMany({}),
    Contribution.deleteMany({}),
    Campaign.deleteMany({}),
  ]);

  // ── Create Admin ──────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@janseva.org',
    password: 'Admin@1234',
    role: 'admin',
  });
  logger.info(`Admin created: ${admin.email}`);

  // ── Create NGO Users & Profiles ──────────────────────────────────────────
  const ngoUsers = [];
  const ngoProfiles = [];

  for (let i = 0; i < NGO_DATA.length; i++) {
    const ngo = NGO_DATA[i];
    const emailSlug = ngo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const user = await User.create({
      name: ngo.name,
      email: `${emailSlug}@ngo.org`,
      password: 'Password@1',
      role: 'ngo',
    });
    ngoUsers.push(user);

    const volCount = randomInt(10, 200);
    const contributions = randomInt(50000, 5000000);
    let contribLevel = 'Low';
    if (contributions > 3000000) contribLevel = 'Critical';
    else if (contributions > 1500000) contribLevel = 'High';
    else if (contributions > 500000) contribLevel = 'Medium';

    ngoProfiles.push({
      userId: user._id,
      name: ngo.name,
      organizationDetails: `${ngo.name} is a registered NGO based in ${ngo.city}, ${ngo.state}, working on ${ngo.focus.join(' and ').toLowerCase()} services for underserved communities.`,
      focusAreas: ngo.focus,
      state: ngo.state,
      city: ngo.city,
      coordinates: { lat: ngo.lat, lng: ngo.lng },
      location: { type: 'Point', coordinates: [ngo.lng, ngo.lat] }, // GeoJSON [lng, lat]
      volunteerCount: volCount,
      contributionLevel: contribLevel,
      totalContributions: contributions,
      contactInfo: {
        phone: `${randomInt(70000, 99999)}${randomInt(10000, 99999)}`,
        website: `https://${emailSlug}.org`,
        address: `${randomInt(1, 500)}, Main Road, ${ngo.city}, ${ngo.state}`,
      },
      isVerified: true, // ✅ FIX: all NGOs verified so stats work
      impactScore: randomInt(20, 100),
      foundedYear: randomInt(1990, 2022),
    });
  }

  const insertedNGOs = await NGO.insertMany(ngoProfiles);
  logger.info(`${NGO_DATA.length} NGOs created (all verified)`);

  // ── Create Volunteers ─────────────────────────────────────────────────────
  const volunteerUsers = [];
  for (let i = 1; i <= 40; i++) {
    volunteerUsers.push({
      name: `Volunteer ${i}`,
      email: `volunteer${i}@test.com`,
      password: 'Password@1',
      role: 'volunteer',
    });
  }
  const createdVols = await User.insertMany(volunteerUsers);

  const volunteerProfiles = createdVols.map((u) => {
    const state = randomFrom(INDIAN_STATES);
    const cities = INDIAN_CITIES[state] || [state];
    return {
      userId: u._id,
      skills: [...new Set([randomFrom(SKILLS), randomFrom(SKILLS), randomFrom(SKILLS)])],
      availability: randomFrom(AVAILABILITIES),
      isAvailable: Math.random() > 0.35,
      completedRequests: randomInt(0, 50),
      rating: parseFloat((Math.random() * 3 + 2).toFixed(1)),
      location: { city: randomFrom(cities), state },
    };
  });

  await Volunteer.insertMany(volunteerProfiles);
  logger.info(`${createdVols.length} Volunteers created`);

  // ── Create Regular Users ──────────────────────────────────────────────────
  const regularUsers = [];
  for (let i = 1; i <= 20; i++) {
    regularUsers.push({
      name: `User ${i}`,
      email: `user${i}@test.com`,
      password: 'Password@1',
      role: 'user',
    });
  }
  const createdUsers = await User.insertMany(regularUsers);
  logger.info(`${createdUsers.length} Regular users created`);

  // ── Create Service Requests ───────────────────────────────────────────────
  const allCreators = [...ngoUsers, ...createdUsers];
  const requestTitles = {
    Food: ['Food packets needed', 'Community kitchen setup', 'Ration distribution drive', 'Mid-day meal program', 'Emergency food supply'],
    Medical: ['Medical camp required', 'First aid kits needed', 'Health checkup drive', 'Medicine distribution', 'Emergency medical aid'],
    Shelter: ['Temporary shelter setup', 'Roof repair assistance', 'Flood relief shelter', 'Winter blanket distribution', 'Housing support needed'],
    Education: ['Tutoring volunteers needed', 'Books and supplies drive', 'Digital literacy camp', 'Scholarship support', 'School infrastructure help'],
    Emergency: ['Flood relief coordination', 'Earthquake response team', 'Fire disaster support', 'Cyclone relief effort', 'Emergency evacuation help'],
    Other: ['Community cleanup drive', 'Awareness campaign', 'Skill development workshop', 'Tree plantation drive', 'Blood donation camp'],
  };

  const requests = [];
  const now = new Date();
  for (let i = 0; i < 250; i++) {
    const category = randomFrom(CATEGORIES);
    const status = randomFrom(STATUSES);
    const ngoData = randomFrom(NGO_DATA);
    const createdAt = new Date(now - randomInt(0, 545) * 24 * 60 * 60 * 1000);
    requests.push({
      title: `${randomFrom(requestTitles[category])} in ${ngoData.city}`,
      description: `Urgent ${category.toLowerCase()} support required in ${ngoData.city}, ${ngoData.state}.`,
      category,
      location: { city: ngoData.city, state: ngoData.state },
      priority: randomFrom(PRIORITIES),
      status,
      createdBy: randomFrom(allCreators)._id,
      assignedVolunteers: status !== 'Pending' ? [randomFrom(createdVols)._id] : [],
      resolvedAt: status === 'Resolved' ? new Date(createdAt.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000) : null,
      beneficiaryCount: randomInt(1, 200),
      tags: [category.toLowerCase(), ngoData.state.toLowerCase()],
      createdAt,
    });
  }
  await ServiceRequest.insertMany(requests);
  logger.info(`${requests.length} Service requests seeded`);

  // ── Create Contributions ─────────────────────────────────────────────────
  const allUserIds = [...ngoUsers, ...createdUsers, ...createdVols].map(u => u._id);
  const contributions = [];
  const contribTypes = ['monetary', 'hours', 'supplies'];
  for (let i = 0; i < 200; i++) {
    const type = randomFrom(contribTypes);
    const ngo = insertedNGOs[randomInt(0, insertedNGOs.length - 1)];
    contributions.push({
      userId: randomFrom(allUserIds),
      ngoId: ngo._id,
      type,
      amount: type === 'monetary' ? randomInt(500, 50000) : 0,
      hours: type === 'hours' ? randomInt(1, 40) : 0,
      note: type === 'monetary' ? 'Donation for community relief' : type === 'hours' ? 'Field volunteering session' : 'Supply donation',
      date: new Date(now - randomInt(0, 365) * 24 * 60 * 60 * 1000),
    });
  }
  await Contribution.insertMany(contributions);
  logger.info(`${contributions.length} Contributions seeded`);

  // ── Create Campaigns ─────────────────────────────────────────────────────
  const campaignTitles = [
    'Feed 1000 Families', 'Winter Blanket Drive', 'Digital India Classroom',
    'Mobile Medical Unit', 'Flood Relief 2024', 'Clean Water Initiative',
    'Skill India Workshop', 'Mid-Day Meal Expansion', 'Rural Health Camp',
    'Emergency Response Training',
  ];
  const campaigns = [];
  for (let i = 0; i < 20; i++) {
    const ngo = insertedNGOs[i % insertedNGOs.length];
    const ngoData = NGO_DATA[i % NGO_DATA.length];
    const startDate = new Date(now - randomInt(0, 60) * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + randomInt(30, 120) * 24 * 60 * 60 * 1000);
    const target = randomInt(50000, 500000);
    const raised = randomInt(10000, target);
    const statuses = ['Active', 'Active', 'Active', 'Upcoming', 'Completed'];
    campaigns.push({
      ngoId: ngo._id,
      title: campaignTitles[i % campaignTitles.length],
      description: `A coordinated effort by ${ngo.name} to provide ${ngoData.focus[0].toLowerCase()} assistance to underserved communities across ${ngoData.state}.`,
      category: randomFrom(CATEGORIES),
      targetAmount: target,
      raisedAmount: raised,
      volunteerTarget: randomInt(10, 100),
      volunteers: createdVols.slice(0, randomInt(2, 8)).map(v => v._id),
      startDate,
      endDate,
      status: randomFrom(statuses),
      state: ngoData.state,
      city: ngoData.city,
      ngoSummary: { name: ngo.name, city: ngoData.city, state: ngoData.state },
    });
  }
  await Campaign.insertMany(campaigns);
  logger.info(`${campaigns.length} Campaigns seeded`);

  logger.info('');
  logger.info('✅ Database seeding v2.0 complete!');
  logger.info('──────────────────────────────────────');
  logger.info('Test Credentials:');
  logger.info('  Admin:     admin@janseva.org     / Admin@1234');
  logger.info('  NGO:       sevafoundation@ngo.org / Password@1');
  logger.info('  Volunteer: volunteer1@test.com   / Password@1');
  logger.info('  User:      user1@test.com        / Password@1');
  logger.info('──────────────────────────────────────');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seeder failed: ${err.message}`);
  process.exit(1);
});
