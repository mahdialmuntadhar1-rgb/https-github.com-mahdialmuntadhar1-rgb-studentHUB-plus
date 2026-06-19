import type { FeedItem, Language } from "../types";

export type CampusLifePost = {
  id: string;
  studentName: string;
  universityOrCampus: string;
  governorate: string;
  category: string;
  text: string;
  suggestedVisual: string;
  likes: number;
  commentsCount: number;
  shares: number;
  comments: string[];
  cta: string;
  moodTag: string;
  imageUrl: string;
  imageAlt: string;
  visualTheme: string;
  isMock: true;
};

type Seed = readonly [
  studentName: string,
  universityOrCampus: string,
  governorate: string,
  category: string,
  text: string,
  suggestedVisual: string,
  cta: string,
  moodTag: string,
];

const commentPacks: readonly (readonly string[])[] = [
  ["سارة: حرفياً نفس الحالة 😂", "علي: منو عنده ملخص؟", "نور: saved لأن نحتاجها بعدين"],
  ["Ranya: mood 😭", "هوزان: قهوة رابعة ونتوكل", "دلين: منو يجي وياي؟"],
  ["مصطفى: هاي حياتنا باختصار", "زهراء: ضحكت وأنا متأخرة أصلاً", "حيدر: team آخر صف ✋"],
  ["Shvan: ئەمە زۆر ڕاستە 😂", "آڤين: لە کوێیە؟", "Rebin: saved ✅"],
  ["مريم: أريد الجزء الثاني", "سجاد: تقييم صادق جداً", "رُبى: نجربها باچر"],
  ["Yara: the struggle is real", "عمر: حاضر بس بعد القهوة", "شهد: أرسلوا اللوكيشن بالكروب"],
  ["هانا: منو يعرف الجواب؟", "كرار: أسألوا السينيورز 😅", "ليان: أنا ضايعة أكثر منكم"],
  ["Aso: دەستخۆش، زۆر جوانە", "سوزان: campus vibes ✨", "هيوا: next time tag me"],
  ["عباس: اتفق 100%", "بتول: لا تنسون الماي", "منتظر: مشاركة للكروب تمت"],
  ["زينب: يا ريت كل يوم هيچ", "أحمد: الصورة فازت", "تالا: this is so us"],
  ["Diyar: کێ دێت؟", "نيروز: من دێم 🙌", "سيروان: قاوە لەسەر من"],
  ["حسن: الامتحان يقرأ أفكارنا", "آية: لا تذكرني 😭", "قاسم: notes please يا جماعة"],
  ["رند: أحلى طاقة", "محمد: مشتاقين لهالأيام", "لارا: لقطة كلش حلوة"],
  ["Kawa: زۆر خۆشە", "شيلان: library squad 📚", "Alan: playlist link?"],
  ["فاطمة: من اليوم أعتمدها", "يوسف: نصيحة ذهبية", "دانية: شكراً يا بطل"],
  ["Noor: okay but where is B? 😂", "مهدي: يم الكافتيريا يمكن", "إسراء: لا تثقون بخرائطي"],
  ["آدم: هذا البوست يمثلني", "رحمة: group study أكيد", "سيف: solo ولا وجع راس"],
  ["Rozh: وێنەکە نایابە 📸", "ژيار: ڕووناکی زۆر جوانە", "Lavin: reposting this"],
  ["بنين: الله يساعدنا هالأسبوع", "مرتضى: بقت محاضرتين وننجو", "سلمى: دعواتكم للبرزنتيشن"],
  ["دانة: وين هذا المكان؟", "علياء: نحتاج جولة كاملة", "حسين: campus tour soon?"],
  ["Sara: added to my playlist 🎧", "مروان: أول أغنية لازم تكون هادئة", "نغم: lo-fi team"],
  ["شمس: الكافتيريا تحت الاختبار", "رائد: السعر أهم من الطعم 😂", "ميس: أريد تقييم العصير"],
  ["Aveen: سەرکەوتوو بن 💛", "باران: finals energy", "دلشاد: پشوویەکمان دەوێت"],
  ["رؤى: كلنا كنا freshers", "ياسين: اسألوا ولا تستحون", "فرح: هذا البوست مفيد جداً"],
];

