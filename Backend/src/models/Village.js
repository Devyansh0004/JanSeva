const mongoose = require('mongoose');

const villageSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    village_id: { type: String, required: true },
    village_name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    population: { type: Number, required: true },
    survey_date: { type: Date, required: true },

    medical: {
      num_health_centers: { type: Number },
      avg_distance_to_hospital_km: { type: Number },
      doctors_per_1000: { type: Number },
      vaccination_coverage_pct: { type: Number },
      infant_mortality_rate_per_1000: { type: Number },
      malnutrition_children_pct: { type: Number },
      score: { type: Number, default: null },
    },

    food: {
      food_insecure_households_pct: { type: Number },
      avg_meals_per_day: { type: Number },
      clean_water_access_pct: { type: Number },
      crop_failure_last_3_years: { type: Number },
      ration_card_coverage_pct: { type: Number },
      score: { type: Number, default: null },
    },

    education: {
      literacy_rate_pct: { type: Number },
      school_enrollment_pct: { type: Number },
      student_teacher_ratio: { type: Number },
      dropout_rate_pct: { type: Number },
      distance_to_school_km: { type: Number },
      score: { type: Number, default: null },
    },

    shelter: {
      homeless_or_damaged_homes_pct: { type: Number },
      avg_persons_per_room: { type: Number },
      homes_without_electricity_pct: { type: Number },
      homes_without_sanitation_pct: { type: Number },
      disaster_affected_pct: { type: Number },
      score: { type: Number, default: null },
    },

    overall_priority_score: { type: Number, default: null },
  },
  { timestamps: true }
);

villageSchema.index({ campaignId: 1 });
villageSchema.index({ 'medical.score': -1 });
villageSchema.index({ 'food.score': -1 });
villageSchema.index({ 'education.score': -1 });
villageSchema.index({ 'shelter.score': -1 });
villageSchema.index({ overall_priority_score: -1 });

module.exports = mongoose.model('Village', villageSchema);
