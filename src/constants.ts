import { Governorate, Institution, Post, Opportunity, Notification, Comment } from './types';

export const GOVERNORATES: Governorate[] = [
  'بغداد', 'البصرة', 'الموصل', 'أربيل', 'السليمانية', 'دهوك',
  'النجف', 'كربلاء', 'الأنبار', 'ديالى', 'كركوك', 'واسط',
  'المثنى', 'ذي قار', 'ميسان', 'بابل', 'صلاح الدين', 'القادسية'
];

export const SAMPLE_INSTITUTIONS: Institution[] = [
  // بغداد - Public Universities
  { id: 'baghdad-1', name: 'جامعة بغداد', nameEn: 'University of Baghdad', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/uob/100/100', cover: 'https://picsum.photos/seed/uob_c/800/400', students: 50000, followers: 120000, postCount: 3400, description: 'الأم والجامعة العريقة في قلب العاصمة بغداد.' },
  { id: 'baghdad-2', name: 'الجامعة المستنصرية', nameEn: 'Al-Mustansiriyya University', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/must/100/100', cover: 'https://picsum.photos/seed/must_c/800/400', students: 45000, followers: 95000, postCount: 2800, description: 'صرح علمي شامخ ومعلم من معالم بغداد التاريخية.' },
  { id: 'baghdad-3', name: 'جامعة النهرين', nameEn: 'Al-Nahrain University', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/nahrain/100/100', cover: 'https://picsum.photos/seed/nahrain_c/800/400', students: 15000, followers: 45000, postCount: 900, description: 'التميز العلمي والبحثي في خدمة المجتمع.' },
  { id: 'baghdad-4', name: 'الجامعة العراقية', nameEn: 'Al-Iraqia University', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/iraqia/100/100', cover: 'https://picsum.photos/seed/iraqia_c/800/400', students: 25000, followers: 60000, postCount: 1200, description: 'جامعة حديثة تسعى للريادة والتميز.' },
  { id: 'baghdad-5', name: 'جامعة التكنولوجيا', nameEn: 'University of Technology', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/uot/100/100', cover: 'https://picsum.photos/seed/uot_c/800/400', students: 20000, followers: 55000, postCount: 1000, description: 'رائدة في التعليم الهندسي والتقني.' },
  { id: 'baghdad-6', name: 'جامعة تكنولوجيا المعلومات والاتصالات', nameEn: 'University of Information Technology and Communications', type: 'university', isPublic: true, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/uitc/100/100', cover: 'https://picsum.photos/seed/uitc_c/800/400', students: 8000, followers: 25000, postCount: 400, description: 'متخصصة في تقنيات المعلومات والاتصالات الحديثة.' },
  // بغداد - Private Universities/Colleges
  { id: 'baghdad-p1', name: 'كلية المأمون الجامعة', nameEn: 'Al-Mamoun University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/mamoun/100/100', cover: 'https://picsum.photos/seed/mamoun_c/800/400', students: 5000, followers: 15000, postCount: 250, description: 'كلية أهلية معتمدة في بغداد.' },
  { id: 'baghdad-p2', name: 'كلية المنصور الجامعة', nameEn: 'Al-Mansour University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/mansour/100/100', cover: 'https://picsum.photos/seed/mansour_c/800/400', students: 6000, followers: 18000, postCount: 300, description: 'من الكليات الأهلية الرائدة في بغداد.' },
  { id: 'baghdad-p3', name: 'كلية بغداد للعلوم الاقتصادية الجامعة', nameEn: 'Baghdad College of Economic Sciences University', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/bces/100/100', cover: 'https://picsum.photos/seed/bces_c/800/400', students: 4000, followers: 12000, postCount: 200, description: 'متخصصة في العلوم الاقتصادية والإدارية.' },
  { id: 'baghdad-p4', name: 'كلية دجلة الجامعة', nameEn: 'Dijlah University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/dijlah/100/100', cover: 'https://picsum.photos/seed/dijlah_c/800/400', students: 5500, followers: 16000, postCount: 280, description: 'كلية أهلية تتميز بالجودة الأكاديمية.' },
  { id: 'baghdad-p5', name: 'كلية مدينة العلوم الجامعة', nameEn: 'Madenat Alelem University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/ma/100/100', cover: 'https://picsum.photos/seed/ma_c/800/400', students: 4500, followers: 14000, postCount: 220, description: 'مدينة العلوم الجامعة - نحو مستقبل أفضل.' },
  { id: 'baghdad-p6', name: 'كلية بغداد الصيدلة الجامعة', nameEn: 'Baghdad Pharmacy College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/bpc/100/100', cover: 'https://picsum.photos/seed/bpc_c/800/400', students: 3000, followers: 10000, postCount: 150, description: 'متخصصة في علوم الصيدلة.' },
  { id: 'baghdad-p7', name: 'كلية الرافدين الجامعة', nameEn: 'Al-Rafidain University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/rafidain/100/100', cover: 'https://picsum.photos/seed/rafidain_c/800/400', students: 3500, followers: 11000, postCount: 180, description: 'كلية الرافدين الجامعة - بغداد.' },
  { id: 'baghdad-p8', name: 'كلية النسور الجامعة', nameEn: 'Al-Nisour University College', type: 'college', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/nisour/100/100', cover: 'https://picsum.photos/seed/nisour_c/800/400', students: 4000, followers: 13000, postCount: 200, description: 'من الكليات الأهلية المتميزة.' },
  { id: 'baghdad-p9', name: 'جامعة السلام', nameEn: 'Alsalam University', type: 'university', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/salam/100/100', cover: 'https://picsum.photos/seed/salam_c/800/400', students: 7000, followers: 20000, postCount: 350, description: 'جامعة أهلية شاملة في بغداد.' },
  { id: 'baghdad-p10', name: 'جامعة أوروك', nameEn: 'Uruk University', type: 'university', isPublic: false, governorate: 'بغداد', city: 'بغداد', logo: 'https://picsum.photos/seed/uruk/100/100', cover: 'https://picsum.photos/seed/uruk_c/800/400', students: 6500, followers: 19000, postCount: 320, description: 'جامعة أوروك - حضارة وتعليم.' },
  // المثنى
  { id: 'muthanna-1', name: 'جامعة المثنى', nameEn: 'Al Muthanna University', type: 'university', isPublic: true, governorate: 'المثنى', city: 'السماوة', logo: 'https://picsum.photos/seed/muthanna/100/100', cover: 'https://picsum.photos/seed/muthanna_c/800/400', students: 12000, followers: 30000, postCount: 500, description: 'جامعة المثنى - صرح علمي في جنوب العراق.' },
  // بابل
  { id: 'babil-1', name: 'جامعة بابل', nameEn: 'University of Babylon', type: 'university', isPublic: true, governorate: 'بابل', city: 'الحلة', logo: 'https://picsum.photos/seed/babil/100/100', cover: 'https://picsum.photos/seed/babil_c/800/400', students: 28000, followers: 60000, postCount: 1100, description: 'صرح العلم في أرض الحضارات.' },
  { id: 'babil-2', name: 'الجامعة الخضراء', nameEn: 'Al-Qasim Green University', type: 'university', isPublic: true, governorate: 'بابل', city: 'الحلة', logo: 'https://picsum.photos/seed/qasim/100/100', cover: 'https://picsum.photos/seed/qasim_c/800/400', students: 8000, followers: 20000, postCount: 300, description: 'الجامعة الخضراء - بيئة تعليمية مستدامة.' },
  // كركوك
  { id: 'kirkuk-1', name: 'جامعة كركوك', nameEn: 'University of Kirkuk', type: 'university', isPublic: true, governorate: 'كركوك', city: 'كركوك', logo: 'https://picsum.photos/seed/kirkuk/100/100', cover: 'https://picsum.photos/seed/kirkuk_c/800/400', students: 15000, followers: 35000, postCount: 600, description: 'جامعة كركوك - بوابة الشمال.' },
  // ديالى
  { id: 'diyala-1', name: 'جامعة ديالى', nameEn: 'University of Diyala', type: 'university', isPublic: true, governorate: 'ديالى', city: 'بعقوبة', logo: 'https://picsum.photos/seed/diyala/100/100', cover: 'https://picsum.photos/seed/diyala_c/800/400', students: 18000, followers: 40000, postCount: 700, description: 'جامعة ديالى - علم وتنمية.' },
  { id: 'diyala-p1', name: 'كلية اليرموك الجامعة', nameEn: 'Al Yarmouk University College', type: 'college', isPublic: false, governorate: 'ديالى', city: 'بعقوبة', logo: 'https://picsum.photos/seed/yarmouk/100/100', cover: 'https://picsum.photos/seed/yarmouk_c/800/400', students: 3500, followers: 10000, postCount: 150, description: 'كلية اليرموك الجامعة - ديالى.' },
  // النجف
  { id: 'najaf-1', name: 'جامعة الكوفة', nameEn: 'University of Kufa', type: 'university', isPublic: true, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/kufa/100/100', cover: 'https://picsum.photos/seed/kufa_c/800/400', students: 32000, followers: 75000, postCount: 1800, description: 'امتداد لعمق العلم والتاريخ في كوفة العرب.' },
  { id: 'najaf-2', name: 'الكلية اللاهوتية في النجف', nameEn: 'Theological College of Najaf', type: 'college', isPublic: true, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/theo/100/100', cover: 'https://picsum.photos/seed/theo_c/800/400', students: 5000, followers: 15000, postCount: 250, description: 'الكلية اللاهوتية - النجف الأشرف.' },
  { id: 'najaf-3', name: 'جامعة جابر بن حيان الطبية', nameEn: 'Jabir ibn Hayyan Medical University', type: 'university', isPublic: true, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/jaber/100/100', cover: 'https://picsum.photos/seed/jaber_c/800/400', students: 6000, followers: 18000, postCount: 300, description: 'جامعة طبية متخصصة في النجف.' },
  { id: 'najaf-4', name: 'الجامعة التقنية الفرات الأوسط', nameEn: 'Al-Furat Al-Awsat Technical University', type: 'university', isPublic: true, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/furat/100/100', cover: 'https://picsum.photos/seed/furat_c/800/400', students: 10000, followers: 25000, postCount: 400, description: 'الجامعة التقنية الفرات الأوسط.' },
  { id: 'najaf-p1', name: 'جامعة الكفيل', nameEn: 'University of Alkafeel', type: 'university', isPublic: false, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/alkafeel/100/100', cover: 'https://picsum.photos/seed/alkafeel_c/800/400', students: 5000, followers: 15000, postCount: 200, description: 'جامعة الكفيل الأهلية.' },
  { id: 'najaf-p2', name: 'كلية الشيخ الطوسي الجامعة', nameEn: 'Sheikh Tusi University College', type: 'college', isPublic: false, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/tusi/100/100', cover: 'https://picsum.photos/seed/tusi_c/800/400', students: 3000, followers: 9000, postCount: 120, description: 'كلية الشيخ الطوسي الجامعة.' },
  { id: 'najaf-p3', name: 'الجامعة الإسلامية', nameEn: 'The Islamic University', type: 'university', isPublic: false, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/islamic/100/100', cover: 'https://picsum.photos/seed/islamic_c/800/400', students: 4500, followers: 13000, postCount: 180, description: 'الجامعة الإسلامية في النجف.' },
  { id: 'najaf-p4', name: 'كلية الطوسي الجامعة', nameEn: 'Altoosi University College', type: 'college', isPublic: false, governorate: 'النجف', city: 'النجف', logo: 'https://picsum.photos/seed/altoosi/100/100', cover: 'https://picsum.photos/seed/altoosi_c/800/400', students: 3500, followers: 11000, postCount: 140, description: 'كلية الطوسي الجامعة.' },
  // ذي قار
  { id: 'dhiqar-1', name: 'جامعة ذي قار', nameEn: 'Thi-Qar University', type: 'university', isPublic: true, governorate: 'ذي قار', city: 'الناصرية', logo: 'https://picsum.photos/seed/dhiqar/100/100', cover: 'https://picsum.photos/seed/dhiqar_c/800/400', students: 14000, followers: 32000, postCount: 550, description: 'جامعة ذي قار - في أرض سومر.' },
  // صلاح الدين
  { id: 'saladin-1', name: 'جامعة سامراء', nameEn: 'Samarra University', type: 'university', isPublic: true, governorate: 'صلاح الدين', city: 'سامراء', logo: 'https://picsum.photos/seed/samarra/100/100', cover: 'https://picsum.photos/seed/samarra_c/800/400', students: 8000, followers: 20000, postCount: 300, description: 'جامعة سامراء - مدينة التاريخ.' },
  { id: 'saladin-2', name: 'جامعة تكريت', nameEn: 'Tikrit University', type: 'university', isPublic: true, governorate: 'صلاح الدين', city: 'تكريت', logo: 'https://picsum.photos/seed/tikrit/100/100', cover: 'https://picsum.photos/seed/tikrit_c/800/400', students: 16000, followers: 38000, postCount: 650, description: 'جامعة تكريت - صرح علمي في صلاح الدين.' },
  // كربلاء
  { id: 'karbala-1', name: 'جامعة كربلاء', nameEn: 'University of Karbala', type: 'university', isPublic: true, governorate: 'كربلاء', city: 'كربلاء', logo: 'https://picsum.photos/seed/karbala/100/100', cover: 'https://picsum.photos/seed/karbala_c/800/400', students: 22000, followers: 55000, postCount: 950, description: 'المنهل العلمي والفكري في مدينة الحسين.' },
  { id: 'karbala-p1', name: 'كلية أهل البيت الجامعة', nameEn: 'Ahlulbait University College', type: 'college', isPublic: false, governorate: 'كربلاء', city: 'كربلاء', logo: 'https://picsum.photos/seed/ahlulbait/100/100', cover: 'https://picsum.photos/seed/ahlulbait_c/800/400', students: 4000, followers: 12000, postCount: 200, description: 'كلية أهل البيت الجامعة.' },
  { id: 'karbala-p2', name: 'جامعة العامل', nameEn: 'University of Al-Ameed', type: 'university', isPublic: false, governorate: 'كربلاء', city: 'كربلاء', logo: 'https://picsum.photos/seed/alameed/100/100', cover: 'https://picsum.photos/seed/alameed_c/800/400', students: 3500, followers: 10000, postCount: 180, description: 'جامعة العامل الأهلية.' },
  // نينوى (الموصل)
  { id: 'nineveh-1', name: 'جامعة الموصل', nameEn: 'University of Mosul', type: 'university', isPublic: true, governorate: 'الموصل', city: 'الموصل', logo: 'https://picsum.photos/seed/mosul/100/100', cover: 'https://picsum.photos/seed/mosul_c/800/400', students: 35000, followers: 80000, postCount: 1500, description: 'مركز العلم والثقافة في نينوى الحدباء.' },
  { id: 'nineveh-2', name: 'الجامعة التقنية الشمالية', nameEn: 'Northern Technical University', type: 'university', isPublic: true, governorate: 'الموصل', city: 'الموصل', logo: 'https://picsum.photos/seed/ntu/100/100', cover: 'https://picsum.photos/seed/ntu_c/800/400', students: 12000, followers: 28000, postCount: 450, description: 'الجامعة التقنية الشمالية.' },
  { id: 'nineveh-p1', name: 'كلية الحدباء الجامعة', nameEn: 'Al-Hadba University College', type: 'college', isPublic: false, governorate: 'الموصل', city: 'الموصل', logo: 'https://picsum.photos/seed/hadba/100/100', cover: 'https://picsum.photos/seed/hadba_c/800/400', students: 5000, followers: 14000, postCount: 220, description: 'كلية الحدباء الجامعة.' },
  // القادسية
  { id: 'qadisiyyah-1', name: 'جامعة القادسية', nameEn: 'University of Al-Qadisiyyah', type: 'university', isPublic: true, governorate: 'القادسية', city: 'الديوانية', logo: 'https://picsum.photos/seed/qadisiyyah/100/100', cover: 'https://picsum.photos/seed/qadisiyyah_c/800/400', students: 15000, followers: 35000, postCount: 600, description: 'جامعة القادسية - في قلب الفرات الأوسط.' },
  // الأنبار
  { id: 'anbar-1', name: 'جامعة الأنبار', nameEn: 'University of Anbar', type: 'university', isPublic: true, governorate: 'الأنبار', city: 'الرمادي', logo: 'https://picsum.photos/seed/anbar/100/100', cover: 'https://picsum.photos/seed/anbar_c/800/400', students: 18000, followers: 40000, postCount: 700, description: 'جامعة الأنبار - غرب العراق.' },
  { id: 'anbar-p1', name: 'كلية المعارف الجامعة', nameEn: 'Al Maarif University College', type: 'college', isPublic: false, governorate: 'الأنبار', city: 'الرمادي', logo: 'https://picsum.photos/seed/maarif/100/100', cover: 'https://picsum.photos/seed/maarif_c/800/400', students: 3000, followers: 9000, postCount: 150, description: 'كلية المعارف الجامعة.' },
  // واسط
  { id: 'wasit-1', name: 'جامعة واسط', nameEn: 'Wasit University', type: 'university', isPublic: true, governorate: 'واسط', city: 'الكوت', logo: 'https://picsum.photos/seed/wasit/100/100', cover: 'https://picsum.photos/seed/wasit_c/800/400', students: 12000, followers: 28000, postCount: 500, description: 'جامعة واسط - في أرض الزقافة.' },
  { id: 'wasit-p1', name: 'كلية الكوت الجامعة', nameEn: 'Al-Kut University College', type: 'college', isPublic: false, governorate: 'واسط', city: 'الكوت', logo: 'https://picsum.photos/seed/kut/100/100', cover: 'https://picsum.photos/seed/kut_c/800/400', students: 3500, followers: 10000, postCount: 180, description: 'كلية الكوت الجامعة.' },
  // البصرة
  { id: 'basra-1', name: 'جامعة البصرة', nameEn: 'University of Basrah', type: 'university', isPublic: true, governorate: 'البصرة', city: 'البصرة', logo: 'https://picsum.photos/seed/basrah/100/100', cover: 'https://picsum.photos/seed/basrah_c/800/400', students: 30000, followers: 70000, postCount: 2200, description: 'بوابة العراق البحرية ومنار العلم في الجنوب.' },
  { id: 'basra-2', name: 'الجامعة التقنية الجنوبية', nameEn: 'Southern Technical University', type: 'university', isPublic: true, governorate: 'البصرة', city: 'البصرة', logo: 'https://picsum.photos/seed/stu/100/100', cover: 'https://picsum.photos/seed/stu_c/800/400', students: 15000, followers: 35000, postCount: 800, description: 'الجامعة التقنية الجنوبية.' },
  { id: 'basra-3', name: 'جامعة البصرة للنفط والغاز', nameEn: 'Basra University of Oil and Gas', type: 'university', isPublic: true, governorate: 'البصرة', city: 'البصرة', logo: 'https://picsum.photos/seed/bog/100/100', cover: 'https://picsum.photos/seed/bog_c/800/400', students: 5000, followers: 15000, postCount: 300, description: 'جامعة متخصصة في النفط والغاز.' },
  { id: 'basra-p1', name: 'كلية البصرة الجامعة للعلوم والتكنولوجيا', nameEn: 'Basrah University College for Science and Technology', type: 'college', isPublic: false, governorate: 'البصرة', city: 'البصرة', logo: 'https://picsum.photos/seed/bucst/100/100', cover: 'https://picsum.photos/seed/bucst_c/800/400', students: 4000, followers: 12000, postCount: 200, description: 'كلية البصرة الجامعة للعلوم والتكنولوجيا.' },
  { id: 'basra-p2', name: 'الجامعة العراقية للكليات', nameEn: 'Iraq University College', type: 'college', isPublic: false, governorate: 'البصرة', city: 'البصرة', logo: 'https://picsum.photos/seed/iuc/100/100', cover: 'https://picsum.photos/seed/iuc_c/800/400', students: 4500, followers: 13000, postCount: 220, description: 'الجامعة العراقية للكليات.' },
  // ميسان
  { id: 'maysan-1', name: 'جامعة ميسان', nameEn: 'Misan University', type: 'university', isPublic: true, governorate: 'ميسان', city: 'العمارة', logo: 'https://picsum.photos/seed/misan/100/100', cover: 'https://picsum.photos/seed/misan_c/800/400', students: 10000, followers: 25000, postCount: 400, description: 'جامعة ميسان - في جنوب العراق.' },
  // إقليم كردستان
  { id: 'kurd-1', name: 'جامعة صلاح الدين - أربيل', nameEn: 'Salahaddin University-Erbil', type: 'university', isPublic: true, governorate: 'أربيل', city: 'أربيل', logo: 'https://picsum.photos/seed/salahaddin/100/100', cover: 'https://picsum.photos/seed/salahaddin_c/800/400', students: 25000, followers: 60000, postCount: 1200, description: 'جامعة صلاح الدين - أربيل.' },
  { id: 'kurd-2', name: 'جامعة السليمانية', nameEn: 'University of Sulaymaniyah', type: 'university', isPublic: true, governorate: 'السليمانية', city: 'السليمانية', logo: 'https://picsum.photos/seed/sulay/100/100', cover: 'https://picsum.photos/seed/sulay_c/800/400', students: 20000, followers: 50000, postCount: 1000, description: 'جامعة السليمانية - قلب كردستان.' },
  { id: 'kurd-3', name: 'جامعة دهوك', nameEn: 'University of Duhok', type: 'university', isPublic: true, governorate: 'دهوك', city: 'دهوك', logo: 'https://picsum.photos/seed/duhok/100/100', cover: 'https://picsum.photos/seed/duhok_c/800/400', students: 15000, followers: 35000, postCount: 700, description: 'جامعة دهوك - شمال العراق.' },
  { id: 'kurd-4', name: 'جامعة كويه', nameEn: 'Koya University', type: 'university', isPublic: true, governorate: 'أربيل', city: 'كويه', logo: 'https://picsum.photos/seed/koya/100/100', cover: 'https://picsum.photos/seed/koya_c/800/400', students: 5000, followers: 15000, postCount: 300, description: 'جامعة كويه - إنجليزية اللغة.' },
  { id: 'kurd-5', name: 'جامعة هولير الطبية', nameEn: 'Hawler Medical University', type: 'university', isPublic: true, governorate: 'أربيل', city: 'أربيل', logo: 'https://picsum.photos/seed/hawler/100/100', cover: 'https://picsum.photos/seed/hawler_c/800/400', students: 4000, followers: 12000, postCount: 250, description: 'جامعة هولير الطبية.' },
  { id: 'kurd-6', name: 'جامعة زاخو', nameEn: 'University of Zakho', type: 'university', isPublic: true, governorate: 'دهوك', city: 'زاخو', logo: 'https://picsum.photos/seed/zakho/100/100', cover: 'https://picsum.photos/seed/zakho_c/800/400', students: 6000, followers: 18000, postCount: 350, description: 'جامعة زاخو.' },
  { id: 'kurd-7', name: 'الجامعة التقنية السليمانية', nameEn: 'Sulaimani Polytechnic University', type: 'university', isPublic: true, governorate: 'السليمانية', city: 'السليمانية', logo: 'https://picsum.photos/seed/spu/100/100', cover: 'https://picsum.photos/seed/spu_c/800/400', students: 8000, followers: 20000, postCount: 400, description: 'الجامعة التقنية السليمانية.' },
  { id: 'kurd-8', name: 'جامعة رابرين', nameEn: 'University of Raparin', type: 'university', isPublic: true, governorate: 'السليمانية', city: 'رانيه', logo: 'https://picsum.photos/seed/raparin/100/100', cover: 'https://picsum.photos/seed/raparin_c/800/400', students: 4000, followers: 10000, postCount: 200, description: 'جامعة رابرين.' },
  { id: 'kurd-9', name: 'جامعة سوران', nameEn: 'Soran University', type: 'university', isPublic: true, governorate: 'أربيل', city: 'سوران', logo: 'https://picsum.photos/seed/soran/100/100', cover: 'https://picsum.photos/seed/soran_c/800/400', students: 5000, followers: 14000, postCount: 280, description: 'جامعة سوران.' },
];

export const SAMPLE_POSTS: Post[] = [
  {
    id: 'p1',
    type: 'announcement',
    title: 'بدء التقديم للدراسات العليا',
    institutionName: 'جامعة بغداد',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'تعلن رئاسة جامعة بغداد عن بدء التقديم للدراسات العليا للعام الدراسي القادم. يشمل التقديم كافة التخصصات العلمية والإنسانية وفق الضوابط المعلنة.',
    image: 'https://picsum.photos/seed/post1/800/500',
    likes: 1240,
    comments: 89,
    views: 5600,
    timestamp: 'منذ ساعتين',
    isVerified: true
  },
  {
    id: 'p-urgent',
    type: 'urgent',
    title: 'تأجيل الامتحانات النهائية',
    institutionName: 'الجامعة المستنصرية',
    institutionLogo: 'https://picsum.photos/seed/must/100/100',
    governorate: 'بغداد',
    content: 'تقرر تأجيل امتحانات يوم غد الخميس نظراً لسوء الأحوال الجوية المتوقعة. يرجى متابعة الجداول المحدثة لاحقاً.',
    likes: 4500,
    comments: 1200,
    views: 15400,
    timestamp: 'منذ ١٠ دقائق',
    isVerified: true
  },
  {
    id: 'p2',
    type: 'event',
    title: 'مهرجان الابتكار الرقمي ٢٠٢٤',
    institutionName: 'الجامعة المستنصرية',
    institutionLogo: 'https://picsum.photos/seed/must/100/100',
    governorate: 'بغداد',
    content: 'ندعوكم لحضور المهرجان السنوي للابتكار والذكاء الاصطناعي في القاعة الكبرى. جوائز قيمة للمشاريع المتميزة.',
    image: 'https://picsum.photos/seed/post2/800/500',
    likes: 856,
    comments: 45,
    eventDate: { day: '٢٤', month: 'مايو' },
    timestamp: 'منذ 5 ساعات',
    isVerified: true
  },
  {
    id: 'p3',
    type: 'student',
    authorName: 'أحمد علي',
    authorAvatar: 'https://picsum.photos/seed/student1/100/100',
    institutionName: 'جامعة الموصل',
    institutionLogo: 'https://picsum.photos/seed/mosul/100/100',
    governorate: 'الموصل',
    content: 'أجواء دراسية رائعة اليوم في مكتبة الجامعة. بالتوفيق للجميع في الامتحانات النهائية!',
    image: 'https://picsum.photos/seed/student_post/800/500',
    likes: 320,
    comments: 12,
    timestamp: 'منذ 8 ساعات'
  },
  {
    id: 'o-job',
    type: 'opportunity',
    title: 'مطور واجهات برمجية (React)',
    institutionName: 'شركة بوابة العراق',
    institutionLogo: 'https://picsum.photos/seed/iq-gate/100/100',
    governorate: 'بغداد',
    content: 'نبحث عن مطور ذكي شغوف لتعزيز فريقنا التقني. خبرة عام على الأقل في React و Tailwind.',
    deadline: '١٥ حزيران',
    tags: ['برمجة', 'بغداد', 'وظيفة'],
    likes: 450,
    comments: 23,
    timestamp: 'منذ يوم'
  },
  {
    id: 'p4',
    type: 'announcement',
    title: 'توسع القبول في المجموعة الطبية',
    institutionName: 'جامعة الكوفة',
    institutionLogo: 'https://picsum.photos/seed/kufa/100/100',
    governorate: 'النجف',
    content: 'تعلن وزارة التعليم العالي عن موافقتها على زيادة خطة القبول في كليات الطب وطب الأسنان في جامعة الكوفة لهذا العام الدراسي استجابة للحاجة المحلية.',
    likes: 890,
    comments: 120,
    views: 4500,
    timestamp: 'منذ ١٢ ساعة',
    isVerified: true
  },
  {
    id: 'p5',
    type: 'event',
    title: 'أسبوع ريادة الأعمال في البصرة',
    institutionName: 'الجامعة التقنية الجنوبية',
    institutionLogo: 'https://picsum.photos/seed/stu/100/100',
    governorate: 'البصرة',
    content: 'ورش عمل وجلسات حوارية لمساعدة الطلبة على بدء مشاريعهم الناشئة. حضور مميز لنخبة من رواد الأعمال في المحافظة.',
    image: 'https://picsum.photos/seed/basra_event/800/500',
    likes: 560,
    comments: 34,
    eventDate: { day: '٠٥', month: 'يونيو' },
    timestamp: 'منذ يوم',
    isVerified: true
  },
  {
    id: 'p6',
    type: 'student',
    authorName: 'سارة محمد',
    authorAvatar: 'https://picsum.photos/seed/student2/100/100',
    institutionName: 'جامعة بابل',
    institutionLogo: 'https://picsum.photos/seed/babil/100/100',
    governorate: 'بابل',
    content: 'مشروع تخرجي اليوم في كلية الهندسة - جامعة بابل. فخورة جداً بهذا الإنجاز وشكراً لكل من ساندني!',
    image: 'https://picsum.photos/seed/grad_post/800/500',
    likes: 980,
    comments: 78,
    timestamp: 'منذ ١٨ ساعة'
  }
];

// Additional 22 posts to reach 30 total
export const EXTRA_POSTS: Post[] = [
  {
    id: 'p7',
    type: 'student',
    authorName: 'محمد الجابري',
    authorAvatar: 'https://picsum.photos/seed/student3/100/100',
    institutionName: 'جامعة النهرين',
    institutionLogo: 'https://picsum.photos/seed/nahrain/100/100',
    governorate: 'بغداد',
    content: 'أخيراً أنهيت مشروع تخرجي في هندسة الحاسوب! أربع سنوات من الجهد والتعب تتوج بهذا اليوم. شكراً لكل أستاذ وزميل ساندني 🎓',
    image: 'https://picsum.photos/seed/grad1/800/500',
    likes: 450,
    comments: 32,
    timestamp: 'منذ ساعة'
  },
  {
    id: 'p8',
    type: 'announcement',
    title: 'قبول طلبات منح التفوق الدراسي',
    institutionName: 'جامعة البصرة',
    institutionLogo: 'https://picsum.photos/seed/basrah/100/100',
    governorate: 'البصرة',
    content: 'تعلن الجامعة عن فتح باب التقديم لمنح التفوق الدراسي للعام الأكاديمي الجديد. يشترط معدل لا يقل عن 80٪ واستيفاء شروط القبول.',
    image: 'https://picsum.photos/seed/basra_ann/800/500',
    likes: 730,
    comments: 56,
    views: 3400,
    timestamp: 'منذ ساعتين',
    isVerified: true
  },
  {
    id: 'p9',
    type: 'event',
    title: 'يوم التوظيف والشركات ٢٠٢٤',
    institutionName: 'جامعة الكوفة',
    institutionLogo: 'https://picsum.photos/seed/kufa/100/100',
    governorate: 'النجف',
    content: 'تستضيف الجامعة أكثر من 40 شركة عراقية وإقليمية في يوم التوظيف السنوي. فرصة ذهبية للتواصل مع أصحاب العمل وتقديم سيرتك الذاتية.',
    image: 'https://picsum.photos/seed/career_fair/800/500',
    likes: 1100,
    comments: 88,
    eventDate: { day: '١٥', month: 'يونيو' },
    timestamp: 'منذ ٣ ساعات',
    isVerified: true
  },
  {
    id: 'p10',
    type: 'student',
    authorName: 'نور الهاشمي',
    authorAvatar: 'https://picsum.photos/seed/student4/100/100',
    institutionName: 'جامعة كربلاء',
    institutionLogo: 'https://picsum.photos/seed/karbala/100/100',
    governorate: 'كربلاء',
    content: 'المكتبة المركزية في الجامعة مصدر إلهام حقيقي. قضيت ٦ ساعات متواصلة في البحث لأطروحتي. الجهد يستحق 📚',
    image: 'https://picsum.photos/seed/library1/800/500',
    likes: 280,
    comments: 19,
    timestamp: 'منذ ٤ ساعات'
  },
  {
    id: 'p11',
    type: 'urgent',
    title: 'تحويل الامتحانات إلى الإلكترونية',
    institutionName: 'جامعة بغداد',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'قررت كلية الهندسة تحويل جميع امتحانات الفصل الأول إلى النظام الإلكتروني. يرجى التأكد من وجود حساب إلكتروني مفعّل قبل الامتحان.',
    likes: 3200,
    comments: 560,
    views: 18000,
    timestamp: 'منذ ٣٠ دقيقة',
    isVerified: true
  },
  {
    id: 'p12',
    type: 'student',
    authorName: 'علي العامري',
    authorAvatar: 'https://picsum.photos/seed/student5/100/100',
    institutionName: 'جامعة بابل',
    institutionLogo: 'https://picsum.photos/seed/babil/100/100',
    governorate: 'بابل',
    content: 'فريقنا في كلية تقنية المعلومات فاز بالمركز الأول في هاكاثون جامعة بابل السنوي. نحن نعمل على تطبيق لإدارة الجدول الدراسي بالذكاء الاصطناعي!',
    image: 'https://picsum.photos/seed/hackathon/800/500',
    likes: 890,
    comments: 71,
    timestamp: 'منذ ٦ ساعات'
  },
  {
    id: 'p13',
    type: 'announcement',
    title: 'تعديل الجدول الدراسي الفصل الثاني',
    institutionName: 'الجامعة المستنصرية',
    institutionLogo: 'https://picsum.photos/seed/must/100/100',
    governorate: 'بغداد',
    content: 'تُعلن رئاسة الجامعة عن تعديل في جدول المحاضرات الأسبوعي ابتداءً من الأسبوع القادم. يرجى متابعة الموقع الإلكتروني للاطلاع على الجدول المحدّث.',
    likes: 540,
    comments: 44,
    views: 2200,
    timestamp: 'منذ ٧ ساعات',
    isVerified: true
  },
  {
    id: 'p14',
    type: 'opportunity',
    title: 'مصمم جرافيك متدرب',
    institutionName: 'مؤسسة الإبداع الرقمي',
    institutionLogo: 'https://picsum.photos/seed/creative/100/100',
    governorate: 'البصرة',
    content: 'نبحث عن مصمم جرافيك مبدع لانضمام لفريقنا التسويقي. أدوات Adobe مطلوبة والاهتمام بالتصميم العربي ميزة إضافية.',
    deadline: '٣٠ يونيو',
    tags: ['تصميم', 'البصرة', 'تدريب', 'إبداع'],
    likes: 320,
    comments: 28,
    timestamp: 'منذ ١٠ ساعات'
  },
  {
    id: 'p15',
    type: 'student',
    authorName: 'رنا الصالح',
    authorAvatar: 'https://picsum.photos/seed/student6/100/100',
    institutionName: 'جامعة صلاح الدين',
    institutionLogo: 'https://picsum.photos/seed/salah/100/100',
    governorate: 'أربيل',
    content: 'اليوم آخر يوم من محاضراتي في الجامعة قبل الامتحانات. لا أصدق أن هذه السنة انتهت بهذه السرعة. حظاً موفقاً للجميع 🍀',
    image: 'https://picsum.photos/seed/campus_life/800/500',
    likes: 610,
    comments: 47,
    timestamp: 'منذ ١٢ ساعة'
  },
  {
    id: 'p16',
    type: 'event',
    title: 'مؤتمر الذكاء الاصطناعي وتطبيقاته',
    institutionName: 'جامعة بغداد',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'يستضيف معهد التقنيات المتقدمة المؤتمر الدولي الثالث للذكاء الاصطناعي. نخبة من الباحثين العراقيين والدوليين سيشاركون بأبحاثهم.',
    image: 'https://picsum.photos/seed/ai_conf/800/500',
    likes: 1450,
    comments: 103,
    eventDate: { day: '٢٠', month: 'يونيو' },
    timestamp: 'منذ يوم',
    isVerified: true
  },
  {
    id: 'p17',
    type: 'student',
    authorName: 'حسين الزيدي',
    authorAvatar: 'https://picsum.photos/seed/student7/100/100',
    institutionName: 'جامعة الموصل',
    institutionLogo: 'https://picsum.photos/seed/mosul/100/100',
    governorate: 'الموصل',
    content: 'نتائج قبولي في برنامج ماجستير علم البيانات بجامعة الموصل 🎉 ثلاث سنوات من التحضير وأخيراً تحقق الحلم!',
    image: 'https://picsum.photos/seed/acceptance/800/500',
    likes: 2100,
    comments: 198,
    timestamp: 'منذ ١٥ ساعة'
  },
  {
    id: 'p18',
    type: 'announcement',
    title: 'افتتاح المختبر التقني المتكامل',
    institutionName: 'جامعة النهرين',
    institutionLogo: 'https://picsum.photos/seed/nahrain/100/100',
    governorate: 'بغداد',
    content: 'تفتتح جامعة النهرين مختبراً تقنياً متكاملاً بتجهيزات من الجيل الجديد لدعم الأبحاث في الهندسة والحاسوب. متاح لطلبة الدراسات العليا والباحثين.',
    image: 'https://picsum.photos/seed/lab_open/800/500',
    likes: 870,
    comments: 63,
    views: 4100,
    timestamp: 'منذ يوم',
    isVerified: true
  },
  {
    id: 'p19',
    type: 'opportunity',
    title: 'منحة حكومية للدراسة في ألمانيا',
    institutionName: 'وزارة التعليم العالي',
    institutionLogo: 'https://picsum.photos/seed/mohe/100/100',
    governorate: 'بغداد',
    content: 'تتيح وزارة التعليم العالي ٥٠ منحة دراسية لإكمال الدراسات العليا في الجامعات الألمانية. المتطلبات: معدل عالٍ وإجادة اللغة الإنجليزية.',
    deadline: '١ يوليو',
    tags: ['منحة', 'ألمانيا', 'دراسات عليا', 'وزارة'],
    likes: 5600,
    comments: 892,
    timestamp: 'منذ يومين'
  },
  {
    id: 'p20',
    type: 'student',
    authorName: 'زينب المحمدي',
    authorAvatar: 'https://picsum.photos/seed/student8/100/100',
    institutionName: 'جامعة كربلاء',
    institutionLogo: 'https://picsum.photos/seed/karbala/100/100',
    governorate: 'كربلاء',
    content: 'جلسة تصوير لمشروع التخرج كانت تجربة استثنائية. الفريق أبدع في كل شيء من التصميم إلى التنفيذ. فخورة بكل واحد منكم 📸',
    image: 'https://picsum.photos/seed/team_photo/800/500',
    likes: 760,
    comments: 55,
    timestamp: 'منذ يومين'
  },
  {
    id: 'p21',
    type: 'event',
    title: 'معرض لوحات الفن التشكيلي الطلابي',
    institutionName: 'جامعة بابل',
    institutionLogo: 'https://picsum.photos/seed/babil/100/100',
    governorate: 'بابل',
    content: 'معرض الفن التشكيلي السنوي لطلبة كلية الفنون الجميلة. أكثر من ١٢٠ لوحة تعكس إبداع الشباب العراقي وموهبتهم الفريدة.',
    image: 'https://picsum.photos/seed/art_exhibit/800/500',
    likes: 430,
    comments: 37,
    eventDate: { day: '٢٨', month: 'مايو' },
    timestamp: 'منذ يومين',
    isVerified: false
  },
  {
    id: 'p22',
    type: 'urgent',
    title: 'إعادة جدولة امتحانات الدور الثاني',
    institutionName: 'جامعة الأنبار',
    institutionLogo: 'https://picsum.photos/seed/anbar/100/100',
    governorate: 'الأنبار',
    content: 'تُعلن الجامعة عن إعادة جدولة امتحانات الدور الثاني لبعض الأقسام. يرجى مراجعة جدول الامتحانات المنشور على البوابة الرسمية.',
    likes: 1800,
    comments: 310,
    views: 9000,
    timestamp: 'منذ ٥ ساعات',
    isVerified: true
  },
  {
    id: 'p23',
    type: 'student',
    authorName: 'عمر الشمري',
    authorAvatar: 'https://picsum.photos/seed/student9/100/100',
    institutionName: 'جامعة الأنبار',
    institutionLogo: 'https://picsum.photos/seed/anbar/100/100',
    governorate: 'الأنبار',
    content: 'بعد ١٨ شهراً من العمل المتواصل، نشرنا بحثنا في مجلة دولية محكّمة في مجال معالجة الإشارات. أول نشر علمي لي وما راح يكون الأخير 💪',
    image: 'https://picsum.photos/seed/research/800/500',
    likes: 3400,
    comments: 234,
    timestamp: 'منذ ٣ أيام'
  },
  {
    id: 'p24',
    type: 'announcement',
    title: 'تفعيل بوابة الخدمات الطلابية الجديدة',
    institutionName: 'جامعة ديالى',
    institutionLogo: 'https://picsum.photos/seed/diyala/100/100',
    governorate: 'ديالى',
    content: 'أعلنت الجامعة عن تفعيل بوابة الخدمات الطلابية الإلكترونية الجديدة التي تتيح معاملات الاستمارات والمصادقة ودفع الرسوم عبر الإنترنت.',
    likes: 690,
    comments: 48,
    views: 3100,
    timestamp: 'منذ ٣ أيام',
    isVerified: true
  },
  {
    id: 'p25',
    type: 'opportunity',
    title: 'مهندس شبكات - شركة زين العراق',
    institutionName: 'شركة زين العراق',
    institutionLogo: 'https://picsum.photos/seed/zain/100/100',
    governorate: 'البصرة',
    content: 'زين العراق تفتح باب التوظيف لمهندسي الشبكات في مكتب البصرة. خبرة سنتين على الأقل في إدارة شبكات Cisco أو Huawei.',
    deadline: '٢٠ يونيو',
    tags: ['شبكات', 'زين', 'البصرة', 'وظيفة'],
    likes: 1200,
    comments: 95,
    timestamp: 'منذ ٤ أيام'
  },
  {
    id: 'p26',
    type: 'student',
    authorName: 'لينا عبد الرحمن',
    authorAvatar: 'https://picsum.photos/seed/student10/100/100',
    institutionName: 'جامعة السليمانية',
    institutionLogo: 'https://picsum.photos/seed/sul/100/100',
    governorate: 'السليمانية',
    content: 'يوم التخرج أخيراً! ٥ سنوات في كلية طب الأسنان وها أنا طبيبة الآن. الرحلة كانت شاقة لكن كل لحظة تعب كانت تستحق 🦷👩‍⚕️',
    image: 'https://picsum.photos/seed/dentist_grad/800/500',
    likes: 4200,
    comments: 387,
    timestamp: 'منذ أسبوع'
  },
  {
    id: 'p27',
    type: 'event',
    title: 'البطولة الرياضية بين الجامعات',
    institutionName: 'جامعة بغداد',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'تستضيف الجامعة البطولة الرياضية الطلابية بين جامعات العاصمة في كرة القدم وكرة السلة والكرة الطائرة. ادعم منتخب جامعتك!',
    image: 'https://picsum.photos/seed/sports_day/800/500',
    likes: 2800,
    comments: 211,
    eventDate: { day: '١٠', month: 'يونيو' },
    timestamp: 'منذ أسبوع',
    isVerified: true
  },
  {
    id: 'p28',
    type: 'student',
    authorName: 'كرار الموسوي',
    authorAvatar: 'https://picsum.photos/seed/student11/100/100',
    institutionName: 'جامعة الكوفة',
    institutionLogo: 'https://picsum.photos/seed/kufa/100/100',
    governorate: 'النجف',
    content: 'تعلمت اليوم في المختبر كيفية برمجة الميكروكنترولر Arduino لمشروع المنزل الذكي. مستوى تقني ممتاز في كلية الهندسة الكهربائية هذا العام 🔌',
    image: 'https://picsum.photos/seed/lab_work/800/500',
    likes: 520,
    comments: 41,
    timestamp: 'منذ أسبوع'
  },
  {
    id: 'p29',
    type: 'announcement',
    title: 'منح أكاديمية من جامعة كربلاء للتميز',
    institutionName: 'جامعة كربلاء',
    institutionLogo: 'https://picsum.photos/seed/karbala/100/100',
    governorate: 'كربلاء',
    content: 'تمنح جامعة كربلاء ١٠ منح أكاديمية كاملة للطلبة المتميزين لمتابعة الدراسات العليا داخل الجامعة. يُشترط الحصول على معدل امتياز.',
    image: 'https://picsum.photos/seed/karbala_ann/800/500',
    likes: 1780,
    comments: 142,
    views: 7800,
    timestamp: 'منذ أسبوعين',
    isVerified: true
  },
  {
    id: 'p30',
    type: 'student',
    authorName: 'آية الكريم',
    authorAvatar: 'https://picsum.photos/seed/student12/100/100',
    institutionName: 'جامعة بغداد',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'اليوم درسنا في كلية العلوم موضوع الطيف الكهرومغناطيسي وطبيقاته في التشخيص الطبي. المادة رائعة وأستاذنا يشرح بطريقة مبدعة جداً 🔬',
    image: 'https://picsum.photos/seed/science_class/800/500',
    likes: 340,
    comments: 28,
    timestamp: 'منذ أسبوعين'
  }
];

export const ALL_POSTS: Post[] = [...SAMPLE_POSTS, ...EXTRA_POSTS];

export const HERO_POSTS: Post[] = ALL_POSTS.filter(
  p => (p.type === 'announcement' || p.type === 'event' || p.type === 'urgent') && p.image
).slice(0, 5);

export const SAMPLE_COMMENTS: Record<string, Comment[]> = {
  'p1': [
    { id: 'c1', postId: 'p1', authorName: 'أحمد علي', authorAvatar: 'https://picsum.photos/seed/c1/100/100', content: 'شكراً على هذا الإعلان المهم! متى آخر موعد للتقديم؟', timestamp: 'منذ ٣٠ دقيقة', likes: 12 },
    { id: 'c2', postId: 'p1', authorName: 'سارة حسن', authorAvatar: 'https://picsum.photos/seed/c2/100/100', content: 'هل التقديم متاح لجميع التخصصات؟', timestamp: 'منذ ساعة', likes: 5 },
    { id: 'c3', postId: 'p1', authorName: 'محمد كريم', authorAvatar: 'https://picsum.photos/seed/c3/100/100', content: 'أخيراً! كنا ننتظر هذا الإعلان منذ زمن', timestamp: 'منذ ساعتين', likes: 18 },
  ],
  'p3': [
    { id: 'c4', postId: 'p3', authorName: 'حيدر الصادق', authorAvatar: 'https://picsum.photos/seed/c4/100/100', content: 'بالتوفيق لك يا صديق! امتحاناتنا غداً أيضاً 💪', timestamp: 'منذ ٢ ساعة', likes: 8 },
    { id: 'c5', postId: 'p3', authorName: 'نور محمد', authorAvatar: 'https://picsum.photos/seed/c5/100/100', content: 'جو رائع في مكتبة الجامعة! المكان مليء بالطاقة الإيجابية', timestamp: 'منذ ٣ ساعات', likes: 14 },
  ],
  'p6': [
    { id: 'c6', postId: 'p6', authorName: 'علي الجبوري', authorAvatar: 'https://picsum.photos/seed/c6/100/100', content: 'ألف مبروك سارة! جهدك واضح في كل تفصيل', timestamp: 'منذ ساعة', likes: 22 },
    { id: 'c7', postId: 'p6', authorName: 'رنا الكريم', authorAvatar: 'https://picsum.photos/seed/c7/100/100', content: 'مشروع رائع جداً! من أي كلية أنتِ؟', timestamp: 'منذ ٥ ساعات', likes: 9 },
    { id: 'c8', postId: 'p6', authorName: 'حسن العلي', authorAvatar: 'https://picsum.photos/seed/c8/100/100', content: 'تبارك الله، استمري بهذا الإبداع', timestamp: 'منذ ٧ ساعات', likes: 31 },
  ],
};

export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    title: 'مهندس برمجيات متدرب',
    type: 'internship',
    institutionName: 'شركة زين العراق',
    institutionLogo: 'https://picsum.photos/seed/zain/100/100',
    governorate: 'بغداد',
    deadline: '2024-06-15',
    tags: ['Tech', 'Baghdad', 'Intern']
  },
  {
    id: 'o2',
    title: 'منحة دراسية لدراسة الماجستير',
    type: 'scholarship',
    institutionName: 'رئاسة الوزراء - البعثات',
    institutionLogo: 'https://picsum.photos/seed/gov/100/100',
    governorate: 'بغداد',
    deadline: '2024-07-01',
    tags: ['Master', 'International', 'Scholarship']
  },
  {
    id: 'o3',
    title: 'محلل بيانات ناشئ',
    type: 'job',
    institutionName: 'مصرف الرافدين',
    institutionLogo: 'https://picsum.photos/seed/rafidain/100/100',
    governorate: 'بغداد',
    deadline: '2024-06-20',
    tags: ['Finance', 'Data', 'Full-time']
  },
  {
    id: 'o4',
    title: 'تدريب مهني في حقول النفط',
    type: 'training',
    institutionName: 'شركة نفط البصرة',
    institutionLogo: 'https://picsum.photos/seed/oil/100/100',
    governorate: 'البصرة',
    deadline: '2024-07-15',
    tags: ['Energy', 'Engineering', 'Training']
  }
];

export const SAMPLE_INSIGHTS: Post[] = [
  {
    id: 'ins1',
    type: 'insight',
    title: 'أكثر المهارات المطلوبة في سوق العمل العراقي ٢٠٢٤',
    institutionName: 'جامعة بغداد - مركز المهنة',
    institutionLogo: 'https://picsum.photos/seed/uob_logo/100/100',
    governorate: 'بغداد',
    content: 'أظهرت دراسة حديثة أجراها مركز تطوير المهارات في جامعة بغداد أن المهارات التقنية والتحليلية تتصدر قائمة الطلب لدى الشركات المحلية والدولية العاملة في العراق.',
    likes: 2450,
    comments: 156,
    views: 8900,
    timestamp: 'منذ يومين',
    isVerified: true,
    chartData: [
      { name: 'برمجة', value: 85 },
      { name: 'تحليل', value: 65 },
      { name: 'تسويق', value: 45 },
      { name: 'إدارة', value: 70 },
      { name: 'لغات', value: 50 }
    ]
  },
  {
    id: 'ins2',
    type: 'insight',
    title: 'توزيع الخريجين حسب التخصصات والتوظيف',
    institutionName: 'وزارة التعليم العالي والبحث العلمي',
    institutionLogo: 'https://picsum.photos/seed/mohe/100/100',
    governorate: 'بغداد',
    content: 'تقرير تفصيلي حول نسب توظيف الخريجين الجدد في القطاعين العام والخاص، مع تسليط الضوء على الفجوة بين التعليم الأكاديمي واحتياجات السوق.',
    likes: 1890,
    comments: 234,
    views: 12000,
    timestamp: 'منذ أسبوع',
    isVerified: true,
    chartData: [
      { name: 'هندسة', value: 40 },
      { name: 'طب', value: 95 },
      { name: 'علوم', value: 30 },
      { name: 'إدارة', value: 55 },
      { name: 'آداب', value: 25 }
    ]
  }
];

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'social',
    subType: 'like',
    title: 'أعجب علي ببروفايلك',
    content: 'قام علي محمد بالإعجاب بصورتك الشخصية الجديدة.',
    timestamp: 'منذ ٥ دقائق',
    group: 'today',
    isRead: false,
    avatar: 'https://picsum.photos/seed/n1/100/100'
  },
  {
    id: 'n2',
    type: 'opportunity',
    subType: 'system',
    title: 'فرصة عمل جديدة',
    content: 'توجد فرصة تدريب جديدة في جامعة بغداد تناسب اهتماماتك.',
    timestamp: 'منذ ساعتين',
    group: 'today',
    isRead: false
  },
  {
    id: 'n3',
    type: 'announcement',
    subType: 'urgent',
    title: 'تنبيه عاجل من الجامعة',
    content: 'تم تأجيل موعد تسليم طلبات الدراسات العليا ليومين إضافيين.',
    timestamp: 'منذ ٤ ساعات',
    group: 'today',
    isRead: true
  },
  {
    id: 'n4',
    type: 'event',
    subType: 'system',
    title: 'فعالية قادمة غداً',
    content: 'لا تنسَ حضور مؤتمر الذكاء الاصطناعي في القاعة الكبرى.',
    timestamp: 'منذ يوم',
    group: 'this_week',
    isRead: true
  },
  {
    id: 'n5',
    type: 'social',
    subType: 'follow',
    title: 'متابع جديد',
    content: 'بدأ سيف أحمد بمتابعتك الآن.',
    timestamp: 'منذ يومين',
    group: 'this_week',
    isRead: true,
    avatar: 'https://picsum.photos/seed/n5/100/100'
  }
];
