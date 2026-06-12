# Jamiaati Real Data Visible Checkpoint

Date: 2026-06-12

Frontend production:
Worker: idiot
URL: https://idiot.mahdialmuntadhar1.workers.dev
Version ID: 81442c37-4c9a-4c33-ba0a-63001c8d5249

Frontend commit:
9123f40 Fix real backend data rendering in unified feed

Previous checkpoint:
checkpoint-unified-live-2026-06-12-884cc15

Backend production:
Worker: rafid-api
URL: https://rafid-api.mahdialmuntadhar1.workers.dev

Backend important commits:
40340ac Fix public feed filters
1892c85 Expand highlight categories for pending news imports

Current public real data:
- 2 real DAAD scholarships approved
- 2 real University of Baghdad news rows approved
- demo/test public data removed
- 5 UNjobs rows preserved as pending_review

Status:
- Unified frontend works
- Real backend data visible
- Public API hides pending_review
- Public API does not expose status/rejection_reason/raw_text
- No fake/demo public content remains

Rules:
- Do not restore demo data.
- Do not run all sources at once.
- Real data must enter pending_review first.
- Jobs with unknown deadline must stay pending_review until verified.