// Campus Life mock posts are only for demonstration. Opportunities, jobs, scholarships, real events, and real news must stay real, source-based, and connected to their original links.
const seeds: readonly Seed[] = [
  ["لينا البغدادية", "حرم دجلة الأهلي", "Baghdad", "Campus vibe", "محاضرة 8 الصبح ببغداد: نص وجهي نايم والنص الثاني يدور قهوة ☕ منو مثلي؟", "صورة شمس صباحية على ممر الحرم مع كوب قهوة ودفتر", "اختاروا: محاضرة أولى أم زر الغفوة؟", "Baghdad morning lecture vibe"],
  ["سيف المنصور", "كلية جسور بغداد", "Baghdad", "Campus question", "Are you from my university? إذا تعرف تمثال الكتاب عند البوابة، أثبت وجودك 👀", "سيلفي بعيد أمام تمثال كتاب خيالي بلا وجوه واضحة", "اكتب تخصصك وسنتك الدراسية", "Are you from my university?"],
  ["شهد الكرادة", "أكاديمية الرافدين الجديدة", "Baghdad", "Study humor", "one lecture, three coffees… والـ attendance بعده يريد ابتسامة 😭", "ثلاثة أكواب ورقية مصطفة قرب لابتوب", "كم قهوة تحتاجون ليوم طويل؟", "One lecture, three coffees"],
  ["منتظر الأعظمي", "حرم النخيل الجامعي", "Baghdad", "Campus navigation", "أسبوع ثالث ولسه أسأل: Where is Building B? الخريطة عندها مشاكل شخصية وياي.", "خريطة كرتونية ملونة بأسهم متضاربة", "ارسموا أقصر طريق إلى مبنى B", "Lost on campus jokes"],
  ["رُبى الكاظمية", "معهد بوابة بغداد", "Baghdad", "Study playlist", "Baghdad traffic يحتاج playlist قبل لا يحتاج حل 😅 شنو أغنيتكم بالطريق للجامعة؟", "سماعات فوق حقيبة وحافلة ضبابية بالخلف", "أضيفوا أغنية إلى playlist التعليقات", "Study playlist recommendations"],
  ["آدم الرصافة", "جامعة الساحة المفتوحة", "Baghdad", "Student discovery", "شنو ديصير بالكامبس اليوم؟ نادي الرسم محتّل الساحة والجو Instagram material 🎨", "طلاب مرسومون من الخلف حول لوحات ملونة", "شاركونا لقطة من كامبسكم", "What’s happening on campus?"],

  ["حوراء العشار", "كلية شط العرب التقنية", "Basra", "Engineering life", "طلاب الهندسة بالبصرة يعرفون: الحر + safety helmet + project deadline = character development 🔧", "خوذات هندسية ملونة ومخططات على طاولة", "منشن مهندس المشروع وياك", "Basra engineering students"],
  ["جاسم أبو الخصيب", "حرم المرسى العلمي", "Basra", "Cafeteria", "قيّمت سندويچ الكافتيريا 7/10، يصعد لـ9 إذا الدكتور ألغى الكويز 😂", "ساندويتش على صينية مع بطاقة تقييم مرسومة", "قيّموا غداء اليوم من 10", "Cafeteria food rating"],
  ["مي البصرية", "أكاديمية الفاو الطلابية", "Basra", "Transport", "منو يطلع من جهة العشار؟ نريد نسوي campus commute survival club 🚐", "حافلة جامعية خيالية وقت الشروق", "اختاروا منطقتكم لتجدوا رفاق الطريق", "Transportation to campus"],
  ["حسن التنومة", "كلية الموج الأزرق", "Basra", "Exam meme", "فتحت الملزمة، الملزمة فتحت جروح قديمة. finals week بالبصرة حارة بكل المعاني 😭", "مذكرة مفتوحة ومروحة صغيرة وملصق مضحك", "ارسلوا أفضل meme للفاينلز", "Finals week mood"],
  ["دانيا القرنة", "حرم القصب الجامعي", "Basra", "Internship awareness", "Friendly reminder: قبل التقديم لأي internship تأكدوا من المصدر الرسمي والرابط الأصلي، لا نمشي ورا screenshots ✨", "Checklist مصمم بألوان زاهية بلا شعارات جهات", "احفظوا قائمة التحقق قبل التقديم", "Internship reminder"],
  ["كرار الزبير", "معهد بوابة الخليج", "Basra", "Study spots", "أفضل spot للدراسة؟ الدرج القريب من المختبر… هواء، هدوء، وواي فاي إذا كان مزاجه حلو.", "درج خارجي مظلل مع كتب وقنينة ماء", "رشحوا مكانكم السري للدراسة", "Best study spot"],

  ["نور الحدباء", "حرم نينوى المجتمعي", "Nineveh/Mosul", "Campus spirit", "Mosul comeback energy 💙 كل زاوية بالحرم تقول نبدأ من جديد، وبستايل أحلى.", "ممر جامعي متجدد مع حقائب ملونة وسماء صافية", "اكتبوا شيئاً تحبونه بجامعتكم", "Mosul university comeback energy"],
  ["عمر الموصلي", "كلية الجسر الأكاديمية", "Nineveh/Mosul", "New students", "Freshers: إذا ضعتوا لا تتوترون، حتى السينيور مرات يمثل يعرف الطريق 😂", "لافتات اتجاهات خيالية وطالب يحمل خريطة", "Freshers ask, seniors answer", "New student guide"],
  ["ميس دجلة", "أكاديمية باب الطوب", "Nineveh/Mosul", "Notes exchange", "Send notes please 🙏 غبت محاضرة وحدة وحاسّة المنهج عاش حياة كاملة بدوني.", "دفاتر وsticky notes ورسالة دردشة تمثيلية", "اضغط مهتم لتكوين مجموعة ملاحظات", "Send notes please"],
  ["ياسر نينوى", "معهد المنارة للعلوم", "Nineveh/Mosul", "Campus shortcuts", "اكتشفت shortcut يختصر 6 دقايق… بس بيه درج يخليك تعيد قراراتك كلها.", "مسار بأسهم مرسومة ودرج طويل من زاوية مضحكة", "شارك shortcut بدون تعريض أحد للخطر", "Campus shortcuts"],
  ["رنا الموصل", "حرم الربيع الجامعي", "Nineveh/Mosul", "Group study", "Group study: 20% دراسة، 30% snacks، 50% نحچي شلون لازم ندرس. accurate?", "طاولة دائرية عليها كتب ووجبات خفيفة", "صوّتوا: group أم solo", "Group study vs solo study polls"],
  ["باسل الحمدانية", "كلية السهل الإبداعية", "Nineveh/Mosul", "Photography", "Golden hour خلّت حتى مبنى المختبر يطلع cinematic ✨ مو كل الجمال يحتاج فلتر.", "ظل مبنى جامعي خيالي وقت الغروب", "نزّلوا أجمل زاوية في حرمكم", "Campus photography"],

  ["هانا هەولێر", "کەمپی زاگرۆس نوێ", "Erbil", "Coffee break", "Coffee break لە نێوان دوو وانە ☕ ten minutes that fix the whole day.", "قهوة كردية صغيرة قرب دفتر بألوان دافئة", "Tag your coffee-break friend", "Erbil campus coffee break"],
  ["ريبين عنكاوا", "حرم القلعة الشبابي", "Erbil", "Campus question", "کێ لەم کەمپەسەیە؟ إذا تعرفون الحديقة الصغيرة ورا الستوديو، say hi 🌿", "حديقة مصغرة ومقاعد زاهية بلا أشخاص واضحين", "عرّف بنفسك وتخصصك", "Are you from my university?"],
  ["سارة رواندوز", "أكاديمية هەورامان الرقمية", "Erbil", "Presentation", "Presentation day panic: USB موجود، slides موجودة، confidence… loading 12% 😅", "لابتوب يعرض شريحة loading وكروت ملاحظات", "شاركوا نصيحة تهدئة قبل العرض", "Presentation day panic"],
  ["دلين شقلاوة", "كلية نيسان الإبداعية", "Erbil", "Cafeteria", "ئەمڕۆ پیتزای کافتریام تاقیکردەوە: 6.5/10 بس الجلسة ويا الرفاق 10/10.", "قطعة بيتزا وصوانٍ ملونة على طاولة خارجية", "قيّموا أكلة الكافتيريا", "Cafeteria food rating"],
  ["آلان أربيل", "حرم ڕووناکی الجامعي", "Erbil", "First week", "First week checklist: find class ✅ find coffee ✅ remember everyone’s name ❌", "Checklist مصور بجانب بطاقة طالب خيالية", "ما أصعب شيء في أول أسبوع؟", "First week at university"],
  ["نيروز سوران", "معهد ژین للتقنيات", "Erbil", "Student discovery", "Find students in your governorate: هەولێر edition 🙌 اكتبوا department ويمكن تلاقون study buddy.", "خريطة مبسطة لأربيل مع نقاط وقلوب", "اكتب القسم لتجد رفيق دراسة", "Find students in your governorate"],

  ["شيلان سلێمانی", "کەمپی چەمچەماڵی خوێندن", "Sulaymaniyah", "Library", "Library night لە سلێمانی 📚 باران براوە، قاوە سارد بووە، بەڵام chapter تەواو بوو!", "نافذة عليها مطر ومصباح قراءة وكتاب", "شاركوا إنجاز الليلة الصغير", "Sulaymaniyah library night"],
  ["آسو بازيان", "حرم آزادي الطلابي", "Sulaymaniyah", "Seat hunt", "گەڕان بەدوای کورسی library صار رياضة أولمبية. saw one? run, don’t walk 😂", "كرسي مكتبة واحد تحت spotlight فكاهي", "بلّغوا عن المقاعد المتاحة", "Library seat hunting"],
  ["لارا السليمانية", "أكاديمية شار الثقافية", "Sulaymaniyah", "Study playlist", "Tonight’s study mix: lo-fi + rain + panic very softly in the background 🎧", "سماعات وواجهة playlist خيالية وقطرات مطر", "اقترح track بدون روابط غير موثوقة", "Study playlist recommendations"],
  ["هيوا دوكان", "كلية دربند الأكاديمية", "Sulaymaniyah", "Exam meme", "من دەڵێم زوو دەستم پێکردووە… clock says 2:13 AM. Finals make us poets.", "ساعة رقمية ودفتر بخطوط ملونة", "كم الساعة عندكم وأنتم تدرسون؟", "Exam season survival memes"],
  ["روژين رانية", "حرم ڕەنگین الجامعي", "Sulaymaniyah", "Study advice", "Small advice: 25 minutes focus, 5 minutes پشوودان. موبایلەکەش دوور بخەرەوە 👀", "مؤقت دراسة ونبتة صغيرة وهاتف مقلوب", "جرّبوا الجولة وعلّقوا بالنتيجة", "Student advice"],
  ["سيروان قلعة دزة", "معهد پەنجەرە للإعلام", "Sulaymaniyah", "Campus photography", "ئاسمانی دوای باران + campus lights = no filter needed ✨", "انعكاس أضواء حرم خيالي على أرض مبتلة", "شاركونا صورة ما بعد المطر", "Campus photography"],

  ["آڤين دهۆك", "کەمپی سپی الجامعي", "Duhok", "Medical life", "Medical students check: stethoscope ✅ flashcards ✅ remembering lunch ❌", "سماعة طبية تدريبية وبطاقات وأيقونة ساندويتش", "ذكّر زميلك ياخذ استراحة", "Duhok medical students"],
  ["شفان زاخو", "كلية الخابور الصحية", "Duhok", "Study group", "ئێمە group study کرد، بەڵام anatomy كان عنده رأي ثاني 😭", "مجسم تشريح تعليمي وملصقات ملونة", "كوّنوا فريق مراجعة صغير", "Study group"],
  ["لافين العمادية", "حرم متين للعلوم", "Duhok", "Coffee break", "قاوەی پاش lab hits different ☕ especially when the experiment finally works.", "كوب قهوة ونظارات حماية على طاولة مختبر آمنة", "احتفلوا بإنجاز مختبر اليوم", "Coffee break"],
  ["ديار سميل", "أكاديمية زوزان", "Duhok", "Dorm life", "Dorm dinner: كل واحد جاب شي وصارت سفرة أحسن من خطتنا الدراسية 😂", "مائدة بسيطة متنوعة داخل مساحة مشتركة مرتبة", "شاركوا أكلة السكن المفضلة", "Dorm life"],
  ["نيرمين عقرة", "معهد روناهي الطلابي", "Duhok", "New students", "Freshers، لا تخافون من السؤال. هەموومان ڕۆژێک ون بووین لە campus 😅", "طلاب مرسومون حول لوحة اتجاهات ترحيبية", "اسأل سؤالاً وسيجيب سينيور", "Freshers ask, seniors answer"],

  ["سوزان كركوك", "حرم القلعة المتعدد", "Kirkuk", "Campus culture", "سلام، سڵاو، merhaba, hello 👋 أربع تحيات قبل أول محاضرة—Kirkuk campus energy.", "فقاعات كلام بأربع لغات فوق ساحة ملونة", "علّمنا تحية بلغتك", "Kirkuk multilingual campus"],
  ["آراس داقوق", "كلية بابا كركر", "Kirkuk", "Campus question", "کێ لێرەیە؟ منو من نفس الكامبس؟ Let’s make a multilingual study circle.", "دائرة دفاتر بأغلفة وأبجديات متنوعة", "اكتب اللغة والمادة التي تدرسها", "Find students in your governorate"],
  ["مريم تازة", "أكاديمية الجسر الثقافي", "Kirkuk", "Cafeteria", "اليوم النقاش بالكافتيريا صار بثلاث لغات والنتيجة وحدة: الشاي يحتاج سكر أكثر 😂", "استكانات شاي وملصقات كلام متعددة", "صوّت: شاي حلو أم خفيف", "Cafeteria food rating"],
  ["دانا التون كوبري", "حرم التآلف الجامعي", "Kirkuk", "Presentation", "Slides بالعربي، intro بالإنجليزي، Q&A بە کوردی. presentation unlocked 🔓", "ثلاث شرائح ملونة تحمل عناوين بلغات مختلفة", "أي لغة تستخدمون في العرض؟", "Presentation day"],
  ["فرات الحويجة", "معهد السهل التقني", "Kirkuk", "Transport", "طريق الكامبس طويل بس carpool playlist تخليه أهون 🎶", "سيارة خيالية من الداخل مع حقائب وسماعات", "كوّنوا مجموعة تنقل آمنة عبر التطبيق", "Transportation to campus"],

  ["زهراء النجفية", "كلية الميزان الحديثة", "Najaf", "Law debate", "Law students قالوا debate وطلعنا بمحكمة مصغّرة على موضوع: الحضور الصباحي حق لو عقوبة؟ ⚖️", "ميزان ورقي وميكروفونان على طاولة", "صوّت وقدم حجتك بجملة", "Najaf law students debate"],
  ["علي الكوفاني", "حرم الفرات القانوني", "Najaf", "Study advice", "إذا المادة 200 صفحة، لا تنتظر الإلهام. عشر صفحات اليوم أحسن من panic باچر.", "كتاب سميك مقسم بملصقات عشرية", "اكتب هدفك الدراسي لليوم", "Student advice"],
  ["رؤى المشخاب", "أكاديمية النخلة الأكاديمية", "Najaf", "Campus shortcuts", "shortcut المكتبة يمر من يم الكافتيريا… technically اختصار، emotionally فخ 😂", "مسار مرسوم يلتف قرب قطعة كيك", "شارك اختصارك المفضل", "Campus shortcuts"],
  ["مرتضى النجف", "معهد المناظرة الطلابي", "Najaf", "Exam season", "قرأت السؤال ثلاث مرات، السؤال قرأني مرة وفهم كل نقاط ضعفي.", "ورقة امتحان خيالية بعيون كرتونية", "ضع emoji يصف امتحانك", "Exam season survival memes"],
  ["بنّين الحيدرية", "حرم الأفق الجامعي", "Najaf", "Scholarship awareness", "Scholarship tip: دققوا الموعد والشروط من الصفحة الأصلية للجهة فقط. أي فرصة بلا مصدر واضح = skip.", "بطاقات تحقق: مصدر، موعد، شروط، رابط أصلي", "افتحوا قسم الفرص الموثقة", "Scholarship awareness"],

  ["سجاد الكربلائي", "حرم القمر الأكاديمي", "Karbala", "Graduation", "Graduation countdown: 42 days! روب التخرج جاهز، المشروع بعده يريد معجزة صغيرة 🎓", "تقويم عد تنازلي وقبعة تخرج وملاحظات مشروع", "اكتبوا عدد الأيام المتبقية", "Karbala graduation countdown"],
  ["آية الهندية", "كلية الطف الإبداعية", "Karbala", "Presentation", "باقي دقيقة للعرض وكلنا فجأة نرتب الخطوط بدل ما نراجع الكلام 😭", "شاشة تصميم بها خطوط كثيرة ومؤقت دقيقة", "شارك آخر شيء تسويه قبل العرض", "Presentation day panic"],
  ["حسين عين التمر", "أكاديمية الواحة الجامعية", "Karbala", "Campus vibe", "شنو ديصير بالكامبس؟ اليوم كل الساحة صور تخرج وconfetti energy ✨", "قصاصات ورقية وقبعات تخرج بلا وجوه واضحة", "هنّئوا دفعة التخرج", "What’s happening on campus?"],
  ["فاطمة الحر", "معهد خطوة للمستقبل", "Karbala", "Job awareness", "Job-hunt reminder: خلّوا الـCV محدث، وقدّموا فقط من روابط الشركات الأصلية أو المصادر الموثقة.", "لابتوب يعرض CV خيالياً مع درع تحقق", "راجع ملفك ثم تصفح الفرص الموثقة", "Job discovery awareness"],
  ["قاسم الحسينية", "حرم الساقي الطلابي", "Karbala", "Cafeteria", "تشريب الكافتيريا اليوم أخذ 8/10، نقطة إضافية لأن الكمية تحترم الطالب الجائع 😂", "صحن عراقي مصور من أعلى مع بطاقة 8/10", "قيّم وجبتك بصراحة", "Cafeteria food rating"],

  ["تالا الحلة", "حرم بابل الإبداعي", "Babil", "First week", "أول أسبوع: دخلت القاعة الغلط، جلست خمس دقايق، وفكرت أغيّر تخصصي حتى ما أطلع 😂", "بابان لقاعتين بألوان وأرقام خيالية", "احكوا موقف أول أسبوع", "First week at university"],
  ["مهدي المسيب", "كلية النهرين الجديدة", "Babil", "Study group", "Group study لو solo؟ أنا group حتى أحد يمنعني أفتح reels كل دقيقتين.", "هاتف داخل صندوق صغير وسط كتب المجموعة", "صوّت وحدد السبب", "Group study vs solo study polls"],
  ["نغم المحاويل", "أكاديمية الجنائن", "Babil", "Campus question", "Are you from my university? إذا تعرف الشجرة اللي الكل ياخذ يمها صور، إحنا نفس الـcampus 🌳", "شجرة كبيرة مزينة بشرائط ورقية", "اترك emoji الشجرة إذا تعرفها", "Are you from my university?"],
  ["ياسين الهاشمية", "معهد المسلة التقني", "Babil", "Library", "حجزت seat بالمكتبة قبل الزحمة وحاس نفسي أنجزت أكثر من المنهج كله.", "مقعد مكتبة عليه بطاقة صغيرة وكتاب", "شارك وقت المكتبة الأقل ازدحاماً", "Library seat hunting"],
  ["رحمة القاسم", "حرم الفرات الأوسط", "Babil", "Notes exchange", "منو عنده notes المحاضرة الرابعة؟ خطي قرر يصير نقش بابلي بالنص 😅", "دفتر بخط يتحول تدريجياً إلى رموز كرتونية", "تبادلوا ملخصاتكم داخل المجموعة", "Send notes please"],

  ["سلمى الكوت", "كلية واسط الخضراء", "Wasit", "Campus vibe", "هواء الصبح بالحرم اليوم خرافي… حتى محاضرة الإحصاء ما قدرت تخربه 🌤️", "ممر أخضر وسماء صباحية ودفتر إحصاء", "صف مزاج صباحكم بـemoji", "Campus morning"],
  ["رائد الصويرة", "حرم دجلة الأوسط", "Wasit", "Transport", "الباص وصل بدري لأول مرة وأنا اللي تأخرت. plot twist ما كنت مستعد له.", "حافلة خيالية وساعة كبيرة وحقيبة تركض كرتونياً", "شاركوا نصيحة الوصول بالوقت", "Transportation to campus"],
  ["إسراء النعمانية", "أكاديمية السنابل", "Wasit", "Best study spot", "لقيت زاوية تحت الشجرة: شحن ماكو، بس تركيز 100% لأن الموبايل مات 😂", "مقعد تحت شجرة وهاتف ببطارية فارغة", "رشحوا مكاناً هادئاً", "Best study spot"],
  ["عباس الحي", "معهد الغد التقني", "Wasit", "Internship awareness", "Internship season: لا ترسلون بيانات حساسة لأي حساب مجهول. المصدر الأصلي أولاً، دائماً.", "درع أمان فوق نموذج تقديم تجريبي بلا بيانات", "راجعوا قواعد أمان التقديم", "Internship reminder"],
  ["ليان بدرة", "حرم الزمرد الطلابي", "Wasit", "Study playlist", "أحتاج playlist تخلي الطريق للجامعة montage فيلم، suggestions? 🎧", "طريق ريفي من نافذة حافلة مع سماعات", "اكتب اسم أغنية واحدة", "Study playlist recommendations"],

  ["نور بعقوبة", "حرم البرتقال الجامعي", "Diyala", "Campus vibe", "ريحة البرتقال + دفاتر جديدة = Diyala campus starter pack 🍊", "برتقالات ودفاتر بأغلفة مرحة على مقعد", "أضف شيئاً إلى starter pack", "Campus vibe"],
  ["مصطفى المقدادية", "كلية الندى العلمية", "Diyala", "Exam meme", "سويت جدول دراسة جميل لدرجة قضيت وقت ألوّنه أكثر من وقت الدراسة.", "جدول شديد التلوين وقلم تمييز مفتوح", "شارك لون مادة اليوم", "Exam season survival memes"],
  ["دانية الخالص", "أكاديمية بساتين ديالى", "Diyala", "Dorm life", "Dorm rule غير المكتوب: اللي يسوي چاي يسوي للكل ☕", "إبريق شاي وأكواب مختلفة في مطبخ مرتب", "اكتبوا قانون السكن غير المكتوب", "Dorm life"],
  ["حيدر خانقين", "حرم الوند المتعدد", "Diyala", "Student discovery", "Find students in Diyala! عربي، کوردی، English—اكتب تخصصك ونكوّن circle.", "خريطة ديالى بأسهم تلتقي حول كتب", "اعثر على رفيق من محافظتك", "Find students in your governorate"],
  ["ملاك بلدروز", "معهد الطريق الجديد", "Diyala", "New students", "دليل المستجد: صوّر جدولك، احفظ اسم القاعة، وخلي عندك snack للطوارئ.", "ثلاث بطاقات مصورة: جدول، باب قاعة، وجبة", "أضف نصيحة للمستجدين", "New student guide"],

  ["ليث الرمادي", "حرم الأنبار الجديد", "Anbar", "Campus spirit", "رجعة الكامبس بعد العطلة: الكل يقول اشتقنا، وبعد أول محاضرة يقول نريد عطلة 😂", "بوابة خيالية ولافتتا أهلاً ووداعاً", "اختاروا: مشتاق أم أريد عطلة", "Back to campus"],
  ["سارة الفلوجة", "كلية الجسر الغربي", "Anbar", "Coffee break", "قهوة الاستراحة اليوم أقوى من إشارة الواي فاي، وهذا المطلوب بصراحة.", "كوب قهوة مع أشرطة إشارة واي فاي كرتونية", "منشن رفيق القهوة", "Coffee break"],
  ["عمر هيت", "أكاديمية الفرات العليا", "Anbar", "Campus shortcuts", "لقيت طريق للمختبر أسرع، بس لازم تمر على ثلاث قطط campus supervisors 🐈", "ثلاث قطط مرسومة قرب ممر مختصر", "شارك صورة قطط الحرم بدون إزعاجها", "Campus shortcuts"],
  ["رندة حديثة", "معهد الواحة التقني", "Anbar", "Study advice", "إذا ما تقدر تدرس ساعتين، ابدأ بعشر دقايق. البداية الصغيرة تسحب الباقي وياها.", "مؤقت عشر دقائق ودفتر بصفحة واحدة", "ابدأ جلسة تركيز الآن", "Student advice"],
  ["بكر القائم", "حرم الحدود الأكاديمي", "Anbar", "Campus question", "منو من غرب الأنبار؟ Let’s find students قريبين ونسوي study network.", "نقاط ضوء على خريطة مبسطة لغرب الأنبار", "اكتب مدينتك وتخصصك فقط", "Find students in your governorate"],

  ["مروان تكريت", "كلية القلعة العلمية", "Salah al-Din", "Presentation", "الدكتور قال five-minute presentation وأنا عندي 37 slide ومشاعر كثيرة.", "شاشة تعرض 37 شريحة ومؤقت خمس دقائق", "كم شريحة تكفي لخمس دقائق؟", "Presentation day panic"],
  ["شهد سامراء", "حرم الملوية الأكاديمي", "Salah al-Din", "Campus photography", "ظل المبنى وقت العصر طلع أحلى من كل محاولاتي بالـediting ✨", "ظلال هندسية طويلة في ساحة خيالية", "شاركوا لقطة الظلال", "Campus photography"],
  ["أحمد بلد", "معهد النور التقني", "Salah al-Din", "Notes exchange", "يا أهل المرحلة الثانية، notes please. التسجيل الصوتي كله صوت تقليب أوراق 😭", "موجة صوتية تتحول إلى أوراق كرتونية", "انضموا لمجموعة المادة", "Send notes please"],
  ["فرح الشرقاط", "أكاديمية دجلة العليا", "Salah al-Din", "Cafeteria", "فلافل الكافتيريا 9/10، الكرسي اللي يهتز 2/10. balanced review.", "سندويتش وكرسي كرتوني مع درجتي تقييم", "قيّم الأكل والمكان منفصلين", "Cafeteria food rating"],
  ["حسن الدور", "حرم الرافدين الشمالي", "Salah al-Din", "Exam meme", "أراجع chapter الأول، chapter السادس يراقبني من بعيد مثل villain.", "ستة كتب والكتاب السادس بظل درامي مضحك", "منو الـvillain بمنهجكم؟", "Finals week mood"],

  ["رُبى العمارة", "حرم الأهوار الجامعي", "Maysan", "Campus vibe", "نسمة العمارة اليوم قالت اتركوا القاعة وادرسوا برّه 🌿 والدكتور ما وافق للأسف.", "مساحة خضراء وكتب تتحرك مع النسيم", "تفضلون الدراسة داخل أم خارج؟", "Campus vibe"],
  ["حسين المجر", "كلية القصب العلمية", "Maysan", "Group study", "قسمنا المنهج بين أربعة… وبعدين كل واحد اكتشف إن قسمه الأصعب 😂", "أربع رزم أوراق بأحجام غير متساوية", "كوّنوا مجموعة وقسموا بإنصاف", "Study group"],
  ["بتول الكحلاء", "أكاديمية المشرح", "Maysan", "Transport", "الطريق الصبح: شمس، playlist، ورسالة الدكتور «المحاضرة بموعدها».", "شروق من نافذة حافلة وإشعار تمثيلي", "شارك أغنية الطريق", "Transportation to campus"],
  ["سيف علي الغربي", "معهد الميمونة التقني", "Maysan", "Job awareness", "قبل ما تتحمسون لأي إعلان شغل: تحققوا من اسم الجهة والرابط الأصلي ولا تدفعون رسوم مجهولة.", "عدسة تحقق فوق إعلان وظيفي تجريبي مطموس", "تصفحوا فقط الوظائف الموثقة", "Job discovery awareness"],
  ["ميساء قلعة صالح", "حرم المجرى الطلابي", "Maysan", "Dorm life", "سكن الطالبات الساعة 11: دراسة جماعية تحولت فجأة لوصفة اندومي جماعية 🍜", "أوعية نودلز ودفاتر في مساحة مشتركة", "شاركي أكلة جلسات الدراسة", "Dorm life"],

  ["علي الناصري", "كلية أور الجديدة", "Dhi Qar", "Campus question", "Are you from my university? علامة التعارف: كلنا نسأل وين القاعة 204 وهي أمامنا.", "باب قاعة 204 كبير وطالب كرتوني يبحث عنه", "اكتب سنتك الدراسية", "Are you from my university?"],
  ["زهراء الشطرة", "حرم السومر الأكاديمي", "Dhi Qar", "Library", "المكتبة هادئة لدرجة صوت فتح كيس chips صار إعلان رسمي 😭", "كيس وجبة يرسم حوله مؤثر صوتي صغير", "اختاروا snack هادئ للمكتبة", "Library night"],
  ["مرتضى سوق الشيوخ", "أكاديمية الأهوار الرقمية", "Dhi Qar", "Study playlist", "أدرس coding على صوت مطر خيالي لأن المطر الحقيقي عنده جدول مختلف.", "شاشة كود وخلفية مطر رقمية وسماعات", "اقترح صوتاً للتركيز", "Study playlist recommendations"],
  ["نغم الرفاعي", "معهد الفجر العلمي", "Dhi Qar", "First week", "أول أسبوع ودفتر واحد لكل المواد. confidence عالي والتنظيم تحت التجربة 😂", "دفتر واحد عليه فواصل مواد كثيرة", "السينيورز: أعطوا نصيحة تنظيم", "First week at university"],
  ["ياسر الجبايش", "حرم الماء والقصب", "Dhi Qar", "Best study spot", "أفضل مكان عندي قرب النافذة؛ ضوء حلو وناس أقل وطيور تسوي background vocals.", "نافذة وكتاب وظلال طيور", "شاركوا study spot مفضل", "Best study spot"],

  ["دانة السماوة", "حرم البادية الجامعي", "Muthanna", "Exam meme", "المنهج يقول سهل، الأسئلة تقول surprise! 🎁", "كتاب مبتسم وصندوق مفاجأة يخرج منه علامات استفهام", "صف امتحانك بكلمة", "Exam season survival memes"],
  ["حيدر الرميثة", "كلية الفرات الجنوبية", "Muthanna", "Coffee break", "استراحة عشر دقايق، بس القهوة تحتاج 12 دقيقة. math is not mathing.", "مؤقتان 10 و12 دقيقة وكوب", "اختار: قهوة أم رجوع بالوقت", "Coffee break"],
  ["مريم الخضر", "أكاديمية الصحراء الخضراء", "Muthanna", "Campus navigation", "وين Building B؟ كل واحد يعطيني اتجاه، وصلت تقريباً لمحافظة ثانية 😂", "خريطة بأسهم تخرج خارج إطار الحرم", "ساعدوا المستجدين بوصف واضح", "Where is Building B?"],
  ["قاسم الوركاء", "معهد الخطوة التقنية", "Muthanna", "Internship awareness", "Reminder: internship الحقيقي لازم يكون عنده جهة واضحة وتفاصيل يمكن التحقق منها. لا معلومات؟ لا تقديم.", "ختم verified تجريبي فوق checklist", "راجع تفاصيل الفرصة الموثقة", "Internship reminder"],
  ["ليان السلمان", "حرم الأفق الصحراوي", "Muthanna", "Student discovery", "طلاب المثنى وينكم؟ اكتبوا major ونشوف منو يدرس نفس المواد 🙌", "خريطة مبسطة مع بطاقات تخصصات", "ابحث عن study buddy", "Find students in your governorate"],

  ["رند الديوانية", "حرم القادسية الشبابي", "Qadisiyah", "Campus vibe", "Morning campus walk قبل الزحمة = main character moment ✨", "ممر فارغ صباحاً وظل حقيبة ودفتر", "شاركوا أغنية مشهد البداية", "Campus morning"],
  ["سجاد الشامية", "كلية الفرات الخصبة", "Qadisiyah", "Cafeteria", "رز ودجاج الكافتيريا 8/10، واللبن أنقذ الموقف مثل supporting actor.", "صينية طعام مع نجوم تقييم وشخصية لبن كرتونية", "اعطِ وجبتك عنوان فيلم", "Cafeteria food rating"],
  ["آلاء عفك", "أكاديمية السنابل الحديثة", "Qadisiyah", "Group study", "Solo study للهدوء، group study لما تحتاج أحد يقول لك لا تفتح TikTok.", "نصف صورة مكتب فردي ونصفها طاولة مجموعة", "صوّتوا وحددوا وقت كل أسلوب", "Group study vs solo study polls"],
  ["يوسف الحمزة", "معهد الدغارة التقني", "Qadisiyah", "Graduation", "آخر فصل! كل مشروع أسلمه أحس موسيقى النهاية تشتغل براسي 🎓", "ملفات تسليم تتجه نحو قبعة تخرج", "هنّئوا طالباً قرب تخرجه", "Graduation"],
  ["سارة غماس", "حرم النخيل الغربي", "Qadisiyah", "Scholarship awareness", "للناس اللي تدور scholarships: تابعوا قسم الفرص الموثق واقرؤوا شروط المصدر الأصلي، مو كلام الكروبات.", "هاتف يعرض قائمة فرص عامة مع أيقونة رابط أصلي", "تصفحوا المنح الموثقة", "Scholarship awareness"],

  ["روژ هەڵەبجە", "کەمپی هەنار", "Halabja", "Photography", "هەڵەبجە لە پشت کامێراوە 📸 campus + mountains + soft light = perfect frame.", "كاميرا أمام حرم خيالي وجبال بإضاءة ناعمة", "شاركوا أفضل frame من يومكم", "Halabja student photography"],
  ["ژيار سيران", "حرم سروشت الجامعي", "Halabja", "Campus vibe", "ئەمڕۆ هەوا وایکرد وانەی دەرەوە بخوێنین 🌿 best classroom has no walls.", "طلاب من الخلف يدرسون على عشب أمام جبال", "داخل أم خارج؟ صوّتوا", "Outdoor study"],
  ["هێمن خورمال", "أكاديمية پەروەردە نوێ", "Halabja", "Library", "Library corner found ✅ ئارامە، ڕووناکە، تەنها socket ـەکە دوورە 😅", "زاوية قراءة دافئة وسلك شحن طويل كرتوني", "رشحوا زاوية مكتبة", "Best study spot"],
  ["باران بيارة", "معهد زينە التقني", "Halabja", "First week", "Freshers، ئەگەر ون بوون ask anyone. We all had a ‘wrong building’ day 😂", "مبنيان ملونان ولافتة سؤال كبيرة", "Freshers ask, seniors answer", "First week at university"],
  ["لافا تويلة", "حرم باليسان الإبداعي", "Halabja", "Student discovery", "Find students in Halabja 💛 ناوی بەشەکەت بنووسە، maybe your next project partner is here.", "بطاقات تخصصات تطفو فوق خريطة حلبجة", "اكتب القسم لتجد شريك مشروع", "Find students in your governorate"],
];

