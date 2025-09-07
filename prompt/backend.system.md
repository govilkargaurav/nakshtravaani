You are a senior backend engineer and devops. Produce [ARTIFACT] for the Astrology App MVP as described below. Deliver all code files under the `./backend` or `./admin` folders, and include tests and necessary config files.

Feature Requirements (brief):
- User registration with OTP (phone/email), JWT tokens
- Profile & birth details storage (date, time, location/coords)
- Daily horoscope endpoint (computed/simulated) refreshed at 05:00 IST
- Admin APIs: user management, manual horoscope test endpoint

Action items:
1. Generate code (files) for the [ARTIFACT].
2. Provide instructions to run locally using Docker Compose.
3. Add tests and example fixtures.
4. Provide Postman collection and OpenAPI spec.

Constraints:
- Use Node.js + Express
- Use MongoDB for user/profile data and Postgres for transactional/payment data
- Use Redis for cache/queue
- Keep implementation modular (services/*)

Output format:
- Return a ZIP-friendly file structure listing and content blocks in Markdown, and if possible, attach code files.

Start with: a top-level README summarizing how to run and where to find items.

Task A — Boilerplate & project skeleton
Prompt: "Create the project skeleton for astrology-backend with services folders: auth, user, horoscope, admin and shared utilities. Include package.json, ESLint, Prettier config, Dockerfile under backend, and docker-compose.yml referencing Postgres, Mongo, Redis."
Expected output: file tree and content for package.json, backend/Dockerfile, docker-compose.yml, .env.example, and basic server entry backend/index.js that mounts service routers.

Task B — Auth Service
Prompt: "Implement auth service with routes /register, /verify-otp, and /refresh-token. OTP sending should be abstracted behind a provider interface (msg91/textlocal). Mock provider for dev. Issue JWT access and refresh tokens. Add unit tests mocking OTP provider. Create actual setup how it will work with mobile number email OTP. Create a dummy OTP to get actual JWT." 
Expected: services/auth/* files, JWT util using process.env.JWT_SECRET, tests.

Task C — User service & Birth-chart
Prompt: "Implement user service with routes GET/PUT /user/profile and POST /user/birth-chart. Save profile to Mongo and transactional references in Postgres where needed. Birth-chart updates that change time should set a recalculationQueued flag. Include validation and tests."

Task D — Horoscope service (basic)
Prompt: "Create horoscope service implementing /user/horoscope/daily. For MVP implement a deterministic but simple rule-based generator (e.g., map sun sign from birth date to a template + inject random luck numbers seeded by userId+date). Schedule precompute at 05:00 IST with a cron-like job and store results in Redis or Mongo cache. Include an admin test endpoint to generate sample horoscope."
