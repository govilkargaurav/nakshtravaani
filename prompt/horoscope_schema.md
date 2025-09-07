1) JSON Schema (concise)

{
  "user_id": "string",            /* internal user id */
  "date": "YYYY-MM-DD",           /* horoscope date in ISO format (user local date) */
  "timezone": "Asia/Kolkata",     /* user's timezone */
  "locale": "en-IN",              /* locale for language/formatting */
  "sun_sign": "string",           /* e.g., Aries */
  "moon_sign": "string",          /* optional */
  "ascendant": "string",          /* optional */
  "summary": "string",            /* 1-line summary (max 140 chars) */
  "theme": "string",              /* short theme phrase (max 50 chars) */
  "notification_text": "string",  /* 1-line push text (max 80 chars) */
  "sections": {
    "career": {"title":"string","text":"string"},   /* text max 200 chars */
    "love": {"title":"string","text":"string"},
    "finance": {"title":"string","text":"string"},
    "health": {"title":"string","text":"string"},
    "personal_growth": {"title":"string","text":"string"}
  },
  "dos_and_donts": {
    "dos": ["string","string"],         /* up to 3 short bullets, 60 chars each */
    "donts": ["string","string"]
  },
  "lucky": {
    "numbers": ["string"],              /* 1-3 numbers as strings */
    "colors": ["string"],               /* 1-2 colors */
    "time_of_day": "string"             /* e.g., '10:00-12:00 local' */
  },
  "mood_ratings": {
    "energy": 0-5,
    "love": 0-5,
    "work": 0-5,
    "luck": 0-5
  },
  "affirmation": "string",           /* one-liner mantra, max 90 chars */
  "chart_snippet": {
    "moon_position": "string",        /* optional short fact */
    "major_transit": ["string"]       /* optional list of major aspects/transits used */
  },
  "comparison": {
    "yesterday_vs_today": "string",   /* 1 sentence summary */
    "tomorrow_preview": "string"      /* 1 sentence preview (optional) */
  },
  "explanation": "string",           /* short justification referencing the computed transits (max 300 chars) */
  "generation_metadata": {
    "engine": "string",               /* e.g., pyswisseph + openai:gpt-4o-mini */
    "transit_flags": ["string"],      /* list of transit tags used */
    "template_version": "string",
    "confidence_score": 0.0-1.0
  }
}

2) Example (filled) — copy/pasteable JSON

{
  "user_id": "user_12345",
  "date": "2025-09-06",
  "timezone": "Asia/Kolkata",
  "locale": "en-IN",
  "sun_sign": "Aries",
  "moon_sign": "Libra",
  "ascendant": "Capricorn",
  "summary": "Today brings clarity — focus on one thing and you’ll see progress.",
  "theme": "Focus & Clear Choices",
  "notification_text": "Clarity is yours today — focus on one task and win.",
  "sections": {
    "career": {
      "title": "Career & Work",
      "text": "A focused approach pays off — prioritize the single most important task and avoid multitasking. Your efforts will be noticed by a colleague."
    },
    "love": {
      "title": "Love & Relationships",
      "text": "Small gestures improve harmony today. Be direct but gentle when discussing plans — clarity helps avoid misunderstandings."
    },
    "finance": {
      "title": "Money & Finance",
      "text": "Avoid big purchases today. Review recurring subscriptions and postpone impulsive spending until later in the week."
    },
    "health": {
      "title": "Health & Wellness",
      "text": "Energy is steady — a short workout and hydration will keep you balanced. Avoid heavy meals late at night."
    },
    "personal_growth": {
      "title": "Personal Growth",
      "text": "Reflect for 10 minutes on a recent decision. You’ll notice a useful pattern that improves future choices."
    }
  },
  "dos_and_donts": {
    "dos": [
      "Prioritize one key task today.",
      "Communicate plans clearly.",
      "Take a 10-minute walk midday."
    ],
    "donts": [
      "Don't make impulsive purchases.",
      "Avoid gossip or office politics."
    ]
  },
  "lucky": {
    "numbers": ["3", "7"],
    "colors": ["Deep Blue"],
    "time_of_day": "10:00-12:00 local"
  },
  "mood_ratings": {
    "energy": 4,
    "love": 3,
    "work": 4,
    "luck": 3
  },
  "affirmation": "I focus on what matters and make progress one step at a time.",
  "chart_snippet": {
    "moon_position": "Moon in Libra — emphasis on balance & communication",
    "major_transit": ["Mercury trine Venus", "Moon conjunct Mars (minor)"]
  },
  "comparison": {
    "yesterday_vs_today": "Calmer than yesterday — less friction, more clarity.",
    "tomorrow_preview": "Tomorrow may bring choices around collaboration; keep options open."
  },
  "explanation": "Moon in Libra supports communication; Mercury making a favorable aspect to Venus smooths negotiations. No major disruptive transits today.",
  "generation_metadata": {
    "engine": "pyswisseph + openai:gpt-4o-mini",
    "transit_flags": ["moon_in_libra","mercury_trine_venus"],
    "template_version": "v1.0",
    "confidence_score": 0.92
  }
}