const metricFor = (index: number) => ({
  likes: 23 + ((index * 47 + index * index * 3) % 527),
  commentsCount: 2 + ((index * 11 + index * index) % 58),
  shares: (index * 7 + index * index * 2) % 31,
});

export const campusLifeMockPosts: CampusLifePost[] = seeds.map((seed, index) => {
  const [studentName, universityOrCampus, governorate, category, text, suggestedVisual, cta, moodTag] = seed;
  const metrics = metricFor(index + 1);
  const comments = [...commentPacks[index % commentPacks.length]];

  return {
    id: `campus-life-mock-${String(index + 1).padStart(3, "0")}`,
    studentName,
    universityOrCampus,
    governorate,
    category,
    text,
    suggestedVisual,
    ...metrics,
    commentsCount: Math.max(metrics.commentsCount, comments.length),
    comments,
    cta,
    moodTag,
    imageUrl: `/campus-life/post-${String(index + 1).padStart(3, "0")}.svg`,
    imageAlt: suggestedVisual,
    visualTheme: `${category} · ${moodTag}`,
    isMock: true,
  };
});

const governorateIds: Record<string, string> = {
  Baghdad: "baghdad",
  Basra: "basra",
  "Nineveh/Mosul": "nineveh",
  Erbil: "erbil",
  Sulaymaniyah: "sulaymaniyah",
  Duhok: "duhok",
  Kirkuk: "kirkuk",
  Najaf: "najaf",
  Karbala: "karbala",
  Babil: "babil",
  Wasit: "wasit",
  Diyala: "diyala",
  Anbar: "anbar",
  "Salah al-Din": "salah_al_din",
  Maysan: "maysan",
  "Dhi Qar": "dhi_qar",
  Muthanna: "muthanna",
  Qadisiyah: "al_qadisiyah",
  Halabja: "halabja",
};

