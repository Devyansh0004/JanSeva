const mongoose = require('mongoose');

const domainSkillMapSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  skills: [{ type: String }]
});

module.exports = mongoose.model('DomainSkillMap', domainSkillMapSchema, 'domainskillmap');
