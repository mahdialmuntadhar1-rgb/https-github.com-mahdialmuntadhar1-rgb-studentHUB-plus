import { Governorate, University, FeedItem, UserProfile } from '../types';
import { institutionsStatic } from './institutionsStatic';

export const IraqiGovernorates: Governorate[] = [
  { id: 'baghdad', nameEN: 'Baghdad', nameAR: 'بغداد', nameKU: 'بەغدا' },
  { id: 'nineveh', nameEN: 'Nineveh', nameAR: 'نينوى', nameKU: 'نەینەوا' },
  { id: 'basra', nameEN: 'Basra', nameAR: 'البصرة', nameKU: 'بەسرە' },
  { id: 'sulaymaniyah', nameEN: 'Sulaymaniyah', nameAR: 'السليمانية', nameKU: 'سلێمانی' },
  { id: 'erbil', nameEN: 'Erbil', nameAR: 'أربيل', nameKU: 'هەولێر' },
  { id: 'kirkuk', nameEN: 'Kirkuk', nameAR: 'كركوك', nameKU: 'کەرکووک' },
  { id: 'najaf', nameEN: 'Najaf', nameAR: 'النجف', nameKU: 'نەجەف' },
  { id: 'karbala', nameEN: 'Karbala', nameAR: 'كربلاء', nameKU: 'کەربەلا' },
  { id: 'dhi_qar', nameEN: 'Dhi Qar', nameAR: 'ذي قار', nameKU: 'زیقار' },
  { id: 'babil', nameEN: 'Babil', nameAR: 'بابل', nameKU: 'بابل' },
  { id: 'anbar', nameEN: 'Anbar', nameAR: 'الأنبار', nameKU: 'ئەنبار' },
  { id: 'diyala', nameEN: 'Diyala', nameAR: 'ديالى', nameKU: 'دیالە' },
  { id: 'salah_al_din', nameEN: 'Salah Al-Din', nameAR: 'صلاح الدين', nameKU: 'سەڵاحەدین' },
  { id: 'wasit', nameEN: 'Wasit', nameAR: 'واسط', nameKU: 'واست' },
  { id: 'maysan', nameEN: 'Maysan', nameAR: 'ميسان', nameKU: 'میسان' },
  { id: 'al_qadisiyah', nameEN: 'Al-Qadisiyah', nameAR: 'القادسية', nameKU: 'قادسیە' },
  { id: 'muthanna', nameEN: 'Muthanna', nameAR: 'المثنى', nameKU: 'موسەننا' },
  { id: 'duhok', nameEN: 'Duhok', nameAR: 'دهوك', nameKU: 'دهۆک' },
  { id: 'halabja', nameEN: 'Halabja', nameAR: 'حلبجة', nameKU: 'هەڵەبجە' }
];

export const IraqiUniversities: University[] = [...institutionsStatic];

export const defaultUserProfile: UserProfile = {
  id: '',
  name: '',
  avatar: '',
  role: 'student',
  universityId: '',
  governorateId: '',
  bioEN: '',
  bioAR: '',
  bioKU: '',
  majorEN: '',
  majorAR: '',
  majorKU: '',
  points: 0,
  level: 0,
  savedItemIds: [],
  appliedJobIds: [],
  joinedGroupIds: [],
  rsvpedEventIds: []
};

export const initialFeedItems: FeedItem[] = [];


