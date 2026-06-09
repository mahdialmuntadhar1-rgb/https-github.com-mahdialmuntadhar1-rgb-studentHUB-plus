export type Language = 'en' | 'ar' | 'ku';

export interface Governorate {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
}

export interface University {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
  governorateId: string;
  logo: string;
  color: string;
}

export interface Author {
  name: string;
  role: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  avatar: string;
  verified?: boolean;
  university?: string;
}

export interface PollOption {
  id: string;
  textEN: string;
  textAR: string;
  textKU: string;
  votes: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorRole: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  authorAvatar: string;
  content: string;
  date: string;
  likes?: number;
}

export interface FeedItem {
  id: string;
  type:
    | 'post'
    | 'video'
    | 'photo'
    | 'story'
    | 'poll'
    | 'anonymous_question'
    | 'announcement'
    | 'job'
    | 'internship'
    | 'scholarship'
    | 'training'
    | 'event'
    | 'study_group'
    | 'local_service'
    | 'part_time_job'
    | 'full_time_job'
    | 'volunteering'
    | 'competition'
    | 'graduation_project_support';
  
  // Localized Content
  titleEN: string;
  titleAR: string;
  titleKU: string;
  contentEN: string;
  contentAR: string;
  contentKU: string;
  
  // Meta
  author: Author;
  date: string; // e.g. '3 hours ago' / '٣ ساعات مضت'
  rawDate?: string; // ISO date for sorting
  likes: number;
  commentsCount: number;
  commentsList: Comment[];
  likedByUser?: boolean;
  savedByUser?: boolean;
  views?: number;
  tags?: string[];
  
  // Relations
  universityId?: string; // 'all' or specific
  governorateId?: string; // 'all' or specific
  
  // Specific Type Data
  videoUrl?: string; // Placeholder ratio string or actual link
  videoThumbnail?: string;
  imageUrl?: string;
  
  // For Polls
  pollOptions?: PollOption[];
  pollVotedId?: string;
  
  // For Jobs / Internships / Scholarships
  company?: string;
  companyLogo?: string;
  salary?: string;
  location?: string; // Localized location string e.g. 'Baghdad'
  deadline?: string;
  applied?: boolean;
  
  // Upgraded rich opportunity details
  opportunityCategory?: 'Internship' | 'Part-time job' | 'Full-time graduate job' | 'Training' | 'Scholarship' | 'Volunteering' | 'Competition' | 'Graduation project support';
  workplaceType?: 'Remote' | 'On-site' | 'Hybrid';
  whoCanApply?: string;
  savedCount?: number;
  universityAppliedCount?: number;
  companyVerified?: boolean;
  
  // For Events / Calendar
  eventDate?: string; // e.g., 'Thursday, June 18'
  eventTime?: string; // e.g., '10:00 AM'
  eventVenue?: string; // e.g., 'Central Hall, University of Baghdad'
  eventRsvped?: boolean;
  eventRsvpCount?: number;

  // Study group details
  subject?: string;
  memberCount?: number;
  joined?: boolean;
  
  // Local services Details
  serviceCategory?: 'cafe' | 'photocopy' | 'dorm' | 'stationery' | 'restaurant' | 'gym';
  serviceRating?: number;
  serviceDistance?: string; // e.g., '50m from gate'
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  role: 'student' | 'graduate' | 'teacher' | 'staff' | 'institution';
  universityId: string;
  governorateId: string;
  bioEN: string;
  bioAR: string;
  bioKU: string;
  majorEN: string;
  majorAR: string;
  majorKU: string;
  points: number; // gamification points (e.g. for asking, answering, RSVP)
  level: number;
  savedItemIds: string[];
  appliedJobIds: string[];
  joinedGroupIds: string[];
  rsvpedEventIds: string[];
}