const detectLanguage = (text: string): Language => {
  if (/[ەێۆڕڵڤپچژگک]/.test(text)) return "ku";
  if (/[؀-ۿ]/.test(text)) return "ar";
  return "en";
};

// Adapter for the existing app feed model. Keep this export scoped to Campus Life UI only.
export const campusLifeFeedItems: FeedItem[] = campusLifeMockPosts.map((post, postIndex) => {
  const originalLanguage = detectLanguage(post.text);
  const commentsList = post.comments.map((comment, commentIndex) => {
    const separatorIndex = comment.indexOf(":");
    const authorName = separatorIndex >= 0 ? comment.slice(0, separatorIndex).trim() : "Student";
    const content = separatorIndex >= 0 ? comment.slice(separatorIndex + 1).trim() : comment;

    return {
      id: `${post.id}-comment-${commentIndex + 1}`,
      authorName,
      authorRole: "student" as const,
      authorAvatar: "",
      content,
      date: `${commentIndex + 1}h`,
      likes: (postIndex * 3 + commentIndex * 2) % 12,
      original_language: detectLanguage(content),
      content_original: content,
    };
  });

  return {
    id: post.id,
    type: "campus_life",
    titleEN: post.moodTag,
    titleAR: post.moodTag,
    titleKU: post.moodTag,
    contentEN: post.text,
    contentAR: post.text,
    contentKU: post.text,
    original_language: originalLanguage,
    title_original: post.moodTag,
    body_original: post.text,
    author: {
      name: post.studentName,
      role: "student",
      avatar: "",
      university: post.universityOrCampus,
    },
    date: `${1 + (postIndex % 11)}h`,
    likes: post.likes,
    commentsCount: post.commentsCount,
    commentsList,
    shares: post.shares,
    governorateId: governorateIds[post.governorate] || "all",
    universityId: "all",
    location: post.governorate,
    imageUrl: post.imageUrl,
    imageAlt: post.imageAlt,
    category: "post",
    sourceType: "student_tip",
    tags: [post.category, post.moodTag, post.governorate],
    suggestedVisual: post.suggestedVisual,
    cta: post.cta,
    moodTag: post.moodTag,
    visualTheme: post.visualTheme,
    isMock: true,
  };
});
