import { Governorate, University, FeedItem, UserProfile } from '../types';

export const IraqiGovernorates: Governorate[] = [
  { id: 'baghdad', nameEN: 'Baghdad', nameAR: 'Ø¨ØºØ¯Ø§Ø¯', nameKU: 'Ø¨Û•ØºØ¯Ø§' },
  { id: 'nineveh', nameEN: 'Nineveh (Mosul)', nameAR: 'Ù†ÙŠÙ†ÙˆÙ‰ (Ø§Ù„Ù…ÙˆØµÙ„)', nameKU: 'Ù†Û•ÛŒÙ†Û•ÙˆØ§' },
  { id: 'basra', nameEN: 'Basra', nameAR: 'Ø§Ù„Ø¨ØµØ±Ø©', nameKU: 'Ø¨Û•Ø³Ø±Û•' },
  { id: 'sulaymaniyah', nameEN: 'Sulaymaniyah', nameAR: 'Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©', nameKU: 'Ø³ÚµÛŽÙ…Ø§Ù†ÛŒ' },
  { id: 'erbil', nameEN: 'Erbil', nameAR: 'Ø£Ø±Ø¨ÙŠÙ„', nameKU: 'Ù‡Û•ÙˆÙ„ÛŽØ±' },
  { id: 'kirkuk', nameEN: 'Kirkuk', nameAR: 'ÙƒØ±ÙƒÙˆÙƒ', nameKU: 'Ú©Û•Ø±Ú©ÙˆÙˆÚ©' },
  { id: 'najaf', nameEN: 'Najaf', nameAR: 'Ø§Ù„Ù†Ø¬Ù', nameKU: 'Ù†Û•Ø¬Û•Ù' },
  { id: 'karbala', nameEN: 'Karbala', nameAR: 'ÙƒØ±Ø¨Ù„Ø§Ø¡', nameKU: 'Ú©Û•Ø±Ø¨Û•Ù„Ø§' },
  { id: 'dhi_qar', nameEN: 'Dhi Qar', nameAR: 'Ø°ÙŠ Ù‚Ø§Ø±', nameKU: 'Ø²ÛŒÙ‚Ø§Ø±' },
  { id: 'babil', nameEN: 'Babil', nameAR: 'Ø¨Ø§Ø¨Ù„', nameKU: 'Ø¨Ø§Ø¨Ù„' },
  { id: 'anbar', nameEN: 'Anbar', nameAR: 'Ø§Ù„Ø£Ù†Ø¨Ø§Ø±', nameKU: 'Ø¦Û•Ù†Ø¨Ø§Ø±' },
  { id: 'diyala', nameEN: 'Diyala', nameAR: 'Ø¯ÙŠØ§Ù„Ù‰', nameKU: 'Ø¯ÛŒØ§Ù„Û•' },
  { id: 'salah_al_din', nameEN: 'Salah Al-Din', nameAR: 'ØµÙ„Ø§Ø­ Ø§Ù„Ø¯ÙŠÙ†', nameKU: 'Ø³Û•ÚµØ§Ø­Û•Ø¯ÛŒÙ†' },
  { id: 'wasit', nameEN: 'Wasit', nameAR: 'ÙˆØ§Ø³Ø·', nameKU: 'ÙˆØ§Ø³Øª' },
  { id: 'maysan', nameEN: 'Maysan', nameAR: 'Ù…ÙŠØ³Ø§Ù†', nameKU: 'Ù…ÛŒØ³Ø§Ù†' },
  { id: 'al_qadisiyah', nameEN: 'Al-Qadisiyah', nameAR: 'Ø§Ù„Ù‚Ø§Ø¯Ø³ÙŠØ©', nameKU: 'Ù‚Ø§Ø¯Ø³ÛŒÛ•' },
  { id: 'muthanna', nameEN: 'Muthanna', nameAR: 'Ø§Ù„Ù…Ø«Ù†Ù‰', nameKU: 'Ù…ÙˆØ³Û•Ù†Ù†Ø§' },
  { id: 'duhok', nameEN: 'Duhok', nameAR: 'Ø¯Ù‡ÙˆÙƒ', nameKU: 'Ø¯Ù‡Û†Ú©' },
  { id: 'halabja', nameEN: 'Halabja', nameAR: 'Ø­Ù„Ø¨Ø¬Ø©', nameKU: 'Ù‡Û•ÚµÛ•Ø¨Ø¬Û•' },
];

export const IraqiUniversities: University[] = [
  {
    id: 'u_baghdad',
    nameEN: 'University of Baghdad',
    nameAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§',
    governorateId: 'baghdad',
    logo: 'ðŸŽ“',
    color: 'from-blue-600 to-sky-500'
  },
  {
    id: 'u_mustansiriya',
    nameEN: 'Al-Mustansiriya University',
    nameAR: 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ†ØµØ±ÙŠØ©',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆØ³ØªÛ•Ù†Ø³Ø±ÛŒÛ•',
    governorateId: 'baghdad',
    logo: 'ðŸ›ï¸',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'u_sulaymaniyah',
    nameEN: 'University of Sulaymaniyah',
    nameAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ',
    governorateId: 'sulaymaniyah',
    logo: 'â›°ï¸',
    color: 'from-amber-600 to-indigo-500'
  },
  {
    id: 'u_salahaddin',
    nameEN: 'Salahaddin University',
    nameAR: 'Ø¬Ø§Ù…Ø¹Ø© ØµÙ„Ø§Ø­ Ø§Ù„Ø¯ÙŠÙ†',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Û•ÚµØ§Ø­Û•Ø¯ÛŒÙ†',
    governorateId: 'erbil',
    logo: 'ðŸ°',
    color: 'from-rose-600 to-orange-500'
  },
  {
    id: 'u_mosul',
    nameEN: 'University of Mosul',
    nameAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ',
    governorateId: 'nineveh',
    logo: 'ðŸ“–',
    color: 'from-violet-600 to-purple-500'
  },
  {
    id: 'u_basrah',
    nameEN: 'University of Basrah',
    nameAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø¨ØµØ±Ø©',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•Ø³Ø±Û•',
    governorateId: 'basra',
    logo: 'âš“',
    color: 'from-cyan-600 to-blue-500'
  },
  {
    id: 'auib',
    nameEN: 'American University of Iraq, Baghdad',
    nameAR: 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠØ© ÙÙŠ Ø¨ØºØ¯Ø§Ø¯',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¦Û•Ù…Ø±ÛŒÚ©ÛŒ Ù„Û• Ø¨Û•ØºØ¯Ø§Ø¯',
    governorateId: 'baghdad',
    logo: 'ðŸ¦…',
    color: 'from-red-600 to-blue-900'
  },
  {
    id: 'auis',
    nameEN: 'American University of Iraq, Sulaimani',
    nameAR: 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠØ© ÙÙŠ Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©',
    nameKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¦Û•Ù…Ø±ÛŒÚ©ÛŒ Ù„Û• Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ',
    governorateId: 'sulaymaniyah',
    logo: 'ðŸŒ¿',
    color: 'from-teal-700 to-amber-500'
  },
];

export const defaultUserProfile: UserProfile = {
  id: 'me',
  name: 'Zara Al-Iraqi',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  role: 'student',
  universityId: 'u_baghdad',
  governorateId: 'baghdad',
  bioEN: 'Computer Science junior at UoB. Passionate about UI/UX and building the tech ecosystem in Iraq. ðŸ‡®ðŸ‡¶âœ¨',
  bioAR: 'Ø·Ø§Ù„Ø¨Ø© Ø¹Ù„ÙˆÙ… Ø­Ø§Ø³ÙˆØ¨ ÙÙŠ Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯. Ø´ØºÙˆÙØ© Ø¨ØªØµÙ…ÙŠÙ… ÙˆØ§Ø¬Ù‡Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨ÙŠØ¦ÙŠ Ø§Ù„ØªÙ‚Ù†ÙŠ ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚. ðŸ‡®ðŸ‡¶âœ¨',
  bioKU: 'Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±ÛŒ Ø²Ø§Ù†Ø³ØªÛŒ Ú©Û†Ù…Ù¾ÛŒÙˆØªÛ•Ø± Ù„Û• Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§. Ø®ÙˆÙ„ÛŒØ§ÛŒ Ø¯ÛŒØ²Ø§ÛŒÙ†ÛŒ Ú•ÙˆÙˆÚ©Ø§Ø± Ùˆ Ø¨Ù†ÛŒØ§ØªÙ†Ø§Ù†ÛŒ Ø³ÛŒØ³ØªÛ•Ù…ÛŒ ØªÛ•Ú©Ù†Û•Ù„Û†Ú˜ÛŒ Ù„Û• Ø¹ÛŽØ±Ø§Ù‚Û•. ðŸ‡®ðŸ‡¶âœ¨',
  majorEN: 'Software Engineering (Year 3)',
  majorAR: 'Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª (Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø«Ø§Ù„Ø«Ø©)',
  majorKU: 'Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ Ù†Û•Ø±Ù…Û•Ú©Ø§ÚµØ§ (Ù‚Û†Ù†Ø§ØºÛŒ Ù£)',
  points: 340,
  level: 4,
  savedItemIds: [],
  appliedJobIds: [],
  joinedGroupIds: [],
  rsvpedEventIds:[],
};

