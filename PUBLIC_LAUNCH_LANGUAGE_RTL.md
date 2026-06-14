# Public Launch Language and RTL Fix

This patch improves the first public launch language behavior.

It adds:
- RTL direction for Arabic and Kurdish cards
- text-right alignment for Arabic and Kurdish cards
- localized card captions and labels
- localized opportunity metadata labels
- mojibake repair for broken Arabic text such as Ø§Ù...
- better selection of title_ar/title_ku/title_en and summary fields from backend data

Important:
This does not use an external AI translation API.
If a backend item only has English text and no Arabic/Kurdish field, the app will show the best available text.
For perfect trilingual content, the backend data should store proper title_ar, title_ku, summary_ar, and summary_ku fields.
