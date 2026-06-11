# StudentHUB Plus

StudentHUB Plus is a multilingual student opportunity and university announcement platform for Iraq.

It helps students discover:

- University announcements
- Scholarships
- Internships
- Trainings
- Jobs
- Events
- Competitions
- Volunteering opportunities
- Fellowships
- Exams and registration updates

Supported languages:

- Arabic
- Kurdish Sorani
- English

## Public beta status

StudentHUB Plus is being prepared for controlled public beta publishing.

It should not be promoted nationally until the public data, admin security, and deployment target are manually verified.

## Critical trust rule

StudentHUB Plus must never publish fake, generated, or unverified opportunities as real student opportunities.

If a source is silent, offline, blocked, or has no real matching opportunities, the system must log the issue and create no public opportunity.

All scraped or submitted opportunities must be reviewed before public display.

## Architecture

Frontend:

- React
- Vite
- TypeScript
- Existing youth-friendly mobile layout

Expected production backend:

- `https://rafid-api.mahdialmuntadhar1.workers.dev`

Frontend API config:

```env
VITE_API_URL=https://rafid-api.mahdialmuntadhar1.workers.dev
# You are inside a multi-line PowerShell string because the prompt shows: >>
# First press Ctrl + C on your keyboard to cancel the unfinished paste.
# Reference context: :contentReference[oaicite:0]{index=0}

# Then run this to check what was already changed:

cd "$env:USERPROFILE\Documents\StudentHUB-Finalize\studentHUB-plus"

git status --short
git branch --show-current

# If you see package.json and README.md changed, that is okay.
# Now create a clean script file instead of pasting huge code directly into the PowerShell prompt:

notepad "$env:USERPROFILE\Documents\StudentHUB-Finalize\studenthub-finalizer.ps1"

# Paste the FULL master script into Notepad, save it, close Notepad.
# Then run it like this:

powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Documents\StudentHUB-Finalize\studenthub-finalizer.ps1"
# You are stuck inside PowerShell multi-line mode because the prompt shows >>
# Press CTRL + C first.
# Then paste and run this:

cd "$env:USERPROFILE\Documents\StudentHUB-Finalize\studentHUB-plus"

git status --short
git branch --show-current

# Undo the broken/partial paste safely and return to clean main:
git reset --hard
git clean -fd
git checkout main
git pull

# Create fresh safe branch:
git checkout -B public-beta-finalize

# Fix package name:
$pkg = Get-Content package.json -Raw | ConvertFrom-Json
$pkg.name = "studenthub-plus"
$pkg | ConvertTo-Json -Depth 50 | Set-Content package.json -Encoding UTF8

# Fix README:
@'
# StudentHUB Plus

StudentHUB Plus is a multilingual student opportunity and university announcement platform for Iraq.

It helps students discover university announcements, scholarships, internships, trainings, jobs, events, competitions, volunteering, fellowships, exams, and registration updates.

Supported languages:

- Arabic
- Kurdish Sorani
- English

## Public beta status

StudentHUB Plus is being prepared for controlled public beta publishing.

Do not promote nationally until public data, admin security, and the deployment target are manually verified.

## Critical trust rule

StudentHUB Plus must never publish fake, generated, or unverified opportunities as real student opportunities.

If a source is silent, offline, blocked, or has no real matching opportunities, the system must log the issue and create no public opportunity.

All scraped or submitted opportunities must be reviewed before public display.

## Architecture

Frontend:

- React
- Vite
- TypeScript

Expected production backend:

- https://rafid-api.mahdialmuntadhar1.workers.dev

Frontend API config:

VITE_API_URL=https://rafid-api.mahdialmuntadhar1.workers.dev

## Local development

npm install
npm run dev

## Build

npm run build

## Deployment warning

Do not deploy automatically.

Deploy manually only after reviewing the readiness report, backend decision report, and security notes.
