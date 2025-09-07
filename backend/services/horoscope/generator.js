const moment = require('moment-timezone');

const zodiacTraits = {
  Aries: {
    keywords: ['energy', 'leadership', 'courage', 'action', 'initiative'],
    colors: ['Red', 'Orange', 'Crimson'],
    strengths: ['confident', 'determined', 'enthusiastic'],
    challenges: ['impatient', 'impulsive', 'competitive']
  },
  Taurus: {
    keywords: ['stability', 'comfort', 'perseverance', 'luxury', 'nature'],
    colors: ['Green', 'Pink', 'Earth Tones'],
    strengths: ['reliable', 'practical', 'devoted'],
    challenges: ['stubborn', 'possessive', 'uncompromising']
  },
  Gemini: {
    keywords: ['communication', 'curiosity', 'adaptability', 'learning', 'social'],
    colors: ['Yellow', 'Silver', 'Light Blue'],
    strengths: ['adaptable', 'outgoing', 'intelligent'],
    challenges: ['inconsistent', 'indecisive', 'anxious']
  },
  Cancer: {
    keywords: ['emotion', 'intuition', 'home', 'family', 'nurturing'],
    colors: ['White', 'Silver', 'Sea Blue'],
    strengths: ['loyal', 'emotional', 'sympathetic'],
    challenges: ['moody', 'pessimistic', 'suspicious']
  },
  Leo: {
    keywords: ['creativity', 'warmth', 'generosity', 'humor', 'drama'],
    colors: ['Gold', 'Orange', 'Yellow'],
    strengths: ['creative', 'passionate', 'generous'],
    challenges: ['arrogant', 'stubborn', 'self-centered']
  },
  Virgo: {
    keywords: ['perfectionism', 'service', 'health', 'analysis', 'organization'],
    colors: ['Navy Blue', 'Grey', 'Beige'],
    strengths: ['loyal', 'analytical', 'practical'],
    challenges: ['shyness', 'worry', 'overly critical']
  },
  Libra: {
    keywords: ['balance', 'harmony', 'justice', 'partnerships', 'beauty'],
    colors: ['Pink', 'Green', 'Light Blue'],
    strengths: ['cooperative', 'diplomatic', 'gracious'],
    challenges: ['indecisive', 'avoids confrontations', 'self-pity']
  },
  Scorpio: {
    keywords: ['intensity', 'passion', 'mystery', 'transformation', 'power'],
    colors: ['Deep Red', 'Black', 'Maroon'],
    strengths: ['resourceful', 'brave', 'passionate'],
    challenges: ['distrusting', 'jealous', 'secretive']
  },
  Sagittarius: {
    keywords: ['adventure', 'freedom', 'philosophy', 'travel', 'optimism'],
    colors: ['Purple', 'Turquoise', 'Light Blue'],
    strengths: ['generous', 'idealistic', 'great sense of humor'],
    challenges: ['promises more than can deliver', 'impatient', 'undiplomatic']
  },
  Capricorn: {
    keywords: ['ambition', 'discipline', 'responsibility', 'tradition', 'success'],
    colors: ['Brown', 'Black', 'Dark Green'],
    strengths: ['responsible', 'disciplined', 'good managers'],
    challenges: ['know-it-all', 'unforgiving', 'condescending']
  },
  Aquarius: {
    keywords: ['innovation', 'independence', 'humanitarian', 'originality', 'progressive'],
    colors: ['Light Blue', 'Silver', 'Aqua'],
    strengths: ['progressive', 'original', 'independent'],
    challenges: ['runs from emotional expression', 'temperamental', 'uncompromising']
  },
  Pisces: {
    keywords: ['compassion', 'artistic', 'intuitive', 'gentle', 'wise'],
    colors: ['Sea Green', 'Lavender', 'Purple'],
    strengths: ['compassionate', 'artistic', 'intuitive'],
    challenges: ['fearful', 'overly trusting', 'desire to escape reality']
  }
};

const templates = {
  career: [
    "Focus on {keyword} in your professional life today. {strength} will be your advantage.",
    "Your {strength} nature shines at work. Avoid being {challenge} with colleagues.",
    "Professional opportunities arise when you embrace your {keyword} side."
  ],
  love: [
    "In relationships, your {strength} quality attracts positive energy. Be mindful of {challenge} tendencies.",
    "Love flows when you balance {keyword} with understanding. Small gestures matter.",
    "Your {keyword} nature brings harmony to relationships today."
  ],
  finance: [
    "Financial decisions benefit from your {strength} approach. Avoid {challenge} spending habits.",
    "Money matters require {keyword} today. Your {strength} nature guides wise choices.",
    "Be {strength} with financial planning while avoiding {challenge} decisions."
  ],
  health: [
    "Your {strength} constitution supports good health. Focus on {keyword} activities.",
    "Physical wellness improves when you channel {keyword} energy positively.",
    "Health thrives with {strength} habits. Avoid {challenge} patterns today."
  ],
  personalGrowth: [
    "Personal development comes through embracing {keyword}. Your {strength} nature is an asset.",
    "Growth happens when you balance {strength} qualities with awareness of {challenge} patterns.",
    "Self-reflection on {keyword} brings valuable insights today."
  ]
};

function seedRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getRandomElement(array, seed) {
  const index = Math.floor(seedRandom(seed) * array.length);
  return array[index];
}

function generateContent(sunSign, date, section) {
  const traits = zodiacTraits[sunSign];
  const sectionTemplates = templates[section];
  
  const seed = `${sunSign}-${date}-${section}`.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const template = getRandomElement(sectionTemplates, seed);
  const keyword = getRandomElement(traits.keywords, seed + 1);
  const strength = getRandomElement(traits.strengths, seed + 2);
  const challenge = getRandomElement(traits.challenges, seed + 3);

  return template
    .replace(/{keyword}/g, keyword)
    .replace(/{strength}/g, strength)
    .replace(/{challenge}/g, challenge);
}

function generateHoroscope(sunSign, date) {
  const traits = zodiacTraits[sunSign];
  const dateSeed = date.replace(/-/g, '').slice(-4);
  const baseSeed = parseInt(dateSeed) + sunSign.length;

  const luckyNumbers = [];
  for (let i = 0; i < 2; i++) {
    luckyNumbers.push(((baseSeed + i * 7) % 9 + 1).toString());
  }

  const dos = [
    `Embrace your ${getRandomElement(traits.strengths, baseSeed + 10)} nature today.`,
    `Focus on ${getRandomElement(traits.keywords, baseSeed + 11)} activities.`,
    `Practice ${getRandomElement(['mindfulness', 'gratitude', 'patience'], baseSeed + 12)}.`
  ];

  const donts = [
    `Avoid being ${getRandomElement(traits.challenges, baseSeed + 20)} with others.`,
    `Don't neglect ${getRandomElement(['self-care', 'relationships', 'responsibilities'], baseSeed + 21)}.`
  ];

  const moodBase = (baseSeed % 3) + 2;
  
  return {
    date,
    timezone: 'Asia/Kolkata',
    locale: 'en-IN',
    sunSign,
    summary: `Today brings ${getRandomElement(traits.keywords, baseSeed)} energy — embrace your ${getRandomElement(traits.strengths, baseSeed + 1)} side.`,
    theme: `${getRandomElement(traits.keywords, baseSeed + 2).charAt(0).toUpperCase() + getRandomElement(traits.keywords, baseSeed + 2).slice(1)} & Growth`,
    notificationText: `Your ${sunSign} energy shines today — focus on what matters most.`,
    sections: {
      career: {
        title: 'Career & Work',
        text: generateContent(sunSign, date, 'career')
      },
      love: {
        title: 'Love & Relationships',
        text: generateContent(sunSign, date, 'love')
      },
      finance: {
        title: 'Money & Finance',
        text: generateContent(sunSign, date, 'finance')
      },
      health: {
        title: 'Health & Wellness',
        text: generateContent(sunSign, date, 'health')
      },
      personalGrowth: {
        title: 'Personal Growth',
        text: generateContent(sunSign, date, 'personalGrowth')
      }
    },
    dosAndDonts: { dos, donts },
    lucky: {
      numbers: luckyNumbers,
      colors: [getRandomElement(traits.colors, baseSeed + 30)],
      timeOfDay: `${(baseSeed % 12) + 6}:00-${(baseSeed % 12) + 8}:00 local`
    },
    moodRatings: {
      energy: Math.min(5, moodBase + (baseSeed % 2)),
      love: Math.min(5, moodBase + ((baseSeed + 1) % 2)),
      work: Math.min(5, moodBase + ((baseSeed + 2) % 2)),
      luck: Math.min(5, moodBase + ((baseSeed + 3) % 2))
    },
    affirmation: `I embrace my ${getRandomElement(traits.strengths, baseSeed + 40)} nature and create positive change.`,
    chartSnippet: {
      moonPosition: `Moon influences ${getRandomElement(traits.keywords, baseSeed + 50)} today`,
      majorTransit: [`${sunSign} energy heightened`, 'Positive planetary alignment']
    },
    comparison: {
      yesterdayVsToday: `More ${getRandomElement(traits.keywords, baseSeed + 60)} energy than yesterday.`,
      tomorrowPreview: `Tomorrow may bring opportunities for ${getRandomElement(traits.keywords, baseSeed + 61)}.`
    },
    explanation: `${sunSign} traits are highlighted today with positive planetary influences supporting ${getRandomElement(traits.keywords, baseSeed + 70)} activities.`,
    generationMetadata: {
      engine: 'rule-based-generator-v1',
      transitFlags: [`${sunSign.toLowerCase()}_energy`, 'positive_alignment'],
      templateVersion: 'v1.0',
      confidenceScore: 0.85 + (baseSeed % 10) / 100
    }
  };
}

module.exports = { generateHoroscope, zodiacTraits };