const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  text: {
    type: String,
    required: true,
    maxlength: 200
  }
}, { _id: false });

const horoscopeSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  locale: {
    type: String,
    default: 'en-IN'
  },
  sunSign: {
    type: String,
    required: true,
    enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  },
  summary: {
    type: String,
    maxlength: 140
  },
  theme: {
    type: String,
    maxlength: 50
  },
  notificationText: {
    type: String,
    maxlength: 80
  },
  sections: {
    career: sectionSchema,
    love: sectionSchema,
    finance: sectionSchema,
    health: sectionSchema,
    personalGrowth: sectionSchema
  },
  dosAndDonts: {
    dos: [{
      type: String,
      maxlength: 60
    }],
    donts: [{
      type: String,
      maxlength: 60
    }]
  },
  lucky: {
    numbers: [{
      type: String
    }],
    colors: [{
      type: String
    }],
    timeOfDay: String
  },
  moodRatings: {
    energy: {
      type: Number,
      min: 0,
      max: 5
    },
    love: {
      type: Number,
      min: 0,
      max: 5
    },
    work: {
      type: Number,
      min: 0,
      max: 5
    },
    luck: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  affirmation: {
    type: String,
    maxlength: 90
  },
  chartSnippet: {
    moonPosition: String,
    majorTransit: [String]
  },
  comparison: {
    yesterdayVsToday: String,
    tomorrowPreview: String
  },
  explanation: {
    type: String,
    maxlength: 300
  },
  generationMetadata: {
    engine: String,
    transitFlags: [String],
    templateVersion: {
      type: String,
      default: 'v1.0'
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

horoscopeSchema.index({ sunSign: 1, date: -1 }, { unique: true });
horoscopeSchema.index({ date: -1 });

module.exports = mongoose.model('Horoscope', horoscopeSchema);