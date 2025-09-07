require('dotenv').config();
const { Pool } = require('pg');
const moment = require('moment-timezone');

const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const sampleHoroscopes = {
  'Aries': {
    summary: "Today brings clarity and decisive energy — focus on one important goal and push forward with confidence.",
    theme: "Leadership & Action",
    notification_text: "Your leadership shines today — take charge of important decisions.",
    sections: {
      career: {
        title: "Career & Work",
        text: "A breakthrough moment awaits at work. Your natural leadership abilities will be recognized by colleagues. Take initiative on a project that's been stalled."
      },
      love: {
        title: "Love & Relationships", 
        text: "Be direct but gentle in romantic communications. Your partner appreciates honesty. Single Aries may meet someone through professional networks."
      },
      finance: {
        title: "Money & Finance",
        text: "Avoid impulsive purchases today. Review investment portfolios and consider long-term growth opportunities. A business idea shows promise."
      },
      health: {
        title: "Health & Wellness",
        text: "High energy levels support intense workouts. Focus on cardiovascular exercises. Stay hydrated and maintain consistent meal times."
      },
      personal_growth: {
        title: "Personal Growth",
        text: "Reflect on past decisions and learn from them. Your ability to bounce back from setbacks is your greatest strength right now."
      }
    },
    dos_and_donts: {
      dos: ["Take leadership in group situations", "Make important decisions today", "Trust your instincts"],
      donts: ["Don't be overly aggressive", "Avoid rushing into arguments"]
    },
    lucky: {
      numbers: ["1", "8"],
      colors: ["Red", "Orange"],
      time_of_day: "10:00-12:00 local"
    },
    mood_ratings: {
      energy: 5,
      love: 3,
      work: 4,
      luck: 4
    },
    affirmation: "I lead with confidence and make decisions that align with my highest good.",
    chart_snippet: {
      moon_position: "Mars in favorable aspect — heightened energy and drive",
      major_transit: ["Mars trine Sun", "Mercury in power position"]
    },
    comparison: {
      yesterday_vs_today: "Much more decisive than yesterday — mental fog has cleared completely.",
      tomorrow_preview: "Tomorrow focuses on teamwork and collaboration — prepare to share leadership."
    },
    explanation: "Mars, your ruling planet, forms powerful aspects today enhancing your natural leadership qualities and decision-making abilities."
  },
  'Taurus': {
    summary: "Stability and steady progress define today — trust in your methodical approach and enjoy simple pleasures.",
    theme: "Steady Growth & Comfort",
    notification_text: "Your patience and persistence pay off today — stay the course.",
    sections: {
      career: {
        title: "Career & Work",
        text: "Slow and steady wins the race today. Your methodical approach to complex tasks impresses supervisors. Focus on quality over speed in all projects."
      },
      love: {
        title: "Love & Relationships",
        text: "Show affection through practical gestures. Cook a meal, give a massage, or create a comfortable environment. Physical touch is especially meaningful."
      },
      finance: {
        title: "Money & Finance", 
        text: "Excellent day for long-term financial planning. Consider real estate investments or savings accounts. Avoid get-rich-quick schemes."
      },
      health: {
        title: "Health & Wellness",
        text: "Focus on neck and throat areas. Gentle stretching and good posture are important. Comfort foods in moderation bring satisfaction."
      },
      personal_growth: {
        title: "Personal Growth",
        text: "Practice patience and appreciate the beauty in your daily routine. Small, consistent efforts lead to significant long-term changes."
      }
    },
    dos_and_donts: {
      dos: ["Take your time with important tasks", "Enjoy sensory pleasures", "Build on existing foundations"],
      donts: ["Don't rush major decisions", "Avoid being overly stubborn"]
    },
    lucky: {
      numbers: ["2", "6"],
      colors: ["Green", "Pink"],
      time_of_day: "14:00-16:00 local"
    },
    mood_ratings: {
      energy: 3,
      love: 4,
      work: 4,
      luck: 3
    },
    affirmation: "I trust in my steady progress and find beauty in life's simple pleasures.",
    chart_snippet: {
      moon_position: "Venus brings harmony to material matters and relationships",
      major_transit: ["Venus trine Earth signs", "Stable planetary alignment"]
    },
    comparison: {
      yesterday_vs_today: "More grounded and centered than yesterday — inner stability restored.",
      tomorrow_preview: "Tomorrow brings opportunities for creative expression and artistic pursuits."
    },
    explanation: "Venus, your ruling planet, creates harmonious aspects supporting material security and relationship stability."
  }
};