export const initialFeedItems: FeedItem[] = [
  // 1. REAL OPPORTUNITY - Asiacell Elite Graduate Accelerator Program (Internship / Part-time / Job)
  {
    id: 'real-opp-asiacell',
    type: 'internship',
    titleEN: 'Asiacell Graduate Accelerator Elite Program ðŸ”´ðŸ’¼',
    titleAR: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ Ù†Ø®Ø¨Ø© Ø¢Ø³ÙŠØ§ Ø³ÙŠÙ„ Ù„ØªØ³Ø±ÙŠØ¹ ÙˆØªÙ‡ÙŠØ¦Ø© Ø§Ù„Ø®Ø±ÙŠØ¬ÙŠÙ† Ø§Ù„Ø¬Ø¯Ø¯ ðŸ”´ðŸ’¼',
    titleKU: 'Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Ù†ÙˆØ®Ø¨Û•ÛŒ Ø¦Ø§Ø³ÛŒØ§Ø³ÛŽÙ„ Ø¨Û† Ù¾ÛŽÚ¯Û•ÛŒØ§Ù†Ø¯Ù†ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆØ§Ù†ÛŒ Ù†ÙˆÛŽ ðŸ”´ðŸ’¼',
    contentEN: 'Asiacell is officially accepting applications for its 2026 Elite Accelerated Graduate Program. Intensive 6-month specialized masterclass tracks inside Network Architecture, Cybersecurity, Cloud Systems, and FinTech. Certified top performers transition directly to permanent full-time executive roles.',
    contentAR: 'ØªØ¹Ù„Ù† Ø´Ø±ÙƒØ© Ø¢Ø³ÙŠØ§ Ø³ÙŠÙ„ Ù„Ù„Ø§ØªØµØ§Ù„Ø§Øª Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¹Ù† ÙØªØ­ Ø¨Ø§Ø¨ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø§Ù„Ù†Ø®Ø¨Ø© Ù„ØªØ£Ù‡ÙŠÙ„ Ø§Ù„Ø®Ø±ÙŠØ¬ÙŠÙ† Ø§Ù„Ø¬Ø¯Ø¯ ÙˆØªØ¯Ø±ÙŠØ¨Ù‡Ù… Ù„Ù…Ø¯Ø© Ù¦ Ø£Ø´Ù‡Ø± Ù…ÙƒØ«ÙØ© ÙÙŠ Ù…Ø¬Ø§Ù„Ø§Øª Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„Ø´Ø¨ÙƒØ§ØªØŒ Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠØŒ Ø§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ø³Ø­Ø§Ø¨ÙŠØ©ØŒ ÙˆØ§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…Ø§Ù„ÙŠØ©. ØªÙˆØ¸ÙŠÙ Ø¯Ø§Ø¦Ù… Ù…Ø¨Ø§Ø´Ø± Ù„Ù„Ù…ØªÙ…ÙŠØ²ÙŠÙ†.',
    contentKU: 'Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ÛŒ Ø¦Ø§Ø³ÛŒØ§Ø³ÛŽÙ„ Ø¨Û† Ù¾Û•ÛŒÙˆÛ•Ù†Ø¯ÛŒÛŒÛ•Ú©Ø§Ù† Ø¨Û• ÙÛ•Ø±Ù…ÛŒ Ø¯Ø§ÙˆØ§ÛŒ Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù†ÛŒ Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒ Ø¯Û•Ú©Ø§Øª Ø¨Û† Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†ÛŒ Ù†Ø§ÛŒØ§Ø¨ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆØ§Ù† Ù„Û• Ø¨ÙˆØ§Ø±ÛŒ ØªÛ†Ø±ØŒ Ø³Ø§ÛŒØ¨Û•Ø±ØŒ Ú©Ù„Ø§ÙˆØ¯ Ùˆ Ø¯Ø§Ø±Ø§ÛŒÛŒ Ø¨Û• Ø´ÛŽÙˆØ§Ø²ÛŒ Ù…Û•Ø´Ù‚ Ùˆ Ø¯Ø§Ù…Û•Ø²Ø±Ø§Ù†Ø¯Ù†ÛŒ Ú©Û†ØªØ§ÛŒÛŒ.',
    author: {
      name: 'Asiacell Careers Team',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '30 mins ago',
    likes: 189,
    commentsCount: 12,
    governorateId: 'sulaymaniyah',
    company: 'Asiacell Telecomm',
    companyLogo: 'ðŸ”´',
    salary: '1,400,000 - 1,800,000 IQD / month stipend',
    location: 'Sulaymaniyah (HQ) & Baghdad (On-site)',
    deadline: 'July 15, 2026',
    opportunityCategory: 'Internship',
    workplaceType: 'On-site',
    whoCanApply: 'Iraqi graduates (2024-2026) in Software Engineering, CS, Computer Engineering, Telecommunications or Finance with strong analytical skills',
    savedCount: 245,
    universityAppliedCount: 38,
    companyVerified: true,
    tags: ['Asiacell', 'Careers', 'Telecom', 'GraduateProgram'],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600',
    commentsList: []
  },

  // 2. REAL SCHOLARSHIP - DAAD German Academic Exchange Service (Scholarship)
  {
    id: 'real-opp-daad',
    type: 'scholarship',
    titleEN: 'DAAD Fully Funded Masters Scholarship in Germany ðŸ‡©ðŸ‡ªðŸŽ“',
    titleAR: 'Ù…Ù†Ø­Ø© Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ© Ù„Ù„ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ DAAD Ø§Ù„Ù…Ù…ÙˆÙ„Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ù„Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ± ðŸ‡©ðŸ‡ªðŸŽ“',
    titleKU: 'Ø³Ú©Û†Ù„Û•Ø±Ø´ÛŒÙ¾ÛŒ DAADÛŒ Ø¦Û•ÚµÙ…Ø§Ù†ÛŒ Ù¾Ø§ÚµÙ¾Ø´ØªÛŒÚ©Ø±Ø§ÙˆÛŒ Ø¯Ø§Ø±Ø§ÛŒÛŒ Ø¨Û† Ù…Ø§Ø³ØªÛ•Ø± ðŸ‡©ðŸ‡ªðŸŽ“',
    contentEN: 'The German Academic Exchange Service (DAAD) is officially inviting Iraqi postgraduate applicants for master courses in sustainable development, energy engineering, and computer sciences. Program includes 100% tuition waiver, â‚¬934/month stipend, medical insurance, and travel allowances.',
    contentAR: 'ØªØ¹Ù„Ù† Ø§Ù„Ù‡ÙŠØ¦Ø© Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ© Ù„Ù„ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ (DAAD) Ø¹Ù† ÙØªØ­ Ø¨Ø§Ø¨ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ† Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù…Ù†Ø­ Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ù…Ø§Ø¬Ø³ØªÙŠØ± Ø§Ù„Ù…Ù…ÙˆÙ„Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ ÙÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ© Ø§Ù„Ø­ÙƒÙˆÙ…ÙŠØ©. ØªØ´Ù…Ù„ Ø§Ù„Ù…Ù†Ø­Ø© ØªØºØ·ÙŠØ© Ø§Ù„Ø±Ø³ÙˆÙ… ÙƒØ§Ù…Ù„Ø© ÙˆØ±Ø§ØªØ¨ Ø´Ù‡Ø±ÙŠ ÙˆØªØ£Ù…ÙŠÙ† ØµØ­ÙŠ ÙˆØªÙƒØ§Ù„ÙŠÙ Ø§Ù„Ø³ÙØ±.',
    contentKU: 'Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Ø¦Ø§ÚµÙˆÚ¯Û†Ú•ÛŒ Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒ Ø¦Û•ÚµÙ…Ø§Ù†ÛŒ DAAD Ø¨Û• ÙÛ•Ø±Ù…ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÛŒ Ø¹ÛŽØ±Ø§Ù‚ÛŒ Ø¨Ø§Ù†Ú¯Ù‡ÛŽØ´Øª Ø¯Û•Ú©Ø§Øª Ø¨Û† Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù†ÛŒ Ø³Ú©Û†Ù„Û•Ø±Ø´ÛŒÙ¾ÛŒ ØªÛ•ÙˆØ§Ùˆ Ù¾Ø§ÚµÙ¾Ø´ØªÛŒÚ©Ø±Ø§Ùˆ Ù„Û• Ø¦Û•ÚµÙ…Ø§Ù†ÛŒØ§ Ú©Û• Ù…ÙˆÙˆØ¹Û•ÛŒ Ù…Ø§Ù†Ú¯Ø§Ù†Û• Ùˆ Ø¨ÛŒÙ…Û• Ùˆ Ú¯Û•Ø´ØªÛŒ Ù„Û•Ø³Û•Ø±Û•.',
    author: {
      name: 'DAAD Iraq Advisory Office',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 hour ago',
    likes: 382,
    commentsCount: 29,
    governorateId: 'all',
    company: 'DAAD German Exchange',
    companyLogo: 'ðŸ‡©ðŸ‡ª',
    salary: 'Fully Funded (100% Tuition + â‚¬934/mo Stipend)',
    location: 'Germany Universities',
    deadline: 'August 31, 2026',
    opportunityCategory: 'Scholarship',
    workplaceType: 'Remote',
    whoCanApply: 'Iraqi Bachelor degree holders in Engineering, Sciences or IT with English proof and minimum 2 years working experience.',
    savedCount: 512,
    universityAppliedCount: 68,
    companyVerified: true,
    tags: ['DAAD', 'Germany', 'Scholarships', 'Masters'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600',
    commentsList: []
  },

  // 3. CAMPUS LIFE - AUIS Annual Spring Festival Photo Highlights (Story with Image)
  {
    id: 'campus-image-fest',
    type: 'story',
    titleEN: 'AUIS Annual Spring Festival Photo Highlights ðŸŽ¨ðŸŒ¸',
    titleAR: 'Ø£Ø¬ÙˆØ§Ø¡ ÙˆÙ…Ø´Ø§Ø±ÙŠØ¹ Ù…Ù‡Ø±Ø¬Ø§Ù† Ø§Ù„Ø±Ø¨ÙŠØ¹ Ø§Ù„Ø³Ù†ÙˆÙŠ ÙÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠØ© Ø¨Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ© ðŸŽ¨ðŸŒ¸',
    titleKU: 'Ø¯ÛŒÙ…Û•Ù† Ùˆ Ù¾Ú•Û†Ú˜Û•Ú©Ø§Ù†ÛŒ ÙÛŽØ³ØªÛŒÚ¤Ø§ÚµÛŒ Ø¨Û•Ù‡Ø§Ø±ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø¦Û•Ù…Ø±ÛŒÚ©ÛŒ Ù„Û• Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ ðŸŽ¨ðŸŒ¸',
    contentEN: "A peek at today's majestic annual Spring Fest at Al-Sulaymaniyah campus! Hundreds of students came clad in incredibly colorful traditional Kurdish clothing, showcasing fine art, traditional food booths, and innovative student software startup prototypes.",
    contentAR: "Ù†Ø¸Ø±Ø© Ø¹Ù„Ù‰ Ù…Ù‡Ø±Ø¬Ø§Ù† Ø§Ù„Ø±Ø¨ÙŠØ¹ Ø§Ù„Ø³Ù†ÙˆÙŠ Ø§Ù„Ù…Ù‡ÙŠØ¨ ÙÙŠ Ø­Ø±Ù… Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø£Ù…Ø±ÙŠÙƒÙŠØ© Ø¨Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ© Ø§Ù„ÙŠÙˆÙ…! Ù…Ø¦Ø§Øª Ø§Ù„Ø·Ù„Ø§Ø¨ Ø§Ø±ØªØ¯ÙˆØ§ Ø§Ù„Ø£Ø²ÙŠØ§Ø¡ Ø§Ù„ÙƒØ±Ø¯ÙŠØ© Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠØ© Ø§Ù„Ø²Ø§Ù‡ÙŠØ©ØŒ ÙˆØ¹Ø±Ø¶ÙˆØ§ Ù„ÙˆØ­Ø§ØªÙ‡Ù… Ø§Ù„ÙÙ†ÙŠØ© ÙˆØ¨ÙˆØªØ§Øª Ø§Ù„Ø£Ø·Ø¹Ù…Ø© Ø§Ù„ØªØ±Ø§Ø«ÙŠØ© ÙˆÙ†Ù…Ø§Ø°Ø¬ ØªÙ‚Ù†ÙŠØ© Ù„Ø´Ø±ÙƒØ§Øª Ø·Ù„Ø§Ø¨ÙŠØ© Ù†Ø§Ø´Ø¦Ø©.",
    contentKU: "Ø¯ÛŒÙ…Û•Ù†Û•Ú©Ø§Ù†ÛŒ ÙÛŽØ³ØªÛŒÚ¤Ø§ÚµÛŒ Ø¨Û•Ù‡Ø§Ø±ÛŒ Ø³Ø§ÚµØ§Ù†Û•ÛŒ Ø¦Û•Ù…Ú•Û† Ù„Û• Ø²Ø§Ù†Ú©Û†ÛŒ Ø¦Û•Ù…Ø±ÛŒÚ©ÛŒ Ù„Û• Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ! Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† Ø¬Ù„ÛŒ Ú©ÙˆØ±Ø¯ÛŒ Ú•Û•Ø³Û•Ù†ÛŒ Ú•Û•Ù†Ú¯Ø§ÙˆÚ•Û•Ù†Ú¯ Ùˆ ØªØ§Ø¨Ù„Û†ÛŒ Ø¯Û•Ø³ØªÚ©Ø±Ø¯ Ùˆ Ù¾Ú•Û†Ú˜Û•ÛŒ Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ Ø¯Û•Ø³ØªÙ¾ÛŽØ´Ø®Û•Ø±Û•Ú©Ø§Ù†ÛŒØ§Ù† Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯.",
    author: {
      name: 'Renas Hawrami',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
      university: 'American University of Iraq, Sulaimani'
    },
    date: '2 hours ago',
    likes: 412,
    commentsCount: 18,
    governorateId: 'sulaymaniyah',
    universityId: 'auis',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    tags: ['AUIS', 'CampusLife', 'Festival', 'Kurdistan'],
    commentsList: []
  },

  // 4. CAMPUS LIFE - Robotics and Solar IoT Demo at UoB (Story with Image)
  {
    id: 'campus-image-lab',
    type: 'story',
    titleEN: 'Robotics & Solar IoT Systems Lab Demo ðŸ¤–ðŸ”Œ',
    titleAR: 'Ø¹Ø±Ø¶ ØªØ¬Ø±ÙŠØ¨ÙŠ Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ø±ÙˆØ¨ÙˆØªØ§Øª ÙˆØ§Ù„Ø£Ù†Ø¸Ù…Ø© Ø§Ù„Ù…Ø¯Ù…Ø¬Ø© ÙÙŠ Ù…Ø¬Ù…Ø¹ Ù‡Ù†Ø¯Ø³Ø© Ø¨ØºØ¯Ø§Ø¯ ðŸ¤–ðŸ”Œ',
    titleKU: 'ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ú•Û†Ø¨Û†ØªÛŒÚ© Ùˆ Ø³ÛŒØ³ØªÛ•Ù…Û• Ù…ÙØ±Û†Ø´Ø±Ø§ÙˆÛ•Ú©Ø§Ù†ÛŒ Ø¦Û•Ù„ÛŒÚ©ØªØ±Û†Ù†ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§ ðŸ¤–ðŸ”Œ',
    contentEN: 'Our software engineering research group successfully calibrated and activated our autonomous solar-tracker prototype inside the campus lab! Responsive solar panel alignments are tracked in real-time over a modern dashboard.',
    contentAR: 'Ù†Ø¬Ø­ ÙØ±ÙŠÙ‚ Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª ÙÙŠ Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯ ÙÙŠ Ù…Ø¹Ø§ÙŠØ±Ø© ÙˆØªØ´ØºÙŠÙ„ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„Ø£ÙˆÙ„ÙŠ Ù„ØªØªØ¨Ø¹ Ø§Ù„Ø´Ù…Ø³ Ø§Ù„Ø°Ø§ØªÙŠ Ø¯Ø§Ø®Ù„ Ù…Ø®ØªØ¨Ø± Ø§Ù„ÙƒÙ„ÙŠØ©! Ù„ÙˆØ­Ø© Ø´Ù…Ø³ÙŠØ© Ù…ØªØ·ÙˆØ±Ø© ØªØªØ­Ø±Ùƒ Ø¨Ø¯Ù‚Ø© ÙˆØªÙ‚ØªØ±Ù† Ù…Ø¨Ø§Ø´Ø± Ù…Ø¹ Ø´Ø§Ø´Ø© ØªØªØ¨Ø¹ Ø³Ø­Ø§Ø¨ÙŠØ©.',
    contentKU: 'Ø³ÛŒØ³ØªÛ•Ù…ÛŒ Ú¯Ø±ÙˆÙ¾Û•Ú©Û•Ù…Ø§Ù† Ø¨Û† Ø²Ø§Ù†Ø³ØªÛŒ Ú©Û†Ù…Ù¾ÛŒÙˆØªÛ•Ø± Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ Ù¾Ú•Û†Ú˜Û•ÛŒ Ú•Û†Ø¨Û†ØªÛŒ Ø¨Û•Ø¯ÙˆØ§Ø¯Ø§Ú†ÙˆÙˆÙ†ÛŒ Ø®Û†Ø±ÛŒ Ø²ÛŒØ±Û•Ú©ÛŒ Ù„Û• ØªØ§Ù‚ÛŒÚ¯Û•ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§ Ø¯ÚµÙ†ÛŒØ§Ú©Ø±Ø¯Û•ÙˆÛ•! Ù¾Ø§Ù†ÛŽÚµÛ•Ú©Ø§Ù† Ú•Ø§Ø³ØªÛ•ÙˆØ®Û† Ø¯Û•Ø¬ÙˆÚµÛŽÙ†.',
    author: {
      name: 'Haider Hassan',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
      university: 'University of Baghdad'
    },
    date: '4 hours ago',
    likes: 298,
    commentsCount: 11,
    governorateId: 'baghdad',
    universityId: 'u_baghdad',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    tags: ['UoB', 'Robotics', 'Seniors', 'Engineering'],
    commentsList: []
  },

  // 5. REAL OPPORTUNITY - Five One Labs Startup Incubator Cohort (Training/Grant)
  {
    id: 'real-opp-fiveonelabs',
    type: 'training',
    titleEN: 'Five One Labs Startup Incubator Cohort ðŸš€ðŸ’¡',
    titleAR: 'Ø­Ø§Ø¶Ù†Ø© Ø£Ø¹Ù…Ø§Ù„ ÙØ§ÙŠÙ ÙˆÙ† Ù„Ø§Ø¨Ø³ Ù„ØªÙ…ÙˆÙŠÙ„ ÙˆØ¹ØµØ±Ù†Ø© Ø±ÙŠØ§Ø¯Ø© Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ ðŸš€ðŸ’¡',
    titleKU: 'Ø¦ÛŒÙ†Ú©ÛŒÙˆØ¨ÛŒØªÛ•Ø±ÛŒ ÙØ§ÙŠÙ ÙˆÛ•Ù† Ù„Ø§Ø¨Ø³ Ø¨Û† Ù¾Ø§ÚµÙ¾Ø´ØªÛŒ Ù¾Ú•Û†Ú˜Û•ÛŒ Ù†ÙˆÛŽÙƒØ§Ù† ðŸš€ðŸ’¡',
    contentEN: "Are you an Iraqi undergraduate or young fresh graduate with a tech-based startup idea? Five One Labs is opening admissions for its 3-month startup incubator program. Receives up to $5,000 equity-free seed grants, dynamic tech advisors, coworking space access, and professional pitch days.",
    contentAR: "Ù‡Ù„ Ø£Ù†Øª Ø·Ø§Ù„Ø¨ Ø¹Ø±Ø§Ù‚ÙŠ Ø£Ùˆ Ø®Ø±ÙŠØ¬ Ø¬Ø¯ÙŠØ¯ ØªÙ…Ù„Ùƒ ÙÙƒØ±Ø© Ù…Ø¨ØªÙƒØ±Ø© Ù„Ù…Ø´Ø±ÙˆØ¹ ØªÙ‚Ù†ÙŠØŸ Ø­Ø§Ø¶Ù†Ø© ÙØ§ÙŠÙ ÙˆÙ† Ù„Ø§Ø¨Ø³ ØªØ¨Ø¯Ø£ Ø¨Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¯ÙØ¹Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Ù„Ù…Ø¯Ø© Ù£ Ø£Ø´Ù‡Ø±. Ù…Ù†Ø­Ø© Ø­ØªÙ‰ Ù¥,Ù Ù Ù  Ø¯ÙˆÙ„Ø§Ø± Ø¨Ø¯ÙˆÙ† Ø£ÙŠ Ø´Ø±ÙˆØ· Ù…Ù„ÙƒÙŠØ© Ø£Ùˆ Ø£Ø³Ù‡Ù…ØŒ ÙˆØªÙˆØ¬ÙŠÙ‡ ÙˆÙ…Ø³Ø§Ø­Ø© Ø¹Ù…Ù„ Ù…Ù…ØªØ§Ø²Ø©.",
    contentKU: "Ø¦Ø§ÛŒØ§ ØªÛ† Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø± ÛŒØ§Ù† Ø¯Û•Ø±Ú†ÙˆÙˆÛŒ Ù†ÙˆÛŽÛŒ Ø¹ÛŽØ±Ø§Ù‚ÛŒ Ú©Û• Ø®Ø§ÙˆÛ•Ù†ÛŒ Ø¨ÛŒØ±Û†Ú©Û•ÛŒÛ•Ú©ÛŒ Ø¯Ø§Ù‡ÛŽÙ†Û•Ø±Ø§Ù†Û•ÛŒØŸ Ø­Ø§Ø¶Ù†Û•ÛŒ ÙØ§ÙŠÙ ÙˆÛ•Ù† Ù„Ø§Ø¨Ø³ Ø¯Û•Ø³Øª Ø¨Û• ÙˆÛ•Ø±Ú¯Ø±ØªÙ†ÛŒ Ù†ÙˆÛŽ Ø¯Û•Ú©Ø§Øª Ø¨Û• Ù¾ÛŽØ¯Ø§Ù†ÛŒ Ù¥ Ù‡Û†Ø²Ø§Ø± Ø¯Û†Ù„Ø§Ø±ÛŒ Ø¨ÛŽ Ù¾Ø´Ú© Ùˆ Ú•Ø§ÙˆÛŽÚ˜Ú©Ø§Ø±ÛŒ Ø¨Û•Ø¦Û•Ø²Ù…ÙˆÙˆÙ† Ù„Û• Ù‡Û•ÙˆÙ„ÛŽØ± Ùˆ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ Ùˆ Ù…ÙˆÙˆØ³Úµ.",
    author: {
      name: 'Five One Labs Outreach Team',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 hours ago',
    likes: 194,
    commentsCount: 16,
    governorateId: 'all',
    company: 'Five One Labs Incubator',
    companyLogo: 'ðŸš€',
    salary: 'Up to $5,000 Equity-free Seed Funding + Mentorship',
    location: 'Erbil, Mosul & Sulaymaniyah (Hybrid)',
    deadline: 'June 29, 2026',
    opportunityCategory: 'Training',
    workplaceType: 'Hybrid',
    whoCanApply: 'All aspiring innovators and builders in Iraq with early functional prototypes or creative ideas.',
    savedCount: 125,
    universityAppliedCount: 14,
    companyVerified: true,
    tags: ['Startup', 'Incubator', 'Grants', 'IraqEntrepreneurs'],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    commentsList: []
  },

  // 6. CAMPUS LIFE - Study Session Sunset at Mosul University Gardens (Video with Image)
  {
    id: 'campus-image-library',
    type: 'video',
    titleEN: 'Study Session Sunset: Mosul University Central Library ðŸ“šðŸŒ…',
    titleAR: 'Ø¬Ù„Ø³Ø© Ø¯Ø±Ø§Ø³Ø© Ø§Ù„ØºØ±ÙˆØ¨: Ø§Ù„Ù…ÙƒØªØ¨Ø© Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ© Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„ ðŸ“šðŸŒ…',
    titleKU: 'Ú©Ø§ØªÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ Ø¦Ø§ÙˆØ§Ø¨ÙˆÙˆÙ†: Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•ÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ ðŸ“šðŸŒ…',
    contentEN: "Catching up on advanced algorithms study sheets near the historic central library gardens as the golden sun dips behind Mosul architecture. Rebuilt and beautiful than ever!",
    contentAR: "Ù…Ø°Ø§ÙƒØ±Ø© Ø®ÙˆØ§Ø±Ø²Ù…ÙŠØ§Øª Ù…ØªÙ‚Ø¯Ù…Ø© Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù† Ø­Ø¯Ø§Ø¦Ù‚ Ø§Ù„Ù…ÙƒØªØ¨Ø© Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ© Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ© Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„ Ù…Ø¹ ØºØ±ÙˆØ¨ Ø´Ù…Ø³ Ù†ÙŠÙ†ÙˆÙ‰ Ø§Ù„Ø°Ù‡Ø¨ÙŠØ© Ø®Ù„Ù Ù…Ø¢Ø°Ù† ÙˆØ£Ø¨Ù†ÙŠØ© Ù†ÙŠÙ†ÙˆÙ‰ Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ©. ØµØ±Ø­ Ø±Ø§Ø¦Ø¹ Ø¹Ø§Ø¯ Ø£Ù‚ÙˆÙ‰ ÙˆÙ…Ø¬Ù‡Ù‘Ø²!",
    contentKU: "Ù…Û•Ø´Ù‚Ú©Ø±Ø¯Ù†ÛŒ Ø®ÙˆØ§Ø±Ø²Ù…ÛŒØ§ Ù„Û• Ù†Ø²ÛŒÚ© Ø¨Ø§Ø®Ú†Û•Ú©Ø§Ù†ÛŒ Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•ÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ Ú©Ø§ØªÛŽÚ© Ø®Û†Ø±ÛŒ Ø²ÛŽÚ•ÛŒÙ† Ù„Û• Ù¾Ø´Øª ØªÛ•Ù„Ø§Ø±Ø³Ø§Ø²ÛŒ Ù†Ø§ÙˆØ§Ø²Û•Ú©Û•ÙˆÛ• Ø¦Ø§ÙˆØ§ Ø¯Û•Ø¨ÛŽØª.",
    author: {
      name: 'Waleed Al-Mosuli',
      role: 'graduate',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
      university: 'University of Mosul'
    },
    date: 'Yesterday',
    likes: 356,
    commentsCount: 22,
    governorateId: 'nineveh',
    universityId: 'u_mosul',
    videoThumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600',
    tags: ['MosulLibrary', 'Sunset', 'StudyGroups', 'Nineveh'],
    commentsList: []
  },

  // 1. OPP - Frontend Developer Intern (Internship)
  {
    id: 'opp-1',
    type: 'internship',
    titleEN: 'Frontend Developer Intern',
    titleAR: 'ØªØ¯Ø±ÙŠØ¨ Ø¹Ù…Ù„ÙŠ Ù„Ù…Ø·ÙˆØ± ÙˆØ§Ø¬Ù‡Ø§Øª Ø£Ù…Ø§Ù…ÙŠØ©',
    titleKU: 'Ù…Û•Ø´Ù‚ÛŒ Ú¯Û•Ø´Û•Ù¾ÛŽØ¯Û•Ø±ÛŒ ÙØ±Û†Ù†ØªÛŽÙ†Ø¯',
    contentEN: 'Hunar Tech is offering a 3-month hybrid internship for students looking to upscale their skills in React, Tailwind CSS, and TypeScript. You will be building real customer portal widgets and working alongside senior developers.',
    contentAR: 'ØªÙ‚Ø¯Ù… Ø´Ø±ÙƒØ© Hunar Tech ØªØ¯Ø±ÙŠØ¨Ø§Ù‹ Ø¹Ù…Ù„ÙŠØ§Ù‹ Ù‡Ø¬ÙŠÙ†Ø§Ù‹ Ù„Ù…Ø¯Ø© Ù£ Ø£Ø´Ù‡Ø± Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø±Ø§ØºØ¨ÙŠÙ† ÙÙŠ Ø§Ù„Ø§Ø±ØªÙ‚Ø§Ø¡ Ø¨Ù…Ù‡Ø§Ø±Ø§ØªÙ‡Ù… ÙÙŠ Ù…ÙƒØªØ¨Ø§Øª React Ùˆ Tailwind CSS ÙˆÙ„ØºØ© TypeScript. Ø³ØªØ¹Ù…Ù„ Ø¹Ù„Ù‰ ØªØ·ÙˆÙŠØ± Ø¹Ù†Ø§ØµØ± ØªØ­ÙƒÙ… Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù„Ù„Ø¨ÙˆØ§Ø¨Ø§Øª Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© Ø¨Ø±ÙÙ‚Ø© Ù…Ù‡Ù†Ø¯Ø³ÙŠÙ† Ø£Ù‚Ø¯Ù….',
    contentKU: 'Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ÛŒ Hunar Tech Ù…Û•Ø´Ù‚ÛŽÚ©ÛŒ Ù‡Ø§ÛŒØ¨Ø±ÛŒØ¯ Ø¨Û† Ù…Ø§ÙˆÛ•ÛŒ Ù£ Ù…Ø§Ù†Ú¯ Ù¾ÛŽØ´Ú©Û•Ø´ Ø¯Û•Ú©Ø§Øª Ø¨Û† Ø¦Û•Ùˆ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†Û•ÛŒ Ú©Û• Ø¯Û•ÛŒØ§Ù†Û•ÙˆÛŽØª Ú©Ø§Ø±Ø§Ù…Û•ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒØ§Ù† Ù„Û• React Ùˆ Tailwind CSS Ùˆ TypeScript Ø¨Û•Ø±Ø² Ø¨Ú©Û•Ù†Û•ÙˆÛ•. ØªÛ† Ù†ÙˆÛŽØªØ±ÛŒÙ† Ú•ÙˆÙˆÚ©Ø§Ø±Û•Ú©Ø§Ù† Ø¯Ø±ÙˆØ³Øª Ø¯Û•Ú©Û•ÛŒØª.',
    author: {
      name: 'Hunar Tech Dev Hub',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 hour ago',
    likes: 45,
    commentsCount: 3,
    governorateId: 'erbil',
    company: 'Hunar Tech',
    companyLogo: 'ðŸ’»',
    location: 'Erbil (Hybrid)',
    deadline: 'June 30, 2026',
    opportunityCategory: 'Internship',
    workplaceType: 'Hybrid',
    whoCanApply: '3rd & 4th Year Computer Science & SE students',
    savedCount: 42,
    universityAppliedCount: 8,
    companyVerified: true,
    tags: ['Erbil', 'Internships', 'React', 'Tech'],
    commentsList: []
  },

  // 2. OPP - Marketing Internship (Internship)
  {
    id: 'opp-2',
    type: 'internship',
    titleEN: 'Marketing Internship',
    titleAR: 'ØªØ¯Ø±ÙŠØ¨ ØªØ³ÙˆÙŠÙ‚ ÙˆØ¹Ù„Ø§Ù‚Ø§Øª Ø¹Ø§Ù…Ø©',
    titleKU: 'Ù…Û•Ø´Ù‚ÛŒ Ù…Ø§Ø±Ú©ÛŽØªÛŒÙ†Ú¯ Ùˆ Ù¾Û•ÛŒÙˆÛ•Ù†Ø¯ÛŒÛŒÛ•Ú©Ø§Ù†',
    contentEN: 'Join Korek Telecom\'s fast-paced marketing team in Sulaymaniyah. Gain experience in digital campaigning, campus outreach, social media planning, and telecom market research.',
    contentAR: 'Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚ Ø§Ù„ØªØ³ÙˆÙŠÙ‚ Ø§Ù„Ø¯ÙŠÙ†Ø§Ù…ÙŠÙƒÙŠ ÙÙŠ Ø´Ø±ÙƒØ© ÙƒÙˆØ±Ùƒ ØªÙ„ÙŠÙƒÙˆÙ… Ø¨Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ©. Ø§ÙƒØªØ³Ø¨ Ø®Ø¨Ø±Ø© ÙÙŠ Ø§Ù„Ø­Ù…Ù„Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©ØŒ ÙˆØ§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠØŒ ÙˆØ§Ù„ØªØ®Ø·ÙŠØ· Ù„ÙˆØ³Ø§Ø¦Ù„ Ø§Ù„ØªÙˆØ§ØµÙ„ Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠØŒ ÙˆØ£Ø¨Ø­Ø§Ø« Ù‚Ø·Ø§Ø¹ Ø§Ù„Ø§ØªØµØ§Ù„Ø§Øª.',
    contentKU: 'Ø¨Ø¨Û• Ø¨Û•Ø´ÛŽÚ© Ù„Û• ØªÛŒÙ…ÛŒ Ù…Ø§Ø±Ú©ÛŽØªÛŒÙ†Ú¯ÛŒ Ø®ÛŽØ±Ø§ÛŒ Ú©Û†Ú•Û•Ú© ØªÛŒÙ„ÛŒÚ©Û†Ù… Ù„Û• Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ. Ø¦Û•Ø²Ù…ÙˆÙˆÙ† Ù„Û• Ú©Û•Ù…Ù¾ÛŒÙ†ÛŒ Ø¯ÛŒØ¬ÛŒØªØ§ÚµÛŒØŒ Ù¾Û•ÛŒÙˆÛ•Ù†Ø¯ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†ØŒ Ù¾Ù„Ø§Ù†Ø¯Ø§Ù†Ø§Ù†ÛŒ Ø³Û†Ø´ÛŒØ§Úµ Ù…ÛŒØ¯ÛŒØ§ Ùˆ Ú©Û†Ú•Û•Ú© Ø¨Û•Ø¯Û•Ø³ØªØ¨Ù‡ÛŽÙ†Û•.',
    author: {
      name: 'Korek Telecom Careers',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 hours ago',
    likes: 68,
    commentsCount: 5,
    governorateId: 'sulaymaniyah',
    universityId: 'u_sulaymaniyah',
    company: 'Korek Telecom',
    companyLogo: 'ðŸ“¡',
    location: 'Sulaymaniyah (On-site)',
    deadline: 'July 10, 2026',
    opportunityCategory: 'Internship',
    workplaceType: 'On-site',
    whoCanApply: 'Business Administration, Marketing & English majors',
    savedCount: 31,
    universityAppliedCount: 12,
    companyVerified: true,
    tags: ['Sulaymaniyah', 'Marketing', 'Korek', 'Business'],
    commentsList: []
  },

  // 3. OPP - Free Digital Marketing Training (Training)
  {
    id: 'opp-3',
    type: 'training',
    titleEN: 'Free Digital Marketing Training',
    titleAR: 'ØªØ¯Ø±ÙŠØ¨ Ù…Ø¬Ø§Ù†ÙŠ ÙÙŠ Ø§Ù„ØªØ³ÙˆÙŠÙ‚ Ø§Ù„Ø±Ù‚Ù…ÙŠ ÙˆØ¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª',
    titleKU: 'Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†ÛŒ Ø®Û†Ú•Ø§ÛŒÛŒ Ù„Û• Ù…Ø§Ø±Ú©ÛŽØªÛŒÙ†Ú¯ÛŒ Ø¯ÛŒØ¬ÛŒØªØ§ÚµÛŒ',
    contentEN: 'An intensive 4-week online masterclass designed by Digital Skills Iraq covering SEO, Google Ads, Meta Ads Manager, and modern growth hacking techniques. Sessions are fully recorded with downloadable certs.',
    contentAR: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨ÙŠ Ù…ÙƒØ«Ù Ù„Ù…Ø¯Ø© Ù¤ Ø£Ø³Ø§Ø¨ÙŠØ¹ Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª Ù…ØµÙ…Ù… Ù…Ù† Ù‚Ø¨Ù„ "Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚" ÙŠØºØ·ÙŠ ØªØ­Ø³ÙŠÙ† Ù…Ø­Ø±ÙƒØ§Øª Ø§Ù„Ø¨Ø­Ø« ÙˆØ³ÙŠÙˆ ÙˆØ¥Ø¹Ù„Ø§Ù†Ø§Øª ØºÙˆØºÙ„ ÙˆØ¥Ø¹Ù„Ø§Ù†Ø§Øª Ù…ÙŠØªØ§ ÙˆØ£Ø³Ø§Ù„ÙŠØ¨ Ø§Ù„Ù†Ù…Ùˆ Ø§Ù„Ø­Ø¯ÙŠØ«Ø©. Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ù…Ø³Ø¬Ù„Ø© ÙˆÙ…ÙˆØ«Ù‚Ø© Ø¨Ø´Ù‡Ø§Ø¯Ø§Øª Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªØ­Ù…ÙŠÙ„.',
    contentKU: 'Ú©Û†Ø±Ø³ÛŽÚ©ÛŒ ÙÛŽØ±Ø¨ÙˆÙˆÙ†ÛŒ Ú†Ú•ÛŒ Ù¤ Ù‡Û•ÙØªÛ•ÛŒÛŒ Ù„Û•Ø³Û•Ø± Ù‡ÛŽÚµ Ú©Û• Ù„Û•Ù„Ø§ÛŒÛ•Ù† Ú©Ø§Ø±Ø§Ù…Û•ÛŒÛŒ Ø¯ÛŒØ¬ÛŒØªØ§ÚµÛŒ Ø¹ÛŽØ±Ø§Ù‚ÛŒÛŒÛ•ÙˆÛ• Ø¯Ø§Ø¨ÛŒÙ†Ú©Ø±Ø§ÙˆÛ• Ùˆ Ø¨Û•Ø±Ù†Ø§Ù…Û•Ú©Ø§Ù†ÛŒ Ú¯Û†Ú¯Úµ Ùˆ Ø³Û†Ø´ÛŒØ§Ù„ Ù…ÛŒØ¯ÛŒØ§ Ùˆ Ú•ÛŽÚ¯Ø§Ú©Ø§Ù†ÛŒ Ú¯Û•Ø´Û•Ú©Ø±Ø¯Ù† Ø¯Û•Ú¯Ø±ÛŽØªÛ•ÙˆÛ•. Ø¨Ú•ÙˆØ§Ù†Ø§Ù…Û•ÛŒ Ù„Û•Ú¯Û•ÚµØ¯Ø§ÛŒÛ•.',
    author: {
      name: 'Digital Skills Iraq',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 hours ago',
    likes: 189,
    commentsCount: 22,
    governorateId: 'baghdad',
    company: 'Digital Skills Iraq',
    companyLogo: 'ðŸš€',
    location: 'All Iraq (Remote)',
    deadline: 'June 25, 2026',
    opportunityCategory: 'Training',
    workplaceType: 'Remote',
    whoCanApply: 'All Iraqi undergraduates and fresh graduates wanting digital mastery',
    savedCount: 156,
    universityAppliedCount: 45,
    companyVerified: true,
    tags: ['Training', 'DigitalMarketing', 'Remote', 'Iraq'],
    commentsList: []
  },

  // 4. OPP - Graduation Project Mini Grant (Graduation project support)
  {
    id: 'opp-4',
    type: 'graduation_project_support',
    titleEN: 'Graduation Project Mini Grant',
    titleAR: 'Ù…Ù†Ø­Ø© Ù…ØµØºØ±Ø© Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„ØªØ®Ø±Ø¬ Ø§Ù„Ù…Ø¨ØªÙƒØ±Ø©',
    titleKU: 'Ù…ÛŒÙ†ÛŒ Ú¯Ø±Ø§Ù†Øª Ø¨Û† Ù¾Ú•Û†Ú˜Û•ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†ÛŒ Ø¯Ø§Ù‡ÛŽÙ†Û•Ø±Ø§Ù†Û•',
    contentEN: 'Education Bridge Program is funding 15 student graduation prototypes with mini-grants of up to $1,500 each. Focus areas include civic technology, energy efficiency, waste recycling, and health-tech.',
    contentAR: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ Ø¬Ø³ÙˆØ± Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙŠÙ…ÙˆÙ„ Ù¡Ù¥ Ù†Ù…ÙˆØ°Ø¬Ø§Ù‹ Ø£ÙˆÙ„ÙŠØ§Ù‹ Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ ØªØ®Ø±Ø¬ Ø·Ù„Ø§Ø¨ÙŠØ© Ø¨Ù…Ù†Ø­ Ù…ØµØºØ±Ø© ØªØµÙ„ Ø¥Ù„Ù‰ Ù¡Ù¥Ù Ù  Ø¯ÙˆÙ„Ø§Ø± Ù„ÙƒÙ„ Ù…Ø´Ø±ÙˆØ¹. ØªØ´Ù…Ù„ Ù…Ø¬Ø§Ù„Ø§Øª Ø§Ù„ØªØ±ÙƒÙŠØ² Ø§Ù„Ø­Ù„ÙˆÙ„ Ø§Ù„ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ù…Ø¯Ù†ÙŠØ© ÙˆÙƒÙØ§Ø¡Ø© Ø§Ù„Ø·Ø§Ù‚Ø© ÙˆØ¥Ø¹Ø§Ø¯Ø© ØªØ¯ÙˆØ± Ø§Ù„Ù†ÙØ§ÙŠØ§Øª ÙˆØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„ØµØ­Ø©.',
    contentKU: 'Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Ù¾Ø±Ø¯ÛŒ Ù¾Û•Ø±ÙˆÛ•Ø±Ø¯Û•ÛŒÛŒ Ù¾Ø§ÚµÙ¾Ø´ØªÛŒ Ø¯Ø§Ø±Ø§ÛŒÛŒ Ù¾ÛŽØ´Ú©Û•Ø´ Ø¨Û• Ù¡Ù¥ Ù¾Ø±Û†Ú˜Û•ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† Ø¯Û•Ú©Ø§Øª Ø¨Û• Ø¨Ú•ÛŒ Ù¡,Ù¥Ù Ù  Ø¯Û†Ù„Ø§Ø± Ø¨Û† Ù‡Û•Ø± Ù¾Ú•Û†Ú˜Û•ÛŒÛ•Ú©. Ø²ÛŒØ§ØªØ± Ø¨Û† Ø¨ÙˆØ§Ø±ÛŒ ØªÛ•Ù†Ø¯Ø±ÙˆØ³ØªÛŒ Ùˆ ÙˆØ²Û•ÛŒ Ù¾Ø§Ú©Û•.',
    author: {
      name: 'Education Bridge Program',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 day ago',
    likes: 124,
    commentsCount: 14,
    governorateId: 'baghdad',
    company: 'Education Bridge',
    companyLogo: 'ðŸŒ‰',
    location: 'All Iraq (Remote Support)',
    deadline: 'August 1, 2026',
    opportunityCategory: 'Graduation project support',
    workplaceType: 'Remote',
    whoCanApply: 'Seniors with innovative software or engineering prototype designs',
    savedCount: 89,
    universityAppliedCount: 22,
    companyVerified: true,
    tags: ['GraduationSupport', 'Grants', 'Seniors', 'Engineering'],
    commentsList: []
  },

  // 5. OPP - Volunteer Media Team (Volunteering)
  {
    id: 'opp-5',
    type: 'volunteering',
    titleEN: 'Volunteer Media Team',
    titleAR: 'ÙØ±ÙŠÙ‚ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù… Ø§Ù„ØªØ·ÙˆØ¹ÙŠ Ù„Ù…Ù‡Ø±Ø¬Ø§Ù† Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ© Ù„Ù„Ù…Ø§Ù„ ÙˆØ§Ù„Ø£Ø¹Ù…Ø§Ù„',
    titleKU: 'ØªÛŒÙ…ÛŒ Ù…Ø§Ø¯ÛŒØ§ÛŒ Ø®Û†Ø¨Û•Ø®Ø´ Ø¨Û† ÙÛŽØ³ØªÛŒÚ¤Ø§ÚµÛŒ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ',
    contentEN: 'Komar University Event division is recruiting a media squad of volunteer photographers, videographers, copywriters, and coordinator hosts to help manage our upcoming regional tech-fest campus gather.',
    contentAR: 'ÙŠÙ‚ÙˆÙ… Ù‚Ø³Ù… Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª ÙÙŠ Ø¬Ø§Ù…Ø¹Ø© ÙƒÙˆÙ…Ø§Ø± Ø¨ØªØ¹ÙŠÙŠÙ† ÙØ±ÙŠÙ‚ Ø¥Ø¹Ù„Ø§Ù…ÙŠ Ù…Ù† Ù…ØµÙˆØ±ÙŠÙ† ÙˆÙ…Ø¹Ø¯ÙŠ ÙÙŠØ¯ÙŠÙˆÙ‡Ø§Øª ÙˆÙ…Ù†Ø³Ù‚ÙŠÙ† Ù…ØªØ·ÙˆØ¹ÙŠÙ† Ù„Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© ÙÙŠ Ø¥Ø¯Ø§Ø±Ø© Ù…Ù†ØªØ¯Ù‰ Ø§Ù„ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ø¥Ù‚Ù„ÙŠÙ…ÙŠ Ø§Ù„Ù…Ù‚Ø¨Ù„ Ø¨Ø§Ù„Ø­Ø±Ù… Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ.',
    contentKU: 'Ø¨Û•Ø´ÛŒ Ú©Û†Ø¨ÙˆÙˆÙ†Û•ÙˆÛ•Ú©Ø§Ù†ÛŒ Ú©Ø§Ú©Úµ Ø²Ø§Ù†Ú©Û†ÛŒ Ú©Û†Ù…Ø§Ø± Ø¨Û•Ø¯ÙˆØ§ÛŒ ØªÛŒÙ…ÛŒ Ø®Û†Ø¨Û•Ø®Ø´ÛŒ Ù…ÛŒØ¯ÛŒØ§ÛŒØ¯Ø§ Ø¯Û•Ú¯Û•Ú•ÛŽØª ÙˆÛ•Ú© ÙˆÛŽÙ†Û•Ú¯Ø± Ùˆ Ú¤ÛŒØ¯ÛŒÛ†Ú¯Ø±Ø§ÙÛ•Ø± Ø¨Û† ÛŒØ§Ø±Ù…Û•ØªÛŒØ¯Ø§Ù†ÛŒ Ø¨Û•Ú•ÛŽÙˆÛ•Ú†ÙˆÙˆÙ†ÛŒ ØªÛ•Ú© ÙÛŽØ³ØªÛŒÚ¤Ø§ÚµÛŒ Ø¯Ø§Ù‡Ø§ØªÙˆÙˆÙ…Ø§Ù†.',
    author: {
      name: 'Komar Tech Festival Team',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=150',
      verified: false
    },
    date: '2 days ago',
    likes: 38,
    commentsCount: 9,
    governorateId: 'sulaymaniyah',
    company: 'Komar University Event',
    companyLogo: 'ðŸ“¸',
    location: 'Sulaymaniyah (On-site)',
    deadline: 'June 20, 2026',
    opportunityCategory: 'Volunteering',
    workplaceType: 'On-site',
    whoCanApply: 'Creative students interested in photography, reels recording, writing, and hosting',
    savedCount: 14,
    universityAppliedCount: 5,
    companyVerified: false,
    tags: ['Volunteering', 'KomarUni', 'Media', 'Sulaimani'],
    commentsList: []
  },

  // 6. OPP - Research Assistant Collaboration (Graduation project support)
  {
    id: 'opp-6',
    type: 'graduation_project_support',
    titleEN: 'Research Assistant Collaboration',
    titleAR: 'Ù…Ø³Ø§Ø¹Ø¯ Ø¨Ø­Ø« Ø¹Ù„Ù…ÙŠ Ù…Ø´Ø§Ø±Ùƒ ÙÙŠ Ø§Ù„Ù…Ø®ØªØ¨Ø± Ø§Ù„Ø¨ÙŠØ¦ÙŠ',
    titleKU: 'ÛŒØ§Ø±ÛŒØ¯Û•Ø¯Û•Ø±ÛŒ ØªÙˆÛŽÚ˜ÛŒÙ†Û•ÙˆÛ•ÛŒ Ø²Ø§Ù†Ø³ØªÛŒ Ù„Û• ØªØ§Ù‚ÛŒÚ¯Ø§ÛŒ Ú˜ÛŒÙ†Ú¯Û•ÛŒÛŒ',
    contentEN: 'The Biology and Engineering department of the University of Mosul is recruiting 3 senior chemistry or chemical engineer assistants to collaborate on water quality filtration research in Nimrud district.',
    contentAR: 'ÙŠØ¹Ù„Ù† Ù‚Ø³Ù… Ø§Ù„Ø£Ø­ÙŠØ§Ø¡ ÙˆØ§Ù„Ù‡Ù†Ø¯Ø³Ø© ÙÙŠ Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„ Ø¹Ù† ÙØ±ØµØ© Ù„Ù€ Ù£ Ø·Ù„Ø§Ø¨ Ø¨Ø§Ø­Ø«ÙŠÙ† ÙÙŠ Ø§Ù„ÙƒÙŠÙ…ÙŠØ§Ø¡ Ø£Ùˆ Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„ÙƒÙŠÙ…ÙŠØ§Ø¦ÙŠØ© Ù„Ù„Ù…Ø´Ø§Ø±ÙƒØ© ÙˆØ§Ù„ØªØ¹Ø§ÙˆÙ† ÙÙŠ Ø£Ø¨Ø­Ø§Ø« ØªØµÙÙŠØ© ÙˆÙØ­Øµ Ø¬ÙˆØ¯Ø© Ø§Ù„Ù…ÙŠØ§Ù‡ ÙÙŠ Ù‚Ø¶Ø§Ø¡ Ù†Ù…Ø±ÙˆØ¯.',
    contentKU: 'Ø¨Û•Ø´ÛŒ Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ Ùˆ Ø¨Ø§ÛŒÛ†Ù„Û†Ø¬ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ Ø¯Ø§ÙˆØ§ÛŒ Ù¾Ø§ÚµÙ¾Ø´ØªÛŒ Ù„ÛŽÚ©Û†ÚµÛŒÙ†Û•ÙˆÛ• Ø¯Û•Ú©Ø§Øª Ø¨Û† Ù£ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±ÛŒ Ú©ÛŒÙ…ÛŒØ§ ÛŒØ§Ù† Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ Ú©ÛŒÙ…ÛŒØ§ÛŒÛŒ Ø¨Û† Ù‡Ø§ÙˆÚ©Ø§Ø±ÛŒÚ©Ø±Ø¯Ù† Ù„Û• ØªÙˆÛŽÚ˜ÛŒÙ†Û•ÙˆÛ•ÛŒ Ø¦Ø§ÙˆÛŒ Ù†Ø§ÙˆÚ†Û•ÛŒ Ù†Û•Ù…Ø±ÙˆØ¯.',
    author: {
      name: 'UoM Environmental Research Lab',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '2 days ago',
    likes: 54,
    commentsCount: 4,
    governorateId: 'nineveh',
    universityId: 'u_mosul',
    company: 'University of Mosul',
    companyLogo: 'ðŸ”¬',
    location: 'Mosul (On-site)',
    deadline: 'June 24, 2026',
    opportunityCategory: 'Graduation project support',
    workplaceType: 'On-site',
    whoCanApply: 'Mosul chemistry, biology, or environmental engineering seniors',
    savedCount: 27,
    universityAppliedCount: 9,
    companyVerified: true,
    tags: ['Research', 'Mosul', 'WaterAudit', 'Seniors'],
    commentsList: []
  },

  // 7. OPP - Student IT Helpdesk (Part-time job)
  {
    id: 'opp-7',
    type: 'part_time_job',
    titleEN: 'Student IT Helpdesk Specialist',
    titleAR: 'Ø£Ø®ØµØ§Ø¦ÙŠ Ø¯Ø¹Ù… ÙÙ†ÙŠ Ù„Ù„Ø·Ù„Ø¨Ø© (Ø¯ÙˆØ§Ù… Ø¬Ø²Ø¦ÙŠ)',
    titleKU: 'Ù¾Ø³Ù¾Û†Ú•ÛŒ Ø¨Û•Ø´ÛŒ ÛŒØ§Ø±Ù…Û•ØªÛŒ Ù¾Ø´ØªÛŒÙˆØ§Ù†ÛŒ IT Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† (Ø¯Û•ÙˆØ§Ù…ÛŒ Ú©Ø§ØªÛŒ)',
    contentEN: 'Zain Student Lounge in Baghdad has 2 open slots for tech-savvy undergraduates to assist students with network setups, portal login, device diagnostics and software issues on campus.',
    contentAR: 'ÙŠØ¹Ù„Ù† ØµØ§Ù„ÙˆÙ† Ø²ÙŠÙ† Ù„Ù„Ø·Ù„Ø¨Ø© ÙÙŠ Ø¨ØºØ¯Ø§Ø¯ Ø¹Ù† ØªÙˆÙØ± ÙˆØ¸ÙŠÙØªÙŠÙ† Ø´Ø§ØºØ±ØªÙŠÙ† Ù„Ù…Ø³Ø§Ø¹Ø¯Ø© Ø§Ù„Ø·Ù„Ø§Ø¨ ÙÙŠ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ø¨ÙƒØ©ØŒ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ù„Ù…ÙˆÙ‚Ø¹ØŒ ØªØ´Ø®ÙŠØµ Ù…Ø´ÙƒÙ„Ø§Øª Ø§Ù„Ø£Ø¬Ù‡Ø²Ø© ÙˆÙ†Ø¸Ù… Ø§Ù„ØªØ´ØºÙŠÙ„.',
    contentKU: 'Ù‡Û†ÚµÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø²ÛŒÙ† Ù„Û• Ø¨Û•ØºØ¯Ø§Ø¯ Ø¯ÙˆÙˆ Ù‡Û•Ù„ÛŒ Ø¯Û•ÙˆØ§Ù…ÛŒ Ú©Ø§ØªÛŒ Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø¦Ø§Ø±Û•Ø²ÙˆÙˆÙ…Û•Ù†ÛŒ Ú©Û†Ù…Ù¾ÛŒÙˆØªÛ•Ø± Ù‡Û•ÛŒÛ• Ø¨Û† Ù‡Ø§ÙˆÚ©Ø§Ø±ÛŒÚ©Ø±Ø¯Ù†ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† Ù„Û• Ú•ÛŽÚ©Ø®Ø³ØªÙ†ÛŒ Ø¦ÛŒÙ†ØªÛ•Ø±Ù†ÛŽØª Ùˆ Ú©ÛŽØ´Û•ÛŒ Ø¦Ø§Ù…ÛŽØ±Û•Ú©Ø§Ù†.',
    author: {
      name: 'Zain Iraq HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 days ago',
    likes: 92,
    commentsCount: 11,
    governorateId: 'baghdad',
    company: 'Zain Iraq',
    companyLogo: 'ðŸ“±',
    location: 'Baghdad (Zain Lounge)',
    deadline: 'June 28, 2026',
    opportunityCategory: 'Part-time job',
    workplaceType: 'On-site',
    whoCanApply: 'Students fluent in English & Arabic with core technology networking concepts',
    savedCount: 54,
    universityAppliedCount: 15,
    companyVerified: true,
    tags: ['PartTimeJobs', 'ZainLounge', 'TechSupport', 'Baghdad'],
    commentsList: []
  },

  // 8. OPP - National Cybersecurity CTF (Competition)
  {
    id: 'opp-8',
    type: 'competition',
    titleEN: 'National Cybersecurity Capture The Flag (CTF)',
    titleAR: 'Ø§Ù„Ù…Ø³Ø§Ø¨Ù‚Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ù„Ø§Ù„ØªÙ‚Ø§Ø· Ø§Ù„Ø¹Ù„Ù… ÙÙŠ Ø§Ù„Ø£Ù…Ù† Ø§Ù„Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠ',
    titleKU: 'Ú©ÛŽØ¨Ú•Ú©ÛŽÛŒ Ù†ÛŒØ´ØªÙ…Ø§Ù†ÛŒ Ù‡Ø§Ú©Ú©Ø±Ø¯Ù† Ùˆ Ù¾Ø§Ø±Ø§Ø³ØªÙ†ÛŒ Ø²Ø§Ù†ÛŒØ§Ø±ÛŒÛŒÛ•Ú©Ø§Ù† (CTF)',
    contentEN: 'Test your hacking skills against the ultimate national challenge! A 24-hour virtual cybersecurity CTF contest open for all university teams in Iraq. Cash prizes of up to 4,000,000 IQD for top 3 teams.',
    contentAR: 'Ø§Ø®ØªØ¨Ø± Ù…Ù‡Ø§Ø±Ø§ØªÙƒ ÙÙŠ ÙØ­Øµ ÙˆØ§ÙƒØªØ´Ø§Ù Ø§Ù„Ø«ØºØ±Ø§Øª ÙÙŠ Ø§Ù„ØªØ­Ø¯ÙŠ Ø§Ù„ÙˆØ·Ù†ÙŠ Ø§Ù„Ø£ÙƒØ¨Ø±! Ù…Ø³Ø§Ø¨Ù‚Ø© Ø³ÙŠØ¨Ø±Ø§Ù†ÙŠØ© Ù…Ø³ØªÙ…Ø±Ø© Ù„Ù€ Ù¢Ù¤ Ø³Ø§Ø¹Ø© Ù…ÙØªÙˆØ­Ø© Ù„ÙƒØ§ÙØ© ÙØ±Ù‚ Ø§Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ†. Ø¬ÙˆØ§Ø¦Ø² Ù…Ø§Ù„ÙŠØ© ØªØ¨Ù„Øº Ù¤,Ù Ù Ù ,Ù Ù Ù  Ø¯ÙŠÙ†Ø§Ø± Ø¹Ø±Ø§Ù‚ÙŠ Ù„Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø£ÙˆÙ„Ù‰.',
    contentKU: 'Ú©Ø§Ø±Ø§Ù…Û•ÛŒÛŒ Ù‡Ø§Ú©Ú©Ø±Ø¯Ù†ÛŒ Ø®Û†Øª ØªØ§Ù‚ÛŒ Ø¨Ú©Û•Ø±Û•ÙˆÛ• Ù„Û• Ú¯Û•ÙˆØ±Û•ØªØ±ÛŒÙ† Ù¾ÛŽØ´Ø¨Ú•Ú©ÛŽÛŒ Ø³ÛŒØ¨Ø±Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚! Ú©ÛŽØ¨Ú•Ú©ÛŽÛŒ Ù¢Ù¤ Ú©Ø§ØªÚ˜Ù…ÛŽØ±ÛŒ Ø¦Û†Ù†ÚµØ§ÛŒÙ† Ø¨Û† Ù‡Û•Ù…ÙˆÙˆ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù† Ú©Û• Ø®Û•ÚµØ§ØªÛŒ Ù¤ Ù…Ù„ÛŒÛ†Ù† Ø¯ÛŒÙ†Ø§Ø± Ù„Û•Ø®Û† Ø¯Û•Ú¯Ø±ÛŽØª.',
    author: {
      name: 'Iraq Cyber Security Association',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '4 days ago',
    likes: 215,
    commentsCount: 38,
    governorateId: 'all',
    company: 'Iraq Cyber Security Assoc',
    companyLogo: 'ðŸ›¡ï¸',
    location: 'Online (National)',
    deadline: 'July 5, 2026',
    opportunityCategory: 'Competition',
    workplaceType: 'Remote',
    whoCanApply: 'All enrolled undergraduate students in Iraq (Individual or Team of up to 4)',
    savedCount: 94,
    universityAppliedCount: 18,
    companyVerified: true,
    tags: ['Competition', 'Cybersecurity', 'Iraq', 'Hacking'],
    commentsList: []
  },

  // 9. OPP - Associate Business Analyst (Full-time graduate job)
  {
    id: 'opp-9',
    type: 'full_time_job',
    titleEN: 'Associate Business Analyst',
    titleAR: 'Ù…Ø­Ù„Ù„ Ø£Ø¹Ù…Ø§Ù„ Ù…Ø³Ø§Ø¹Ø¯ Ù„Ù„Ù…Ø¨ÙŠØ¹Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ©',
    titleKU: 'ÛŒØ§Ø±ÛŒØ¯Û•Ø¯Û•Ø±ÛŒ Ù„ÛŽÚ©Û†ÚµÛ•Ø±ÛŒ Ø¨Ø§Ø²Ø±Ú¯Ø§Ù†ÛŒ Ø¯ÛŒØ¬ÛŒØªØ§ÚµÛŒ',
    contentEN: 'Asiacell is looking for entry-level Associate Business Analysts to join our digital pricing and research department in Sulaymaniyah or Baghdad. Excellent statistical, Excel, and modeling skills required.',
    contentAR: 'ØªØ¨Ø­Ø« Ø´Ø±ÙƒØ© Ø¢Ø³ÙŠØ§ Ø³ÙŠÙ„ Ø¹Ù† Ù…Ø­Ù„Ù„ÙŠ Ø£Ø¹Ù…Ø§Ù„ Ø¨Ù…Ø³ØªÙˆÙ‰ Ù…Ø¨ØªØ¯Ø¦ Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø¥Ù„Ù‰ Ù‚Ø·Ø§Ø¹ ØªØ³Ø¹ÙŠØ± Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© ÙˆØ£Ø¨Ø­Ø§Ø« Ø§Ù„Ø³ÙˆÙ‚ ÙÙŠ Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ© Ø£Ùˆ Ø¨ØºØ¯Ø§Ø¯. ØªØªØ·Ù„Ø¨ Ø§Ù„ÙˆØ¸ÙŠÙØ© Ù…Ù‡Ø§Ø±Ø§Øª Ø¥Ø­ØµØ§Ø¦ÙŠØ© Ù…Ù…ØªØ§Ø²Ø© ÙˆØ¥ØªÙ‚Ø§Ù† Ø§Ù„Ø¥ÙƒØ³Ù„ ÙˆÙ†Ù…Ø°Ø¬Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª.',
    contentKU: 'Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ÛŒ Ø¦Ø§Ø³ÛŒØ§Ø³ÛŽÙ„ Ø¯Û•ÛŒÛ•ÙˆÛŽØª Ø¨Ø§Ø´ØªØ±ÛŒÙ† ÛŒØ§Ø±ÛŒØ¯Û•Ø¯Û•Ø±ÛŒ Ø¯Û†Ø²Û•Ø±Û•ÙˆÛ•ÛŒ Ù„ÛŽÚ©Ø¯Ø§Ù†Û•ÙˆÛ•ÛŒ Ø¯Ø§ØªØ§ Ø¯Ø§Ø¨Ù…Û•Ø²Ø±ÛŽÙ†ÛŽØª Ø¨Û† Ø¨Û•Ø´ÛŒ Ù†Ø±Ø®Ø§Ù†Ø¯Ù† Ùˆ Ø¦Û†Ù¾Û•Ø±Ø§Ø³ÛŒÛ†Ù†Û•Ú©Ø§Ù†ÛŒ Ù…Û†Ø¯ÛŽÙ„ Ù„Û• Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ ÛŒØ§Ù† Ø¨Û•ØºØ¯Ø§Ø¯. Ù¾ÛŽÙˆÛŒØ³ØªÛ• Ù„Û• Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Excel Ø¨Ø§Ø´ Ø¨Ù†.',
    author: {
      name: 'Asiacell HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 days ago',
    likes: 145,
    commentsCount: 16,
    governorateId: 'sulaymaniyah',
    company: 'Asiacell',
    companyLogo: 'ðŸ”´',
    location: 'Sulaymaniyah / Baghdad',
    deadline: 'July 8, 2026',
    opportunityCategory: 'Full-time graduate job',
    workplaceType: 'On-site',
    whoCanApply: 'Recent graduates (2024-2026) of Computer Science, Statistics, Mathematics or Business Analytics',
    savedCount: 76,
    universityAppliedCount: 11,
    companyVerified: true,
    tags: ['FullTimeJobs', 'Asiacell', 'BusinessAnalyst', 'FreshGrads'],
    commentsList: []
  },

  // 10. ANNOUNCEMENT (Official)
  {
    id: 'official-1',
    type: 'announcement',
    titleEN: 'Final Exams Timetable for Semester 2 Released',
    titleAR: 'Ù†Ø´Ø± Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ© Ù„Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ Ø§Ù„Ø«Ø§Ù†ÙŠ',
    titleKU: 'Ø®Ø´ØªÛ•ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ• Ú©Û†ØªØ§ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ ÙˆÛ•Ø±Ø²ÛŒ Ø¯ÙˆÙˆÛ•Ù… Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÛŒÛ•ÙˆÛ•',
    contentEN: 'The Presidency of the University has officially released the exam schedules. Exams will commence on Sunday, June 18, 2026. Please ensure all student clearance cards (Absence warnings in particular) are resolved by next week.',
    contentAR: 'Ø£Ø¹Ù„Ù†Øª Ø±Ø¦Ø§Ø³Ø© Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø±Ø³Ù…ÙŠØ§Ù‹ Ø¹Ù† Ø¬Ø¯Ø§ÙˆÙ„ Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª. Ø³ØªØ¨Ø¯Ø£ Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª ÙŠÙˆÙ… Ø§Ù„Ø£Ø­Ø¯ Ù¡Ù¨ Ø­Ø²ÙŠØ±Ø§Ù† Ù¢Ù Ù¢Ù¦. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ØªØ³ÙˆÙŠØ© ÙƒØ§ÙØ© Ø¨Ø·Ø§Ù‚Ø§Øª Ø¨Ø±Ø§Ø¡Ø© Ø§Ù„Ø°Ù…Ø© (Ø®Ø§ØµØ© Ø¥Ù†Ø°Ø§Ø±Ø§Øª Ø§Ù„ØºÙŠØ§Ø¨Ø§Øª) Ù‚Ø¨Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ù…Ù‚Ø¨Ù„.',
    contentKU: 'Ø³Û•Ø±Û†Ú©Ø§ÛŒÛ•ØªÛŒ Ø²Ø§Ù†Ú©Û† Ø¨Û• ÙÛ•Ø±Ù…ÛŒ Ø®Ø´ØªÛ•ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù†ÛŒ Ø¨ÚµØ§ÙˆÚ©Ø±Ø¯Û•ÙˆÛ•. ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù† Ú•Û†Ú˜ÛŒ ÛŒÛ•Ú©Ø´Û•Ù…Ù…Û• Ù¡Ù¨ÛŒ Ø­ÙˆØ²Û•ÛŒØ±Ø§Ù†ÛŒ Ù¢Ù Ù¢Ù¦ Ø¯Û•Ø³ØªÙ¾ÛŽØ¯Û•Ú©Û•Ù†. ØªÚ©Ø§ÛŒÛ• Ø¯ÚµÙ†ÛŒØ§Ø¨Ù† Ù„Û• Ú†Ø§Ø±Û•Ø³Û•Ø±Ú©Ø±Ø¯Ù†ÛŒ Ø³Û•Ø±Ø¬Û•Ù… Ú©Ø§Ø±ØªÛŒ Ù¾Ø§Ú©Ø§Ù†Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† ØªØ§ Ù‡Û•ÙØªÛ•ÛŒ Ø¯Ø§Ù‡Ø§ØªÙˆÙˆ.',
    author: {
      name: 'UoB Registrar Office Office',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '3 hours ago',
    likes: 84,
    commentsCount: 15,
    universityId: 'u_baghdad',
    governorateId: 'baghdad',
    tags: ['Exams', 'Official', 'Admissions'],
    commentsList: [
      {
        id: 'c-1',
        authorName: 'Ahmad Al-Mansour',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
        content: 'Is there any chance they get postponed to June 25? We still have three chapters left in Networks!',
        date: '2 hours ago'
      },
      {
        id: 'c-2',
        authorName: 'Dr. Layla Kareem',
        authorRole: 'teacher',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
        content: 'No postponement is planned. Ahmad, we will cover the last network chapter this Tuesday. Be prepared!',
        date: '1 hour ago'
      }
    ]
  },
  
  // 2. VIDEO
  {
    id: 'video-1',
    type: 'video',
    titleEN: 'Vibe Check: Golden Hour at Sulaymaniyah Campus ðŸŒ…',
    titleAR: 'Ø£Ø¬ÙˆØ§Ø¡ Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø°Ù‡Ø¨ÙŠØ© ÙÙŠ Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ ðŸŒ…',
    titleKU: 'Ø¯ÛŒÙ…Û•Ù†ÛŒ Ø³Û•Ø±Ø³ÙˆÚ•Ù‡ÛŽÙ†Û•Ø±ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ Ù„Û• Ú©Ø§ØªÛŒ Ø®Û†Ø¦Ø§ÙˆØ§Ø¨ÙˆÙˆÙ†Ø¯Ø§ ðŸŒ…',
    contentEN: 'Just another beautiful afternoon sitting near the campus lake with friends, complaining about control system assignments!',
    contentAR: 'Ø¨Ø¹Ø¯ Ø¸Ù‡Ø± ÙŠÙˆÙ… Ø¬Ù…ÙŠÙ„ Ø¢Ø®Ø± Ø¨Ø§Ù„Ù‚Ø±Ø¨ Ù…Ù† Ø¨Ø­ÙŠØ±Ø© Ø§Ù„Ø­Ø±Ù… Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ù…Ø¹ Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡ØŒ Ù†Ø´ÙƒÙˆ Ù…Ù† ÙˆØ§Ø¬Ø¨Ø§Øª Ù…Ø§Ø¯Ø© Ø£Ù†Ø¸Ù…Ø© Ø§Ù„ØªØ­ÙƒÙ…!',
    contentKU: 'Ø¦ÛŽÙˆØ§Ø±Û•ÛŒÛ•Ú©ÛŒ ØªØ±ÛŒ Ø¯ÚµÚ•ÙÛŽÙ† Ù„Û• Ù†Ø²ÛŒÚ© Ø¯Û•Ø±ÛŒØ§Ú†Û•ÛŒ Ø²Ø§Ù†Ú©Û† Ù„Û•Ú¯Û•Úµ Ù‡Ø§ÙˆÚ•ÛŽÛŒØ§Ù†ØŒ Ú¯Ø§Ø²Ù†Ø¯Û• Ø¯Û•Ú©Û•ÛŒÙ† Ù„Û• Ø¦Û•Ø±Ú©ÛŒ ÙˆØ§Ù†Û•ÛŒ Ú©Û†Ù†ØªØ±Û†Úµ!',
    author: {
      name: 'Danyar Hawrami',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
      university: 'University of Sulaymaniyah'
    },
    date: '4 hours ago',
    likes: 312,
    commentsCount: 22,
    universityId: 'u_sulaymaniyah',
    governorateId: 'sulaymaniyah',
    videoThumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600',
    tags: ['CampusLife', 'Sulaimani', 'Sunset'],
    commentsList: [
      {
        id: 'cv-1',
        authorName: 'Soran Sherko',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
        content: 'Campus looks amazing! Which phone did you use to film this?',
        date: '3 hours ago'
      }
    ]
  },

  // 3. JOB (Future)
  {
    id: 'job-1',
    type: 'job',
    titleEN: 'Junior Software Engineer (Full-Time)',
    titleAR: 'Ù…Ù‡Ù†Ø¯Ø³ Ø¨Ø±Ù…Ø¬ÙŠØ§Øª Ù…Ø¨ØªØ¯Ø¦ (Ø¯ÙˆØ§Ù… ÙƒØ§Ù…Ù„)',
    titleKU: 'Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ Ù†Û•Ø±Ù…Û•Ú©Ø§ÚµØ§ÛŒ Ø¬Û†Ù†ÛŒÛ†Ø± (Ø¯Û•ÙˆØ§Ù…ÛŒ ØªÛ•ÙˆØ§Ùˆ)',
    contentEN: 'Zain Iraq is looking for a junior full-stake software developer to join our core digital tools division in Baghdad. Proficiency in React, JavaScript, or Flutter is preferred. Fresh graduates from Computer Engineering, Science, or IT programs are highly encouraged to apply!',
    contentAR: 'ØªØ¨Ø­Ø« Ø´Ø±ÙƒØ© Ø²ÙŠÙ† Ø§Ù„Ø¹Ø±Ø§Ù‚ Ø¹Ù† Ù…Ø·ÙˆØ± Ø¨Ø±Ù…Ø¬ÙŠØ§Øª Ù…Ø¨ØªØ¯Ø¦ Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù… Ø¥Ù„Ù‰ Ù‚Ø³Ù… Ø§Ù„Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© ÙÙŠ Ø¨ØºØ¯Ø§Ø¯. ÙŠÙØ¶Ù„ Ø¥ØªÙ‚Ø§Ù† React Ø£Ùˆ JavaScript Ø£Ùˆ Flutter. Ù†Ø´Ø¬Ø¹ Ø§Ù„Ø®Ø±ÙŠØ¬ÙŠÙ† Ø§Ù„Ø¬Ø¯Ø¯ Ù…Ù† ØªØ®ØµØµØ§Øª Ù‡Ù†Ø¯Ø³Ø© Ø§Ù„Ø­Ø§Ø³ÙˆØ¨ Ø£Ùˆ Ø¹Ù„ÙˆÙ… Ø§Ù„Ø­Ø§Ø³ÙˆØ¨ Ø£Ùˆ ØªÙ‚Ù†ÙŠØ© Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ…!',
    contentKU: 'Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ÛŒ Ø²ÛŒÙ† Ø¹ÛŽØ±Ø§Ù‚ Ø¨Û•Ø¯ÙˆØ§ÛŒ Ú¯Û•Ø´Û•Ù¾ÛŽØ¯Û•Ø±ÛŽÚ©ÛŒ Ù†Û•Ø±Ù…Û•Ú©Ø§ÚµØ§ÛŒ Ø¬Û†Ù†ÛŒÛ†Ø±Ø¯Ø§ Ø¯Û•Ú¯Û•Ú•ÛŽØª Ø¨Û† Ø¨Û•Ø´ÛŒ Ø¦Ø§Ù…Ø±Ø§Ø²Û• Ø¯ÛŒØ¬ÛŒØªØ§ÚµÛŒÛŒÛ•Ú©Ø§Ù† Ù„Û• Ø¨Û•ØºØ¯Ø§. Ø´Ø§Ø±Û•Ø²Ø§ÛŒÛŒ Ù„Û• React ÛŒØ§Ù† JavaScript ÛŒØ§Ù† Flutter Ø¨Ø§Ø´ØªØ±Û•. Ø¯Û•Ø±Ú†ÙˆÙˆØ§Ù†ÛŒ Ù†ÙˆÛŽÛŒ Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ ÛŒØ§Ù† Ø²Ø§Ù†Ø³ØªÛŒ Ú©Û†Ù…Ù¾ÛŒÙˆØªÛ•Ø± Ù‡Ø§Ù†Ø¯Û•Ø¯Ø±ÛŽÙ† Ù¾ÛŽØ´Ú©Û•Ø´ Ø¨Ú©Û•Ù†!',
    author: {
      name: 'Zain Iraq HR Division',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '1 day ago',
    likes: 245,
    commentsCount: 19,
    governorateId: 'baghdad',
    company: 'Zain Iraq',
    companyLogo: 'ðŸ“±',
    salary: '1,200,000 - 1,500,000 IQD',
    location: 'Baghdad (HQ)',
    deadline: 'June 30, 2026',
    tags: ['Jobs', 'Software', 'Tech', 'FreshGrads'],
    commentsList: [
      {
        id: 'cj-1',
        authorName: 'Yassir Al-Kinani',
        authorRole: 'graduate',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
        content: 'I did my summer internship with Zain last year, the team is fantastic. Highly recommend applying!',
        date: '18 hours ago'
      }
    ]
  },

  // 4. POLL (Life)
  {
    id: 'poll-1',
    type: 'poll',
    titleEN: 'Where is the absolute best study spot near Mosul University?',
    titleAR: 'Ø£ÙŠÙ† Ù‡Ùˆ Ø£ÙØ¶Ù„ Ù…ÙƒØ§Ù† Ù„Ù„Ù…Ø°Ø§ÙƒØ±Ø© ÙˆØ§Ù„Ø¯Ø±Ø§Ø³Ø© Ù‚Ø±Ø¨ Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„ØŸ',
    titleKU: 'Ø¨Ø§Ø´ØªØ±ÛŒÙ† Ø´ÙˆÛŽÙ†ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ù„Û• Ù†Ø²ÛŒÚ© Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ Ù„Û•Ú©ÙˆÛŽÛŒÛ•ØŸ',
    contentEN: 'Exam season is intense. Where are we pulling our all-nighter group studies?',
    contentAR: 'Ù…ÙˆØ³Ù… Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ù…ÙƒØ«Ù Ø¬Ø¯Ø§Ù‹. Ø£ÙŠÙ† Ù†Ù‚Ø¶ÙŠ Ù„ÙŠØ§Ù„ÙŠ Ø§Ù„Ù…Ø°Ø§ÙƒØ±Ø© Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠØ©ØŸ',
    contentKU: 'ÙˆÛ•Ø±Ø²ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù† Ú†Ú•Û•. Ù„Û•Ú©ÙˆÛŽ Ø´Û•ÙˆÙ†Ø®ÙˆÙ†ÛŒ Ø¯Û•Ú©Û•ÛŒÙ† Ø¨Û† Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ Ø¨Û•Ú©Û†Ù…Û•ÚµØŸ',
    author: {
      name: 'Sara Mosuli',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    },
    date: '6 hours ago',
    likes: 120,
    commentsCount: 34,
    universityId: 'u_mosul',
    governorateId: 'nineveh',
    pollOptions: [
      { id: 'p1-1', textEN: 'The Central Library (Quiet but crowded)', textAR: 'Ø§Ù„Ù…ÙƒØªØ¨Ø© Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ© (Ù‡Ø§Ø¯Ø¦Ø© Ù„ÙƒÙ† Ù…Ø²Ø¯Ø­Ù…Ø©)', textKU: 'Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•ÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ (Ø¨ÛŽØ¯Û•Ù†Ú¯ Ø¨Û•ÚµØ§Ù… Ù‚Û•Ø±Û•Ø¨Ø§ÚµØº)', votes: 145 },
      { id: 'p1-2', textEN: 'Caprice Cafe (Incredible coffee, good Wi-Fi)', textAR: 'Ù…Ù‚Ù‡Ù‰ ÙƒØ§Ø¨Ø±ÙŠØ³ (Ù‚Ù‡ÙˆØ© Ù…Ø°Ù‡Ù„Ø© ÙˆØ¥Ù†ØªØ±Ù†Øª Ø±Ø§Ø¦Ø¹)', textKU: 'Ú©Ø§ÙÛŽÛŒ Ú©Ø§Ù¾Ø±ÛŒØ³ (Ù‚Ø§ÙˆÛ•ÛŒ Ù†Ø§ÙˆØ§Ø²Û• Ùˆ Ø¦ÛŒÙ†ØªÛ•Ø±Ù†ÛŽØªÛŒ Ø¨Ø§Ø´)', votes: 204 },
      { id: 'p1-3', textEN: 'Engineering College gardens (Best breeze)', textAR: 'Ø­Ø¯Ø§Ø¦Ù‚ ÙƒÙ„ÙŠØ© Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© (Ø£ÙØ¶Ù„ Ù‡ÙˆØ§Ø¡ Ù†Ù‚ÙŠ)', textKU: 'Ø¨Ø§Ø®Ú†Û•Ú©Ø§Ù†ÛŒ Ú©Û†Ù„ÛŽÚ˜ÛŒ Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±ÛŒ (Ø¨Ø§Ø´ØªØ±ÛŒÙ† Ù‡Û•ÙˆØ§)', votes: 98 },
      { id: 'p1-4', textEN: 'My room, under the split AC â„ï¸', textAR: 'ØºØ±ÙØªÙŠ Ø§Ù„Ø´Ø®ØµÙŠØ©ØŒ ØªØ­Øª Ø§Ù„Ø³Ø¨Ù„Øª â„ï¸', textKU: 'Ú˜ÙˆÙˆØ±Û•Ú©Û•ÛŒ Ø®Û†Ù…ØŒ Ù„Û•Ú˜ÛŽØ± Ø³Ù¾Ù„ÛŒØªÛ•Ú©Û•Ø¯Ø§ â„ï¸', votes: 412 }
    ],
    tags: ['Mosul', 'Poll', 'StudySpots'],
    commentsList: [
      {
        id: 'cp-1',
        authorName: 'Mustafa Al-Hadithi',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        content: 'Nothing beats the Split AC in 45Â°C June weather, subhanAllah!',
        date: '5 hours ago'
      }
    ]
  },

  // 5. ANONYMOUS QUESTION (Ask)
  {
    id: 'ask-1',
    type: 'anonymous_question',
    titleEN: 'Urgent: How rigid is Salahaddin University attendance warning policy?',
    titleAR: 'Ø¹Ø§Ø¬Ù„: Ù…Ø§ Ù…Ø¯Ù‰ ØµØ±Ø§Ù…Ø© Ø³ÙŠØ§Ø³Ø© Ø¥Ù†Ø°Ø§Ø± ØºÙŠØ§Ø¨Ø§Øª Ø¬Ø§Ù…Ø¹Ø© ØµÙ„Ø§Ø­ Ø§Ù„Ø¯ÙŠÙ†ØŸ',
    titleKU: 'Ø¨Û•Ù¾Û•Ù„Û•: Ø³ÛŒØ§Ø³Û•ØªÛŒ Ø¦Ø§Ú¯Ø§Ø¯Ø§Ø±Ú©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ù†Û•Ù‡Ø§ØªÙ†ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Û•ÚµØ§Ø­Û•Ø¯ÛŒÙ† ØªØ§ Ú†Û•Ù†Ø¯ ØªÙˆÙ†Ø¯Û•ØŸ',
    contentEN: 'I missed 8 hours of Control Systems because of a medical emergency and got a second warning (Ø¥Ù†Ø°Ø§Ø± Ø«Ø§Ù†ÙŠ). Will I actually get excluded from taking the exam, or is there a petition form?',
    contentAR: 'ØªØºÙŠØ¨Øª Ù¨ Ø³Ø§Ø¹Ø§Øª Ø¹Ù† Ù…Ø§Ø¯Ø© Ø£Ù†Ø¸Ù…Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø¨Ø³Ø¨Ø¨ Ø¸Ø±Ù Ø·Ø¨ÙŠ Ø·Ø§Ø±Ø¦ ÙˆØ§Ø³ØªÙ„Ù…Øª Ø¥Ù†Ø°Ø§Ø±Ø§Ù‹ Ø«Ø§Ù†ÙŠØ§Ù‹. Ù‡Ù„ Ø³ÙŠØªÙ… Ø­Ø±Ù…Ø§Ù†ÙŠ ÙØ¹Ù„ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ø§Ù…ØªØ­Ø§Ù† Ø£Ù… Ù‡Ù†Ø§Ùƒ Ø§Ø³ØªÙ…Ø§Ø±Ø© ØªÙ‚Ø¯ÙŠÙ… Ø¹Ø°Ø± Ø·Ø¨ÙŠØŸ',
    contentKU: 'Ù¨ Ú©Ø§ØªÚ˜Ù…ÛŽØ± Ù„Û• ÙˆØ§Ù†Û•ÛŒ Ø³ÛŒØ³ØªÛ•Ù…ÛŒ Ú©Û†Ù†ØªØ±Û†Úµ Ù†Û•Ù‡Ø§ØªÙˆÙˆÙ… Ø¨Û•Ù‡Û†ÛŒ ÙØ±ÛŒØ§Ú©Û•ÙˆØªÙ†ÛŒ Ù¾Ø²ÛŒØ´Ú©ÛŒ Ùˆ Ø¦Ø§Ú¯Ø§Ø¯Ø§Ø±Ú©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ø¯ÙˆÙˆÛ•Ù…Ù… Ù¾ÛŽÚ¯Û•ÛŒØ´Øª. Ø¦Ø§ÛŒØ§ Ø¨Û• Ú•Ø§Ø³ØªÛŒ Ø¨ÛŽØ¨Û•Ø´ Ø¯Û•Ú©Ø±ÛŽÙ… Ù„Û• ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ• ÛŒØ§Ù† ÙÛ†Ø±Ù…ÛŒ Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒ Ù‡Û•ÛŒÛ•ØŸ',
    author: {
      name: 'Anonymous Student',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    },
    date: '2 hours ago',
    likes: 42,
    commentsCount: 9,
    universityId: 'u_salahaddin',
    governorateId: 'erbil',
    tags: ['Advising', 'Erbil', 'Anonymous'],
    commentsList: [
      {
        id: 'ca-1',
        authorName: 'Karwan Sleman',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
        content: 'Go immediately to the Dean assistant for student affairs (Ù…Ø¹Ø§ÙˆÙ† Ø§Ù„Ø¹Ù…ÙŠØ¯ Ù„Ø´Ø¤ÙˆÙ† Ø§Ù„Ø·Ù„Ø¨Ø©). Since you have a medical report, they will help you drop the hours and convert it into excused.',
        date: '1 hour ago'
      },
      {
        id: 'ca-2',
        authorName: 'Dr. Hersh Ahmed',
        authorRole: 'teacher',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        content: 'Yes, Karwan is correct. Do not delay. Bring the original stomatologist/hospital report to your head of department by tomorrow morning.',
        date: '45 mins ago'
      }
    ]
  },

  // 6. SCHOLARSHIP (Future)
  {
    id: 'scholarship-1',
    type: 'scholarship',
    titleEN: 'Iraqi Youth Leadership Exchange Program (IYLEP) 2026',
    titleAR: 'Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ù‚Ø§Ø¯Ø© Ø§Ù„Ø´Ø¨Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ† (IYLEP) Ù¢Ù Ù¢Ù¦',
    titleKU: 'Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ Ø¦Ø§ÚµÙˆÚ¯Û†Ú•ÛŒ Ø³Û•Ø±Ú©Ø±Ø¯Û• Ú¯Û•Ù†Ø¬Û•Ú©Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ (IYLEP) Ù¢Ù Ù¢Ù¦',
    contentEN: 'Applications are officially open for IYLEP 2026! This is a fully funded 4-week leadership program in the United States targeting undergraduate students in public and private universities across all governorates of Iraq. English proficiency is required.',
    contentAR: 'ØªÙ… ÙØªØ­ Ø¨Ø§Ø¨ Ø§Ù„ØªÙ‚Ø¯ÙŠÙ… Ø±Ø³Ù…ÙŠØ§Ù‹ Ù„Ø¨Ø±Ù†Ø§Ù…Ø¬ IYLEP Ù¢Ù Ù¢Ù¦! Ù‡Ø°Ø§ Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨ÙŠ Ù…Ù…ÙˆÙ„ Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ Ù„Ù…Ø¯Ø© Ù¤ Ø£Ø³Ø§Ø¨ÙŠØ¹ ÙÙŠ Ø§Ù„ÙˆÙ„Ø§ÙŠØ§Øª Ø§Ù„Ù…ØªØ­Ø¯Ø© ÙŠØ³ØªÙ‡Ø¯Ù Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠÙˆØ³ ÙÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„Ø­ÙƒÙˆÙ…ÙŠØ© ÙˆØ§Ù„Ø£Ù‡Ù„ÙŠØ© Ù…Ù† Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠØ©. ÙŠØ´ØªØ±Ø· Ø¥ØªÙ‚Ø§Ù† Ø§Ù„Ù„ØºØ© Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ©.',
    contentKU: 'Ø¯Û•Ø±Ú¯Ø§ Ø¨Û† Ù¾ÛŽØ´Ú©Û•Ø´Ú©Ø±Ø¯Ù†ÛŒ Ø¯Ø§ÙˆØ§Ú©Ø§Ø±ÛŒ Ù„Û• Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒ IYLEP Ù¢Ù Ù¢Ù¦ Ø¨Û• ÙÛ•Ø±Ù…ÛŒ Ú©Ø±Ø§ÛŒÛ•ÙˆÛ•!Ø¦Û•Ù…Û• Ø¨Û•Ø±Ù†Ø§Ù…Û•ÛŒÛ•Ú©ÛŒ Ø³Û•Ø±Ú©Ø±Ø¯Ø§ÛŒÛ•ØªÛŒ Ù¤ Ù‡Û•ÙØªÛ•ÛŒÛŒ Ù¾Ø§ÚµÙ¾Ø´ØªÛŒÚ©Ø±Ø§ÙˆÛŒ Ø¯Ø§Ø±Ø§ÛŒÛŒÛ• Ù„Û• Ø¦Û•Ù…Ø±ÛŒÚ©Ø§ Ú©Û• Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û† Ø­Ú©ÙˆÙ…ÛŒ Ùˆ Ø¦Û•Ù‡Ù„ÛŒÛŒÛ•Ú©Ø§Ù† Ù„Û• Ù‡Û•Ù…ÙˆÙˆ Ù¾Ø§Ø±ÛŽØ²Ú¯Ø§Ú©Ø§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚ Ø¯Û•Ú©Ø§ØªÛ• Ø¦Ø§Ù…Ø§Ù†Ø¬.',
    author: {
      name: 'US Embassy Baghdad Education Office',
      role: 'institution',
      avatar: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '2 days ago',
    likes: 489,
    commentsCount: 61,
    company: 'US Embassy Baghdad',
    companyLogo: 'ðŸ‡ºðŸ‡¸',
    location: 'All Iraq',
    deadline: 'July 15, 2026',
    tags: ['Scholarships', 'Leadership', 'IYLEP', 'USA'],
    commentsList: [
      {
        id: 'cs-1',
        authorName: 'Amed Shwan',
        authorRole: 'graduate',
        authorAvatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=100',
        content: 'I was an IYLEP participant in 2024! It completely transformed my mind and perspective. Please feel free to hit me up if anyone needs help writing their personal essay!',
        date: '1 day ago'
      }
    ]
  },

  // 7. STORY (Life / Moments)
  {
    id: 'story-1',
    type: 'story',
    titleEN: 'Erbil Polytechnic graduation photoshoot backstage ðŸŽ“ðŸŽ‰',
    titleAR: 'ÙƒÙˆØ§Ù„ÙŠØ³ Ø¬Ù„Ø³Ø© ØªØµÙˆÙŠØ± ØªØ®Ø±Ø¬ Ø§Ù„Ù…Ø¹Ù‡Ø¯ Ø§Ù„ØªÙ‚Ù†ÙŠ ÙÙŠ Ø£Ø±Ø¨ÙŠÙ„ ðŸŽ“ðŸŽ‰',
    titleKU: 'Ù¾Ø´Øª Ø¯ÛŒÙ…Û•Ù†ÛŒ ÙˆÛŽÙ†Û•Ú¯Ø±ØªÙ†ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†ÛŒ Ù¾Û•ÛŒÙ…Ø§Ù†Ú¯Ø§ÛŒ ØªÛ•Ú©Ù†ÛŒÚ©ÛŒ Ù‡Û•ÙˆÙ„ÛŽØ± ðŸŽ“ðŸŽ‰',
    contentEN: 'We made it! After 4 years of labs, projects, and zero sleep, we are officially engineers! Check out some backstage craziness.',
    contentAR: 'Ù„Ù‚Ø¯ ÙØ¹Ù„Ù†Ø§Ù‡Ø§! Ø¨Ø¹Ø¯ Ù¤ Ø³Ù†ÙˆØ§Øª Ù…Ù† Ø§Ù„Ù…Ø®ØªØ¨Ø±Ø§Øª ÙˆØ§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ ÙˆÙ‚Ù„Ø© Ø§Ù„Ù†ÙˆÙ…ØŒ Ø£ØµØ¨Ø­Ù†Ø§ Ù…Ù‡Ù†Ø¯Ø³ÙŠÙ† Ø±Ø³Ù…ÙŠØ§Ù‹! Ø´Ø§Ù‡Ø¯ÙˆØ§ Ø¨Ø¹Ø¶ Ø§Ù„Ø¬Ù†ÙˆÙ† Ù…Ù† Ø§Ù„ÙƒÙˆØ§Ù„ÙŠØ³.',
    contentKU: 'Ø³Û•Ø±Ú©Û•ÙˆØªÛŒÙ†! Ø¯ÙˆØ§ÛŒ Ù¤ Ø³Ø§Úµ Ù„Û• ØªØ§Ù‚ÛŒÚ¯Û• Ùˆ Ù¾Ú•Û†Ú˜Û• Ùˆ Ø¨ÛŽØ®Û•ÙˆÛŒØŒ Ø¨Û• ÙÛ•Ø±Ù…ÛŒ Ø¨ÙˆÙˆÛŒÙ† Ø¨Û• Ø¦Û•Ù†Ø¯Ø§Ø²ÛŒØ§Ø±! Ø³Û•ÛŒØ±ÛŒ Ù‡Û•Ù†Ø¯ÛŽÚ© Ø¯ÛŒÙ…Û•Ù†ÛŒ Ù¾Ø´Øª Ú©Ø§Ù…ÛŽØ±Ø§ Ø¨Ú©Û•.',
    author: {
      name: 'Renas Erbili',
      role: 'graduate',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100',
    },
    date: '12 hours ago',
    likes: 540,
    commentsCount: 45,
    governorateId: 'erbil',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    tags: ['Graduation', 'Class2026', 'Erbil'],
    commentsList: []
  },

  // 8. EVENT (Calendar / Future / Life)
  {
    id: 'event-1',
    type: 'event',
    titleEN: 'Baghdad National Campus Hackathon 2026',
    titleAR: 'Ù‡Ø§ÙƒØ§Ø«ÙˆÙ† Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª Ø§Ù„ÙˆØ·Ù†ÙŠØ© ÙÙŠ Ø¨ØºØ¯Ø§Ø¯ Ù¢Ù Ù¢Ù¦',
    titleKU: 'Ù‡Ø§Ú©Ø§ØªÛ†Ù†ÛŒ Ù†ÛŒØ´ØªÙ…Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†ÛŒ Ø¨Û•ØºØ¯Ø§ Ù¢Ù Ù¢Ù¦',
    contentEN: 'Organized by Al-Mustansiriya Computing Hub. A 48-hour challenge to prototype civic tech solutions for municipal problems in Baghdad (traffic, water management, recycling tracker). Over 5M IQD in cash prizes for winning teams!',
    contentAR: 'Ø¨ØªÙ†Ø¸ÙŠÙ… Ù…Ù† Ù…Ù„ØªÙ‚Ù‰ Ø§Ù„Ø¨Ø±Ù…Ø¬ÙŠØ§Øª ÙÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ†ØµØ±ÙŠØ©. ØªØ­Ø¯ÙŠ Ù„Ù…Ø¯Ø© Ù¤Ù¨ Ø³Ø§Ø¹Ø© Ù„Ø¨Ù†Ø§Ø¡ Ø­Ù„ÙˆÙ„ ØªÙ‚Ù†ÙŠØ© Ø¨Ù„Ø¯ÙŠØ© Ù„Ù…Ø´Ø§ÙƒÙ„ Ø¨ØºØ¯Ø§Ø¯ (Ø§Ù„Ù…Ø±ÙˆØ±ØŒ Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…ÙŠØ§Ù‡ØŒ ØªØªØ¨Ø¹ Ø§Ù„ØªØ¯ÙˆÙŠØ±). Ø£ÙƒØ«Ø± Ù…Ù† Ù¥ Ù…Ù„Ø§ÙŠÙŠÙ† Ø¯ÙŠÙ†Ø§Ø± Ø¹Ø±Ø§Ù‚ÙŠ ÙƒØ¬ÙˆØ§Ø¦Ø² Ù†Ù‚Ø¯ÙŠØ© Ù„Ù„ÙØ±Ù‚ Ø§Ù„ÙØ§Ø¦Ø²Ø©!',
    contentKU: 'Ù„Û•Ù„Ø§ÛŒÛ•Ù† Ú©Û†Ú•Ø¨Û•Ù†Ø¯ÛŒ ØªÛ•Ú©Ù†Û•Ù„Û†Ú˜ÛŒØ§ÛŒ Ù…ÙˆØ³ØªÛ•Ù†Ø³Ø±ÛŒÛ• Ú•ÛŽÚ©Ø®Ø±Ø§ÙˆÛ•. Ø¦Ø§Ø³ØªÛ•Ù†Ú¯ÛŽÚ©ÛŒ Ù¤Ù¨ Ú©Ø§ØªÚ˜Ù…ÛŽØ±ÛŒ Ø¨Û† Ø¯Ø±ÙˆØ³ØªÚ©Ø±Ø¯Ù†ÛŒ Ú†Ø§Ø±Û•Ø³Û•Ø±ÛŒ ØªÛ•Ú©Ù†Û•Ù„Û†Ú˜ÛŒ Ø´Ø§Ø±Ø³ØªØ§Ù†ÛŒ Ø¨Û† Ú©ÛŽØ´Û•Ú©Ø§Ù†ÛŒ Ù„Û• Ø¨Û•ØºØ¯Ø§ (Ù‡Ø§ØªÙˆÚ†Û†ØŒ Ù†ÙˆÛŽÚ©Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ú˜ÛŒÙ†Ú¯Û•). Ø²ÛŒØ§ØªØ± Ù„Û• Ù¥ Ù…Ù„ÛŒÛ†Ù† Ø¯ÛŒÙ†Ø§Ø± Ø®Û•ÚµØ§Øª!',
    author: {
      name: 'Al-Mustansiriya Computing Hub',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=150',
      verified: true
    },
    date: '5 hours ago',
    likes: 198,
    commentsCount: 12,
    universityId: 'u_mustansiriya',
    governorateId: 'baghdad',
    eventDate: 'Friday, June 26, 2026',
    eventTime: '09:00 AM (48h duration)',
    eventVenue: 'Computing Lab Hall 4, Al-Mustansiriya University',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600',
    tags: ['Hackathon', 'Coding', 'Baghdad', 'Future'],
    commentsList: [
      {
        id: 'ce-1',
        authorName: 'Hussein Dev',
        authorRole: 'student',
        authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=100',
        content: 'I need a UI Designer for my team! We are building a mobile routing system using Vite. Drop me a DM!',
        date: '4 hours ago'
      }
    ]
  },

  // 9. STUDY GROUP
  {
    id: 'group-1',
    type: 'study_group',
    titleEN: 'Deep Learning with PyTorch Study Circle',
    titleAR: 'Ø­Ù„Ù‚Ø© Ø¯Ø±Ø§Ø³ÙŠØ© Ù„ØªØ¹Ù„Ù… Ø§Ù„Ø¢Ù„Ø© Ø§Ù„Ø¹Ù…ÙŠÙ‚ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… PyTorch',
    titleKU: 'Ø¨Ø§Ø²Ù†Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ ÙÛŽØ±Ø¨ÙˆÙˆÙ†ÛŒ Ù‚ÙˆÙˆÚµ Ù„Û•Ú¯Û•Úµ PyTorch',
    contentEN: 'We are a group of 3 seniors preparing our graduation project on AI-based tumor detection. We meet every Wednesday evening at AUIS library. Looking for 2 more intermediate python students to join.',
    contentAR: 'Ù†Ø­Ù† Ù£ Ø·Ù„Ø§Ø¨ ÙÙŠ Ø§Ù„Ù…Ø±Ø­Ù„Ø© Ø§Ù„Ø±Ø§Ø¨Ø¹Ø© Ù†Ù‚ÙˆÙ… Ø¨Ù…Ø´Ø±ÙˆØ¹ ØªØ®Ø±Ø¬Ù†Ø§ Ø­ÙˆÙ„ ÙƒØ´Ù Ø§Ù„Ø£ÙˆØ±Ø§Ù… Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ. Ù†Ù„ØªÙ‚ÙŠ ÙƒÙ„ Ø£Ø±Ø¨Ø¹Ø§Ø¡ ÙÙŠ Ù…ÙƒØªØ¨Ø© AUIS. Ù†Ø¨Ø­Ø« Ø¹Ù† Ø·Ø§Ù„Ø¨ÙŠÙ† Ø¢Ø®Ø±ÙŠÙ† Ø¨Ù…Ø³ØªÙˆÙ‰ Ù…ØªÙˆØ³Ø· ÙÙŠ Ø¨Ø§ÙŠØ«ÙˆÙ† Ù„Ù„Ø§Ù†Ø¶Ù…Ø§Ù….',
    contentKU: 'Ø¦ÛŽÙ…Û• Ú¯Ø±ÙˆÙ¾ÛŽÚ©ÛŒ Ù£ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±ÛŒ Ù‚Û†Ù†Ø§ØºÛŒ Ú†ÙˆØ§Ø±ÛŒÙ† Ù¾Ø±Û†Ú˜Û•ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†Ù…Ø§Ù† Ù„Û•Ø³Û•Ø± Ø¯Û†Ø²ÛŒÙ†Û•ÙˆÛ•ÛŒ Ú¯Ø±ÛŽÛŒ Ø¯Û•Ù…Ø§Ø±ÛŒÛŒ Ø¨Û• Ø²ÛŒØ±Û•Ú©ÛŒ Ø¯Û•Ø³ØªÚ©Ø±Ø¯ Ø¯Û•Ú©Û•ÛŒÙ†. Ù‡Û•Ù…ÙˆÙˆ Ú†ÙˆØ§Ø±Ø´Û•Ù…Ù…Û•ÛŒÛ•Ú© Ù„Û• Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•ÛŒ AUIS Ú©Û†Ø¯Û•Ø¨ÛŒÙ†Û•ÙˆÛ•.',
    author: {
      name: 'Hero Salihi',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
      university: 'American University of Iraq, Sulaimani'
    },
    date: 'Yesterday',
    likes: 34,
    commentsCount: 6,
    universityId: 'auis',
    governorateId: 'sulaymaniyah',
    subject: 'Deep Learning / Computer Vision',
    memberCount: 3,
    tags: ['StudyGroups', 'Python', 'AI'],
    commentsList: []
  },

  // 10. LOCAL SERVICE near campus
  {
    id: 'service-1',
    type: 'local_service',
    titleEN: 'Al-Mansour Copy & Bind Shop (Opposite Main Gate)',
    titleAR: 'Ù…ÙƒØªØ¨ Ø§Ù„Ù…Ù†ØµÙˆØ± Ù„Ù„Ø§Ø³ØªÙ†Ø³Ø§Ø® ÙˆØ§Ù„ØªØ¬Ù„ÙŠØ¯ (Ù…Ù‚Ø§Ø¨Ù„ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©)',
    titleKU: 'Ù†ÙˆÙˆØ³ÛŒÙ†Ú¯Û•ÛŒ Ù…Û•Ù†Ø³ÙˆØ± Ø¨Û† Ú©Û†Ù¾ÛŒÚ©Ø±Ø¯Ù† Ùˆ Ø¨Û•Ø³ØªÙ†Û•ÙˆÛ• (Ø¨Û•Ø±Ø§Ù…Ø¨Û•Ø± Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ Ø³Û•Ø±Û•Ú©ÛŒ)',
    contentEN: 'Best prices for student handouts, reference books, and graduation project hardcover leather binding. High speed laser printing directly from USB or drive. Located 20 meters from University of Baghdad gate 1.',
    contentAR: 'Ø£ÙØ¶Ù„ Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ù„Ø§Ø³ØªÙ†Ø³Ø§Ø® Ø§Ù„Ù…Ù„Ø§Ø²Ù…ØŒ Ø§Ù„ÙƒØªØ¨ Ø§Ù„Ù…Ù†Ù‡Ø¬ÙŠØ©ØŒ ÙˆØªØ¬Ù„ÙŠØ¯ Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„ØªØ®Ø±Ø¬ Ø¨Ø§Ù„Ø¬Ù„Ø¯ Ø§Ù„ÙØ§Ø®Ø±. Ø·Ø¨Ø§Ø¹Ø© Ù„ÙŠØ²Ø±ÙŠØ© Ø³Ø±ÙŠØ¹Ø© Ø¬Ø¯Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ù† Ø§Ù„ÙÙ„Ø§Ø´ Ø£Ùˆ Ø§Ù„Ø¯Ø±Ø§ÙŠÙ. ÙŠÙ‚Ø¹ Ø¹Ù„Ù‰ Ø¨Ø¹Ø¯ Ù¢Ù  Ù…ØªØ±Ø§Ù‹ Ù…Ù† Ø¨ÙˆØ§Ø¨Ø© Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯ Ø§Ù„Ø£ÙˆÙ„Ù‰.',
    contentKU: 'Ø¨Ø§Ø´ØªØ±ÛŒÙ† Ù†Ø±Ø® Ø¨Û† Ú©Û†Ù¾ÛŒÚ©Ø±Ø¯Ù†ÛŒ Ø¯Û•ÙØªÛ•Ø±ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† Ùˆ Ù¾Û•Ø±ØªÙˆÙˆÚ©ÛŒ Ø³Û•Ø±Ú†Ø§ÙˆÛ• Ùˆ Ø¨Û•Ø±Ú¯ÛŒ Ù¾ÛŽØ³ØªÛŒ Ù¾Ú•Û†Ú˜Û•ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†. Ú†Ø§Ù¾Ú©Ø±Ø¯Ù†ÛŒ Ù„Û•ÛŒØ²Û•Ø±ÛŒ Ø²Û†Ø± Ø®ÛŽØ±Ø§ Ù„Û• ÙÙ„Ø§Ø´Û•ÙˆÛ•. Ø¯Û•Ú©Û•ÙˆÛŽØªÛ• Ù¢Ù  Ù…Û•ØªØ± Ù„Û• Ø¯Û•Ø±ÙˆØ§Ø²Û•ÛŒ ÛŒÛ•Ú©Û•Ù…ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§.',
    author: {
      name: 'Abu Yasir (Manager)',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100'
    },
    date: '3 days ago',
    likes: 45,
    commentsCount: 8,
    universityId: 'u_baghdad',
    governorateId: 'baghdad',
    serviceCategory: 'photocopy',
    serviceRating: 4.8,
    serviceDistance: '20m from main gate',
    tags: ['CampusServices', 'Photocopy', 'Binding'],
    commentsList: []
  }
];

