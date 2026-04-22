const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

dotenv.config({ path: '../../.env' }); // load env from backend root

const seedVols = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/janseva');
    console.log('DB connected');

    // delete existing dummy vols
    const dummyUsers = await User.find({ email: /@dummy.com/ });
    const dummyIds = dummyUsers.map(u => u._id);
    await User.deleteMany({ _id: { $in: dummyIds } });
    await Volunteer.deleteMany({ userId: { $in: dummyIds } });

    console.log('Seeding 65 test volunteers...');
    const users = [];
    const hash = await bcrypt.hash('Password123', 10);
    
    for (let i = 1; i <= 65; i++) {
      users.push({
        name: `Test Volunteer ${i}`,
        email: `vol${i}@dummy.com`,
        password: hash,
        role: 'volunteer',
        isVerified: true
      });
    }

    const insertedUsers = await User.insertMany(users);

    const vols = insertedUsers.map((u, i) => {
      // mix domains up
      const allDomains = ['medical', 'food', 'education', 'shelter'];
      const domains = [];
      domains.push(allDomains[i % 4]);
      if (i % 2 === 0) domains.push(allDomains[(i + 1) % 4]);
      
      return {
        userId: u._id,
        volunteeringHours: Math.floor(Math.random() * 500),
        domains: domains
      };
    });

    await Volunteer.insertMany(vols);

    console.log('Successfully seeded 65 volunteers!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedVols();