// Generate similar content for all other signs
const generateHoroscopeContent = (sign, date, dayOffset) => {
  const baseTemplate = sampleHoroscopes[sign] || sampleHoroscopes['Aries'];
  const dayVariations = ['challenging but rewarding', 'harmonious and flowing', 'dynamic and exciting'];
  const dayMood = dayVariations[dayOffset % 3];
  
  return {
    date,
    timezone: 'Asia/Kolkata',
    locale: 'en-IN',
    sun_sign: sign,
    summary: baseTemplate.summary.replace(/Today/, dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : 'This day'),
    theme: baseTemplate.theme,
    notification_text: baseTemplate.notification_text,
    sections: baseTemplate.sections,
    dos_and_donts: baseTemplate.dos_and_donts,
    lucky: {
      ...baseTemplate.lucky,
      numbers: [(dayOffset + 1).toString(), (dayOffset + 7).toString()]
    },
    mood_ratings: {
      energy: Math.min(5, baseTemplate.mood_ratings.energy + (dayOffset % 2)),
      love: Math.min(5, baseTemplate.mood_ratings.love + (dayOffset % 2)),  
      work: Math.min(5, baseTemplate.mood_ratings.work + (dayOffset % 2)),
      luck: Math.min(5, baseTemplate.mood_ratings.luck + (dayOffset % 2))
    },
    affirmation: baseTemplate.affirmation,
    chart_snippet: baseTemplate.chart_snippet,
    comparison: baseTemplate.comparison,
    explanation: baseTemplate.explanation + ` The energy is ${dayMood} for ${sign} today.`,
    generation_metadata: {
      engine: 'dummy-data-generator',
      template_version: 'v1.0',
      confidence_score: 0.9,
      generated_at: new Date().toISOString(),
      created_by: 'system'
    },
    published: dayOffset === 0 // Only today's horoscope is published
  };
};

async function checkExistingData(pool, date) {
  const result = await pool.query(
    'SELECT COUNT(*) as count FROM horoscopes WHERE date = $1',
    [date]
  );
  return parseInt(result.rows[0].count);
}

async function generateDummyData() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5433/astrology'
  });

  try {
    console.log('🔮 Checking existing data and generating dummy horoscope data...');
    
    // Generate for last 2 days, today, and next 2 days (total 5 days)
    for (let dayOffset = -2; dayOffset <= 2; dayOffset++) {
      const date = moment().tz('Asia/Kolkata').add(dayOffset, 'day').format('YYYY-MM-DD');
      let dayLabel;
      
      if (dayOffset === -2) dayLabel = '2 Days Ago';
      else if (dayOffset === -1) dayLabel = 'Yesterday';
      else if (dayOffset === 0) dayLabel = 'Today';
      else if (dayOffset === 1) dayLabel = 'Tomorrow';
      else if (dayOffset === 2) dayLabel = '2 Days Later';
      
      console.log(`\n📅 Checking ${date} (${dayLabel})`);
      
      // Check if data already exists for this date
      const existingCount = await checkExistingData(pool, date);
      
      if (existingCount > 0) {
        console.log(`   ℹ️  Found ${existingCount} existing horoscopes for ${date} - skipping`);
        continue;
      }
      
      console.log(`   🆕 No data found for ${date} - generating horoscopes:`);
      let createdCount = 0;
      
      for (const sign of zodiacSigns) {
        const horoscopeData = generateHoroscopeContent(sign, date, dayOffset);
        
        const query = `
          INSERT INTO horoscopes (
            date, timezone, locale, sun_sign, summary, theme, notification_text,
            sections, dos_and_donts, lucky, mood_ratings, affirmation,
            chart_snippet, comparison, explanation, generation_metadata, published
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (sun_sign, date) DO NOTHING
        `;
        
        const values = [
          horoscopeData.date,
          horoscopeData.timezone,
          horoscopeData.locale,
          horoscopeData.sun_sign,
          horoscopeData.summary,
          horoscopeData.theme,
          horoscopeData.notification_text,
          JSON.stringify(horoscopeData.sections),
          JSON.stringify(horoscopeData.dos_and_donts),
          JSON.stringify(horoscopeData.lucky),
          JSON.stringify(horoscopeData.mood_ratings),
          horoscopeData.affirmation,
          JSON.stringify(horoscopeData.chart_snippet),
          JSON.stringify(horoscopeData.comparison),
          horoscopeData.explanation,
          JSON.stringify(horoscopeData.generation_metadata),
          horoscopeData.published
        ];
        
        const result = await pool.query(query, values);
        if (result.rowCount > 0) {
          createdCount++;
        }
        process.stdout.write(`${sign} `);
      }
      
      console.log(`\n   ✅ Created ${createdCount} horoscopes for ${date}`);
    }
    
    // Show final summary
    console.log('\n🎉 Data generation check completed!');
    console.log('\n📊 Final Summary:');
    
    const summaryQuery = `
      SELECT date, COUNT(*) as count, 
             COUNT(CASE WHEN published = true THEN 1 END) as published_count
      FROM horoscopes 
      WHERE date BETWEEN $1 AND $2
      GROUP BY date 
      ORDER BY date
    `;
    
    const startDate = moment().tz('Asia/Kolkata').subtract(2, 'day').format('YYYY-MM-DD');
    const endDate = moment().tz('Asia/Kolkata').add(2, 'day').format('YYYY-MM-DD');
    
    const summaryResult = await pool.query(summaryQuery, [startDate, endDate]);
    
    summaryResult.rows.forEach(row => {
      const dateLabel = moment(row.date).format('MMM DD, YYYY');
      const isToday = row.date === moment().tz('Asia/Kolkata').format('YYYY-MM-DD');
      const status = row.published_count > 0 ? 'PUBLISHED' : 'DRAFT';
      
      console.log(`   ${dateLabel}${isToday ? ' (TODAY)' : ''}: ${row.count} horoscopes [${status}]`);
    });
    
  } catch (error) {
    console.error('❌ Error generating dummy data:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  generateDummyData();
}

module.exports = { generateDummyData };