TASK: Fix Talaba top header/login area first, then centralize backend endpoint.

IMPORTANT SAFETY RULES:
- Do NOT delete production data.
- Do NOT run destructive SQL.
- Do NOT change database schema unless absolutely required.
- Do NOT create multiple backend URLs.
- First fix the top visual/header issue.

MAIN UI FIX:
The very top login area is currently broken. The login icon/image appears as a blank white/corrupted icon.

Fix it like this:

1. Top row only:
   - Show brand name only on one side.
   - Show a clear text button on the other side.
   - The button must say: Login
   - Do NOT use the broken login icon/image.
   - Replace it with a readable rounded text button.
   - Good contrast.
   - Works on mobile and desktop.

2. Brand:
   - Remove any small slogan/text under the brand from the top row.
   - Keep only the brand name.
   - Top row must be clean and not crowded.

3. Language bar:
   - Move language selector to a separate row under the brand/login row.
   - Do NOT keep languages beside login.
   - Language row must be centered and organized.
   - Use pill/rectangle buttons.
   - Use native names and flags:
     - 🇮🇶 العربية
     - Kurdistan flag / کوردی
     - 🇺🇸 English
   - Active language should be clear.
   - Good spacing on mobile.

4. Final top layout order:
   Row 1: Brand name + Login button
   Row 2: Language buttons
   Row 3: Hero section

5. RTL/LTR:
   - Arabic and Kurdish must use RTL.
   - English must use LTR.
   - Language change must update visible text.

BACKEND / DATA CHECK:
After fixing the header:
- Centralize the API base URL in one place.
- Use one final backend endpoint only.
- Search the project for hardcoded backend URLs.
- Remove stale/demo endpoint references.
- Make sure Opportunities, Campus Life, jobs, scholarships, postcards, login, and hero data use the same correct backend source.
- Do not break the current live app.

ACCEPTANCE CHECK:
- Login is visible, readable, and clickable.
- No blank/corrupted login icon remains.
- Top area is not crowded.
- Language buttons are under the header, not beside it.
- Hero section starts below the language row.
- Data loads from the correct backend.
- Run build after changes.

After finishing, tell me:
1. Which files were changed.
2. What backend endpoint is now used.
3. Whether npm run build passed.
