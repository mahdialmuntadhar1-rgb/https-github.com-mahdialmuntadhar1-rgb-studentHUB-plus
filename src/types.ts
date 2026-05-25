export type Governorate =
  | 'بغداد'
  | 'البصرة'
  | 'الموصل'
  | 'أربيل'
  | 'السليمانية'
  | 'دهوك'
  | 'النجف'
  | 'كربلاء'
  | 'الأنبار'
  | 'ديالى'
  | 'كركوك'
  | 'واسط'
  | 'المثنى'
  | 'ذي قار'
  | 'ميسان'
  | 'بابل'
  | 'صلاح الدين'
  | 'القادسية';

export type UserRole =
  | 'student_uni'
  | 'student_inst'
  | 'student_high'
  | 'graduate'
  | 'institution_rep';

export type PostType = 'announcement' | 'event' | 'opportunity' | 'student' | 'urgent' | 'insight';

export interface Post {
  id: string;
  type: PostType;
  institutionName: string;
  institutionLogo: string;
  governorate: Governorate;
  content: string;
  title?: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  views?: number;
  timestamp: string;
  deadline?: string;
  eventDate?: {
    day: string;
    month: string;
  };
  tags?: string[];
  authorName?: string;
  authorAvatar?: string;
  isVerified?: boolean;
  chartData?: { name: string; value: number }[];
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Institution {
  id: string;
  name: string;
  nameEn: string;
  type: 'university' | 'institute' | 'college' | 'highschool';
  isPublic: boolean;
  governorate: Governorate;
  city: string;
  logo: string;
  cover: string;
  students: number;
  followers: number;
  postCount: number;
  description: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'internship' | 'scholarship' | 'training';
  institutionName: string;
  institutionLogo: string;
  governorate: Governorate;
  deadline: string;
  tags: string[];
}

export interface Notification {
  id: string;
  type: 'announcement' | 'event' | 'opportunity' | 'social';
  subType: 'like' | 'comment' | 'follow' | 'system' | 'urgent';
  title: string;
  content: string;
  timestamp: string;
  group: 'today' | 'this_week' | 'earlier';
  isRead: boolean;
  avatar?: string;
}
