/**
 * Database Seeder — populates MongoDB with realistic sample data for development/testing.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const connectDB = require('../config/db');
const logger = require('./logger');

const CATEGORIES = ['Food', 'Medical', 'Shelter', 'Education', 'Emergency', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur'];
const SKILLS = ['First Aid', 'Cooking', 'Driving', 'Teaching', 'Medical', 'Counselling', 'Construction'];
const AVAILABILITIES = ['Full-time', 'Part-time', 'Weekends', 'On-call'];

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
  ]);

  // ── Create Admin ─────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@janseva.org',
    password: 'Admin@1234',
    role: 'admin',
  });
  logger.info(`Admin created: ${admin.email}`);

  // ── Create NGO Users ──────────────────────────────────────────────────────
  const ngoUsers = await User.insertMany([
    { name: 'Seva Foundation', email: 'seva@ngo.org', password: 'Password@1', role: 'ngo' },
    { name: 'HelpHand NGO', email: 'helphand@ngo.org', password: 'Password@1', role: 'ngo' },
    { name: 'Aasra Trust', email: 'aasra@ngo.org', password: 'Password@1', role: 'ngo' },
  ]);

  // Create NGO profiles
  await NGO.insertMany(
    ngoUsers.map((u) => ({
      userId: u._id,
      name: u.name,
      organizationDetails: `${u.name} is a registered NGO working on humanitarian causes.`,
      focusAreas: [randomFrom(CATEGORIES), randomFrom(CATEGORIES)],
      contactInfo: { phone: '9876543210', website: `https://${u.name.toLowerCase().replace(/\s/g, '')}.org` },
      isVerified: true,
    }))
  );
  logger.info(`${ngoUsers.length} NGOs created`);

  // ── Create Volunteers ─────────────────────────────────────────────────────
  const volunteerUsers = [];
  for (let i = 1; i <= 15; i++) {
    volunteerUsers.push({
      name: `Volunteer ${i}`,
      email: `volunteer${i}@test.com`,
      password: 'Password@1',
      role: 'volunteer',
    });
  }
  const createdVols = await User.insertMany(volunteerUsers);

  await Volunteer.insertMany(
    createdVols.map((u) => ({
      userId: u._id,
      skills: [randomFrom(SKILLS), randomFrom(SKILLS)].filter((v, i, a) => a.indexOf(v) === i),
      availability: randomFrom(AVAILABILITIES),
      isAvailable: Math.random() > 0.4,
      location: { city: randomFrom(CITIES) },
    }))
  );
  logger.info(`${createdVols.length} Volunteers created`);

  // ── Create Regular Users ──────────────────────────────────────────────────
  const regularUsers = [];
  for (let i = 1; i <= 10; i++) {
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
  const requests = [];
  const now = new Date();

  for (let i = 0; i < 80; i++) {
    const status = randomFrom(STATUSES);
    const createdAt = new Date(now - randomInt(0, 365) * 24 * 60 * 60 * 1000);
    requests.push({
      title: `${randomFrom(CATEGORIES)} assistance needed in ${randomFrom(CITIES)}`,
      description: `Urgent ${randomFrom(CATEGORIES).toLowerCase()} support required for affected community members.`,
      category: randomFrom(CATEGORIES),
      location: { city: randomFrom(CITIES), state: 'India' },
      priority: randomFrom(PRIORITIES),
      status,
      createdBy: randomFrom(allCreators)._id,
      assignedVolunteers: status !== 'Pending' ? [randomFrom(createdVols)._id] : [],
      resolvedAt: status === 'Resolved' ? new Date() : null,
      beneficiaryCount: randomInt(1, 50),
      createdAt,
    });
  }

  await ServiceRequest.insertMany(requests);
  logger.info(`${requests.length} Service requests seeded`);

  logger.info('✅ Database seeding complete!');
  logger.info('──────────────────────────────────');
  logger.info('Test Credentials:');
  logger.info('  Admin:     admin@janseva.org / Admin@1234');
  logger.info('  NGO:       seva@ngo.org / Password@1');
  logger.info('  Volunteer: volunteer1@test.com / Password@1');
  logger.info('  User:      user1@test.com / Password@1');
  logger.info('──────────────────────────────────');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  logger.error(`Seeder failed: ${err.message}`);
  process.exit(1);
});
