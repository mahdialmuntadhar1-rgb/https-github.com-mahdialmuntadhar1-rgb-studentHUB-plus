import React, { useState, useEffect } from 'react';
import { Language, FeedItem, Comment } from '../types';
import { IraqiGovernorates, IraqiUniversities } from '../data/mockData';
import { 
  ArrowLeft, 
  ArrowRight,
  MapPin, 
  School, 
  Loader2,
  Calendar,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  ClipboardList,
  Flame,
  Globe,
  Tag
} from 'lucide-react';
import FeedCard from './FeedCard';
import { BACKEND_URL } from '../lib/api';

interface SectionViewProps {
  sectionId: string;
  language: Language;
  selectedGov: string;
  setSelectedGov: (govId: string) => void;
  selectedUni: string;
  setSelectedUni: (uniId: string) => void;
  onBackToHome: () => void;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
}

const categoryConfigs: Record<string, {
  emoji: string;
  titleEN: string;
  titleAR: string;
  titleKU: string;
  descEN: string;
  descAR: string;
  descKU: string;
  endpoint: 'opportunities' | 'highlights';
  categoryValue: string;
  isOpportunity: boolean;
}> = {
  scholarship: {
    emoji: 'ðŸŽ“',
    titleEN: 'Scholarships',
    titleAR: 'Ø§Ù„Ù…Ù†Ø­ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ©',
    titleKU: 'Ù…Ù†Ø­Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†',
    descEN: 'Explore fully or partially funded scholarship opportunities for Iraqi students.',
    descAR: 'Ø§ÙƒØªØ´Ù Ø§Ù„Ù…Ù†Ø­ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠØ© ÙˆØ§Ù„ØªÙ…ÙˆÙŠÙ„Ø§Øª Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø§Ù„ÙƒØ§Ù…Ù„Ø© ÙˆØ§Ù„Ø¬Ø²Ø¦ÙŠØ© Ù„Ù„Ø·Ù„Ø§Ø¨ Ø§Ù„Ø¹Ø±Ø§Ù‚ÙŠÙŠÙ†.',
    descKU: 'Ú¯Û•Ú•Ø§Ù† Ø¨Û•Ø¯ÙˆØ§ÛŒ Ù…Ù†Ø­Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ ØªÛ•ÙˆØ§Ùˆ Ùˆ Ø¨Û•Ø´Û•Ú©Û•ÛŒ Ø¨Û† Ù‚ÙˆØªØ§Ø¨ÛŒØ§Ù†ÛŒ Ø¹ÛŽØ±Ø§Ù‚.',
    endpoint: 'opportunities',
    categoryValue: 'scholarship',
    isOpportunity: true
  },
  job: {
    emoji: 'ðŸ’¼',
    titleEN: 'Job Opportunities',
    titleAR: 'ÙØ±Øµ Ø§Ù„Ø¹Ù…Ù„ ÙˆØ§Ù„ØªÙˆØ¸ÙŠÙ',
    titleKU: 'Ù‡Û•Ù„ÛŒ Ú©Ø§Ø±',
    descEN: 'Browse full-time, part-time, and graduate job positions in Iraq.',
    descAR: 'ØªØµÙØ­ Ø§Ù„ÙˆØ¸Ø§Ø¦Ù Ø¨Ø¯ÙˆØ§Ù… ÙƒØ§Ù…Ù„ ÙˆØ¬Ø²Ø¦ÙŠ ÙˆÙØ±Øµ Ø§Ù„Ø®Ø±ÙŠØ¬ÙŠÙ† ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚.',
    descKU: 'Ú¯Û•Ú•Ø§Ù† Ø¨Û•Ø¯ÙˆØ§ÛŒ Ù‡Û•Ù„ÛŒ Ú©Ø§Ø± Ø¨Û• Ø´ÛŽÙˆÛ•ÛŒ Ù‡Û•Ù…ÛŒØ´Û•ÛŒÛŒ ÛŒØ§Ù† Ú©Ø§ØªÛŒ.',
    endpoint: 'opportunities',
    categoryValue: 'job',
    isOpportunity: true
  },
  internship: {
    emoji: 'âš™ï¸',
    titleEN: 'Internships',
    titleAR: 'ÙØ±Øµ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ ÙˆØ§Ù„ØªØ£Ù‡ÙŠÙ„',
    titleKU: 'Ù…Û•Ø´Ù‚Û•Ú©Ø§Ù†',
    descEN: 'Gain real-world experience through structured internships at organizations.',
    descAR: 'Ø§ÙƒØªØ³Ø¨ ØªØ¬Ø±Ø¨Ø© Ø­Ù‚ÙŠÙ‚ÙŠØ© Ù…Ù† Ø®Ù„Ø§Ù„ Ø¨Ø±Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨Ø§Øª Ø¹Ù…Ù„ÙŠØ© Ù…Ù…ÙŠØ²Ø© ÙÙŠ Ù…Ø¤Ø³Ø³Ø§Øª Ø¹Ø±Ø§Ù‚ÙŠØ©.',
    descKU: 'Ø¨Û•Ø¯Û•Ø³ØªÙ‡ÛŽÙ†Ø§Ù†ÛŒ Ø¦Û•Ø²Ù…ÙˆÙˆÙ†ÛŒ Ú•Ø§Ø³ØªÛ•Ù‚ÛŒÙ†Û• Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Ù…Û•Ø´Ù‚ÛŒ Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§Ú©Ø§Ù†Û•ÙˆÛ•.',
    endpoint: 'opportunities',
    categoryValue: 'internship',
    isOpportunity: true
  },
  training: {
    emoji: 'ðŸ«',
    titleEN: 'Trainings',
    titleAR: 'Ø§Ù„ØªØ¯Ø±ÙŠØ¨Ø§Øª ÙˆØ¨Ù†Ø§Ø¡ Ø§Ù„Ù…Ù‡Ø§Ø±Ø§Øª',
    titleKU: 'Ú•Ø§Ù‡ÛŽÙ†Ø§Ù†Û•Ú©Ø§Ù†',
    descEN: 'Build practical technical and soft skills through local bootcamps & courses.',
    descAR: 'Ø·ÙˆØ± Ù…Ù‡Ø§Ø±Ø§ØªÙƒ Ø§Ù„ØªÙ‚Ù†ÙŠØ© ÙˆØ§Ù„Ø´Ø®ØµÙŠØ© Ù…Ù† Ø®Ù„Ø§Ù„ Ø§Ù„Ù…Ø¹Ø³ÙƒØ±Ø§Øª Ø§Ù„ØªØ¯Ø±ÙŠØ¨ÙŠØ© ÙˆØ§Ù„Ø¯ÙˆØ±Ø§Øª Ø§Ù„Ù…Ø­Ù„ÙŠØ©.',
    descKU: 'Ø¨Ù†ÛŒØ§ØªÙ†Ø§Ù†ÛŒ Ú©Ø§Ø±Ø§Ù…Û•ÛŒÛŒÛ•Ú©Ø§Ù† Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Ø®ÙˆÙ„ÛŒ Ú•Ø§Ù‡ÛŽÙ†Ø§Ù† Ùˆ ÙˆÛ†Ø±Ú©Ø´Û†Ù¾ÛŒ Ø¬Û†Ø±Ø§ÙˆØ¬Û†Ø±Û•ÙˆÛ•.',
    endpoint: 'opportunities',
    categoryValue: 'training',
    isOpportunity: true
  },
  fellowship: {
    emoji: 'ðŸŒŸ',
    titleEN: 'Fellowships',
    titleAR: 'Ø§Ù„Ø²Ù…Ø§Ù„Ø§Øª Ø§Ù„Ø¨Ø­Ø«ÙŠØ©',
    titleKU: 'Ø²Û•Ù…Ø§Ù„Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù†',
    descEN: 'Discover elite research fellowship programs and academic exchanges.',
    descAR: 'Ø§ÙƒØªØ´Ù Ø¨Ø±Ø§Ù…Ø¬ Ø§Ù„Ø²Ù…Ø§Ù„Ø§Øª Ø§Ù„Ø¨Ø­Ø«ÙŠØ© ÙˆØ§Ù„ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ Ø§Ù„Ù…ØªÙ…ÙŠØ²Ø©.',
    descKU: 'Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ø¨Û•Ø±Ù†Ø§Ù…Û• Ø¬ÛŒØ§ÙˆØ§Ø²Û•Ú©Ø§Ù†ÛŒ Ø²Û•Ù…Ø§Ù„Û•ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ùˆ Ú¯Û†Ú•ÛŒÙ†Û•ÙˆÛ•ÛŒ Ú©Ù„ØªÙˆØ±ÛŒ.',
    endpoint: 'opportunities',
    categoryValue: 'fellowship',
    isOpportunity: true
  },
  volunteering: {
    emoji: 'ðŸ¤',
    titleEN: 'Volunteering',
    titleAR: 'Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„ØªØ·ÙˆØ¹ÙŠ',
    titleKU: 'Ú©Ø§Ø±ÙˆØ¨Ø§Ø±ÛŒ Ø®Û†Ø¨Û•Ø®Ø´ÛŒ',
    descEN: 'Give back to your community and develop teamwork leadership skills.',
    descAR: 'Ø³Ø§Ù‡Ù… ÙÙŠ Ø®Ø¯Ù…Ø© Ù…Ø¬ØªÙ…Ø¹Ùƒ ÙˆØ·ÙˆÙ‘Ø± Ù…Ù‡Ø§Ø±Ø§Øª Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØ§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø¬Ù…Ø§Ø¹ÙŠ Ù„Ø¯ÙŠÙƒ.',
    descKU: 'Ø®Ø²Ù…Û•ØªÚ©Ø±Ø¯Ù†ÛŒ Ú©Û†Ù…Û•ÚµÚ¯Û• Ù„Û• Ú•ÛŽÚ¯Û•ÛŒ Ú©Ø§Ø±Û• Ø®Û†Ø¨Û•Ø®Ø´ÛŒÛŒÛ• Ø¬ÛŒØ§ÙˆØ§Ø²Û•Ú©Ø§Ù†Û•ÙˆÛ•.',
    endpoint: 'opportunities',
    categoryValue: 'volunteering',
    isOpportunity: true
  },
  competition: {
    emoji: 'ðŸ†',
    titleEN: 'Competitions',
    titleAR: 'Ø§Ù„Ù…Ø³Ø§Ø¨Ù‚Ø§Øª ÙˆØ§Ù„Ø¬ÙˆØ§Ø¦Ø²',
    titleKU: 'Ù¾ÛŽØ´Ø¨Ú•Ú©ÛŽÚ©Ø§Ù†',
    descEN: 'Challenge yourself in hackathons, project fairs, and academic matches.',
    descAR: 'ØªØ­Ø¯ Ù†ÙØ³Ùƒ ÙÙŠ Ø§Ù„Ù‡Ø§ÙƒØ§Ø«ÙˆÙ†Ø§Øª Ø§Ù„Ø¹ÙØ±Ø§Ù‚ÙŠØ©ØŒ Ù…Ø¹Ø§Ø±Ø¶ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ØŒ ÙˆØ§Ù„Ù…Ø³Ø§Ø¨Ù‚Ø§Øª Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©.',
    descKU: 'Ø¨Û•Ø´Ø¯Ø§Ø±ÛŒ Ù„Û• Ù¾ÛŽØ´Ø¨Ú•Ú©ÛŽ Ùˆ Ù‡Ø§ÙƒØ§ØªÛ†Ù†Û• Ø¬Û†Ø±Ø§ÙˆØ¬Û†Ø±Û• Ø²Ø§Ù†Ø³ØªÛŒÛŒÛ•Ú©Ø§Ù† Ø¨Ú©Û•.',
    endpoint: 'opportunities',
    categoryValue: 'competition',
    isOpportunity: true
  },
  event: {
    emoji: 'ðŸŽŸï¸',
    titleEN: 'Campus Events',
    titleAR: 'Ø§Ù„ÙØ¹Ø§Ù„ÙŠØ§Øª ÙˆØ§Ù„Ù…Ø¤ØªÙ…Ø±Ø§Øª',
    titleKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ•Ú©Ø§Ù†',
    descEN: 'Stay updated on upcoming seminars, festivals, and student gatherings.',
    descAR: 'Ø§Ø¨Ù‚ÙŽ Ø¹Ù„Ù‰ Ø§Ø·Ù„Ø§Ø¹ Ø¹Ù„Ù‰ Ø§Ù„Ù†Ø¯ÙˆØ§ØªØŒ Ø§Ù„Ù…Ù‡Ø±Ø¬Ø§Ù†Ø§ØªØŒ ÙˆØ§Ù„Ù„Ù‚Ø§Ø¡Ø§Øª Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠØ© Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©.',
    descKU: 'Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ú©Û†Ù†ÙØ±Ø§Ù†Ø³ Ùˆ ÙÛŒØ³ØªÛŒÚ¤Ø§ÚµÛ• Ø¬Û†Ø±Ø§ÙˆØ¬Û†Ø±Û•Ú©Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†.',
    endpoint: 'highlights',
    categoryValue: 'event',
    isOpportunity: false
  },
  news: {
    emoji: 'ðŸ“°',
    titleEN: 'University News',
    titleAR: 'Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª',
    titleKU: 'Ù‡Û•ÙˆØ§ÚµÛ•Ú©Ø§Ù†ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†',
    descEN: 'Official and social campus updates, research highlights, and notices.',
    descAR: 'Ø¢Ø®Ø± Ø§Ù„Ø£Ø®Ø¨Ø§Ø± Ø§Ù„Ø±Ø³Ù…ÙŠØ© ÙˆØ§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©ØŒ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²Ø§ØªØŒ ÙˆØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚.',
    descKU: 'Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ù†ÙˆÛŽØªØ±ÛŒÙ† Ù‡Û•ÙˆØ§Úµ Ùˆ Ú•ÙˆÙˆØ¯Ø§ÙˆÛ• Ø¦Û•Ú©Ø§Ø¯ÛŒÙ…ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø²Û†Ø±ÛŒÙ†Û•ÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†.',
    endpoint: 'highlights',
    categoryValue: 'news',
    isOpportunity: false
  },
  announcement: {
    emoji: 'ðŸ“¢',
    titleEN: 'Announcements',
    titleAR: 'Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø§Ù„Ø±Ø³Ù…ÙŠØ©',
    titleKU: 'Ú•Ø§Ú¯Û•ÛŒØ§Ù†Ø¯Ù†Û• ÙÛ•Ø±Ù…ÛŒÛŒÛ•Ú©Ø§Ù†',
    descEN: 'Important admin alerts, schedule adjustments, and ministry directives.',
    descAR: 'Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø¥Ø¯Ø§Ø±ÙŠØ© Ø§Ù„Ù‡Ø§Ù…Ø©ØŒ Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª Ø§Ù„ÙˆØ²Ø§Ø±ÙŠØ©ØŒ ÙˆØªØ¹Ø¯ÙŠÙ„Ø§Øª Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠØ©.',
    descKU: 'Ø¦Ø§Ú¯Ø§Ø¯Ø§Ø±Ú©Ø±Ø¯Ù†Û•ÙˆÛ• ÙÛ•Ø±Ù…ÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø³Û•Ø±Û†Ú©Ø§ÛŒÛ•ØªÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù† Ùˆ ÙˆÛ•Ø²Ø§Ø±Û•Øª.',
    endpoint: 'highlights',
    categoryValue: 'announcement',
    isOpportunity: false
  },
  exam: {
    emoji: 'ðŸ“',
    titleEN: 'Exams & Results',
    titleAR: 'Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª ÙˆØ§Ù„Ù†ØªØ§Ø¦Ø¬',
    titleKU: 'ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù†',
    descEN: 'Schedules, regulations, exam preparations, and official results links.',
    descAR: 'Ø¬Ø¯Ø§ÙˆÙ„ Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§ØªØŒ Ø§Ù„Ø¶ÙˆØ§Ø¨Ø· ÙˆØ§Ù„ØªØ¹Ù„ÙŠÙ…Ø§ØªØŒ ÙˆÙ…Ø³ØªÙ†Ø¯Ø§Øª Ø§Ù„ØªØ­Ø¶ÙŠØ± ÙˆØ§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ø±Ø³Ù…ÙŠØ©.',
    descKU: 'Ø®Ø´ØªÛ•ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù† Ùˆ Ø¦Û•Ù†Ø¬Ø§Ù…Û• ÙÛ•Ø±Ù…ÛŒÛŒÛ• Ú¯Ø´ØªÛŒÛŒÛ•Ú©Ø§Ù†ÛŒ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†.',
    endpoint: 'highlights',
    categoryValue: 'exam',
    isOpportunity: false
  },
  registration: {
    emoji: 'ðŸ“Œ',
    titleEN: 'Admissions & Registration',
    titleAR: 'Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙˆØ§Ù„Ù‚Ø¨ÙˆÙ„Ø§Øª',
    titleKU: 'ØªÛ†Ù…Ø§Ø±Ú©Ø±Ø¯Ù† Ùˆ ÙˆÛ•Ø±Ú¯Ø±ØªÙ†',
    descEN: 'New admissions guidelines, tuition registration steps, and directories.',
    descAR: 'Ø®Ø·ÙˆØ§Øª ØªÙ‚Ø¯ÙŠÙ… Ø§Ù„Ù‚Ø¨ÙˆÙ„ Ø§Ù„Ù…Ø±ÙƒØ²ÙŠ ÙˆØ§Ù„Ù…Ø³Ø§Ø¦ÙŠØŒ ÙˆÙ…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ù„Ù„Ø¹Ø§Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯.',
    descKU: 'Ú•ÛŽØ¨Û•Ø±ÛŒ ÙˆÛ•Ø±Ú¯Ø±ØªÙ† Ù„Û• Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù† Ùˆ Ú©Ø§ØªÛ•Ú©Ø§Ù†ÛŒ Ø¯Û•Ø³ØªÙ¾ÛŽÚ©Ø±Ø¯Ù†ÛŒ Ù†Ø§ÙˆÙ†ÙˆÙˆØ³ÛŒÙ†.',
    endpoint: 'highlights',
    categoryValue: 'registration',
    isOpportunity: false
  },
  student_club: {
    emoji: 'ðŸ‘¥',
    titleEN: 'Student Clubs & Orgs',
    titleAR: 'Ù†ÙˆØ§Ø¯ÙŠ ÙˆÙ…Ø¬Ù…ÙˆØ¹Ø§Øª Ø§Ù„Ø·Ù„Ø§Ø¨',
    titleKU: 'ÛŒØ§Ù†Û• Ùˆ Ú¯Ø±ÙˆÙˆÙ¾Û•Ú©Ø§Ù†',
    descEN: 'Join computer science, debate, theater, and creative student societies.',
    descAR: 'Ø§Ù†Ø¶Ù… Ù„Ù†ÙˆØ§Ø¯ÙŠ Ø§Ù„Ø¨Ø±Ù…Ø¬Ø©ØŒ Ø§Ù„Ù…Ù†Ø§Ø¸Ø±Ø§ØªØŒ Ø§Ù„ÙÙ†ÙˆÙ†ØŒ ÙˆØ§Ù„Ø¬Ù…Ø¹ÙŠØ§Øª Ø§Ù„Ø¹Ù„Ù…ÙŠØ© Ø¨Ø¬Ø§Ù…Ø¹ØªÙƒ.',
    descKU: 'Ø¨Û•Ø´Ø¯Ø§Ø±ÛŒ Ù„Û• Ú¯Ø±ÙˆÙˆÙ¾Û• Ø¬ÛŒØ§ÙˆØ§Ø²Û•Ú©Ø§Ù†ÛŒ Ø²Ø§Ù†Ø³ØªÛŒØŒ ØªÛ•Ú©Ù†Û•Ù„Û†Ú˜ÛŒ Ùˆ Ú©Ù„ØªÙˆØ±ÛŒ Ø¨Ú©Û•.',
    endpoint: 'highlights',
    categoryValue: 'student_club',
    isOpportunity: false
  },
  activity: {
    emoji: 'ðŸƒ',
    titleEN: 'Campus Activities',
    titleAR: 'Ø§Ù„Ø£Ù†Ø´Ø·Ø© Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠØ© ÙˆØ§Ù„Ø±ÙŠØ§Ø¶ÙŠØ©',
    titleKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ• Ù…Û•ÛŒØ¯Ø§Ù†ÛŒÛŒÛ•Ú©Ø§Ù†',
    descEN: 'Register for sports tourneys, art galleries, and environmental campaigns.',
    descAR: 'Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ø¨Ø·ÙˆÙ„Ø§Øª Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ©ØŒ Ù…Ø¹Ø§Ø±Ø¶ Ø§Ù„ÙÙ†ÙˆÙ†ØŒ ÙˆØ­Ù…Ù„Ø§Øª Ø§Ù„ØªØ´Ø¬ÙŠØ± ÙˆØ§Ù„ØªØ¨Ø±Ø¹.',
    descKU: 'Ú†Ø§Ù„Ø§Ú©ÛŒÛŒÛ• ÙˆÛ•Ø±Ø²Ø´ÛŒØŒ Ù‡ÙˆÙ†Û•Ø±ÛŒ Ùˆ Ú˜ÛŒÙ†Ú¯Û•ÛŒÛŒÛ• Ø¬ÛŒØ§ÙˆØ§Ø²Û•Ú©Ø§Ù† Ù„Û• Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†.',
    endpoint: 'highlights',
    categoryValue: 'activity',
    isOpportunity: false
  }
};

export default function SectionView({
  sectionId,
  language,
  selectedGov,
  setSelectedGov,
  selectedUni,
  setSelectedUni,
  onBackToHome,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false
}: SectionViewProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Normalize sectionId to config keys (e.g. h_news -> news, scholarships -> scholarship)
  const lookupKey = sectionId.startsWith('h_') ? sectionId.substring(2) : sectionId;
  const normalizedKey = lookupKey === 'news' || lookupKey === 'announcements' ? 'news' : 
                        lookupKey === 'jobs' ? 'job' :
                        lookupKey === 'scholarships' ? 'scholarship' :
                        lookupKey === 'internships' ? 'internship' :
                        lookupKey === 'trainings' ? 'training' :
                        lookupKey === 'fellowships' ? 'fellowship' :
                        lookupKey === 'competitions' ? 'competition' :
                        lookupKey === 'clubs' ? 'student_club' :
                        lookupKey;

  const categoryConfig = categoryConfigs[normalizedKey] || categoryConfigs['news'];

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const queryEndpoint = categoryConfig.endpoint;
        const targetVal = categoryConfig.categoryValue;
        
        // Construct query parameters elegantly following user specs
        const params = new URLSearchParams();
        
        // Category filtering
        params.append('category', targetVal);

        // 2. Governorate filtering
        if (selectedGov && selectedGov !== 'all') {
          params.append('governorate', selectedGov);
        }

        // 3. University / Institution filtering
        if (selectedUni && selectedUni !== 'all') {
          params.append('university_id', selectedUni);
          params.append('institution_id', selectedUni);
        }

        // 4. Default Limits
        params.append('limit', '50');

        const response = await fetch(`${BACKEND_URL}/api/${queryEndpoint}?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        if (active) {
          const items = queryEndpoint === 'opportunities'
            ? data?.opportunities
            : data?.highlights;
          if (Array.isArray(items)) {
            // Apply client-side filtering by category value as safety guarantee
            let filteredResults = items.filter((item: any) => {
              const itemType = item.category || item.type || '';
              // Match standard category or direct type
              return itemType.toLowerCase() === targetVal.toLowerCase() || 
                     (targetVal === 'news' && itemType.toLowerCase() === 'announcement') ||
                     (targetVal === 'announcement' && itemType.toLowerCase() === 'official_announcement') ||
                     (targetVal === 'student_club' && itemType.toLowerCase() === 'study_group');
            });

            // Map standard FeedItem objects
            const mapped = filteredResults.map((item: any) => {
              return {
                id: item.id || `scraped-${Date.now()}-${Math.random()}`,
                type: (item.category || item.type || categoryConfig.categoryValue) as any,
                titleEN: item.titleEN || item.title || 'Untitled Opportunity',
                titleAR: item.titleAR || item.title || 'ÙØ±ØµØ© ØºÙŠØ± Ù…Ø¹Ù†ÙˆÙ†Ø©',
                titleKU: item.titleKU || item.title || 'Ù‡Û•Ù„ÛŒ Ø¨ÛŽ Ù†Ø§ÙˆÙ†ÛŒØ´Ø§Ù†',
                contentEN: item.contentEN || item.content || 'Check original portal for instructions.',
                contentAR: item.contentAR || item.content || 'ÙŠØ±Ø¬Ù‰ Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø£ØµÙ„ÙŠ Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„ØªÙ‚Ø¯ÙŠÙ….',
                contentKU: item.contentKU || item.content || 'ØªÚ©Ø§ÛŒÛ• Ø³Û•Ø±Ú†Ø§ÙˆÛ•ÛŒ Ø³Û•Ø±Û•Ú©ÛŒ Ø¨Ø¨ÛŒÙ†Û• Ø¨Û† Ø²Ø§Ù†ÛŒØ§Ø±ÛŒ.',
                
                // Add high-end translation support fields
                original_language: item.original_language || item.originalLanguage,
                title_original: item.title_original || item.titleOriginal,
                body_original: item.body_original || item.bodyOriginal || item.content_original || item.contentOriginal,
                caption_original: item.caption_original || item.captionOriginal,
                title_ar: item.title_ar || item.titleAR,
                body_ar: item.body_ar || item.bodyAR || item.content_ar || item.contentAR,
                caption_ar: item.caption_ar || item.captionAR,
                title_ku: item.title_ku || item.titleKU,
                body_ku: item.body_ku || item.bodyKU || item.content_ku || item.contentKU,
                caption_ku: item.caption_ku || item.captionKU,
                title_en: item.title_en || item.titleEN,
                body_en: item.body_en || item.bodyEN || item.content_en || item.contentEN,
                caption_en: item.caption_en || item.captionEN,
                author: {
                  name: item.organization || item.institution_name || item.author?.name || 'Academic Center',
                  role: 'institution' as const,
                  avatar: item.author?.avatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100',
                  verified: true
                },
                date: item.published_date ? `Posted on ${item.published_date}` : 'Recently scraped ðŸ””',
                likes: item.likes || 10,
                commentsCount: 0,
                commentsList: [],
                governorateId: item.governorateId || item.governorate || 'all',
                universityId: item.universityId || item.university_id || 'all',
                tags: item.tags || [categoryConfig.categoryValue, 'Iraq'],
                imageUrl: item.imageUrl || item.image_url || undefined,
                application_link: item.application_link || item.apply_url || item.source_url || undefined,
                deadline: item.deadline || undefined,
                company: item.organization || item.institution_name || undefined,
                location: item.location || item.city || 'Iraq',
                whoCanApply: item.eligibility || item.whoCanApply || undefined,
                salary: item.salary || item.salary_or_funding || undefined,
                workplaceType: item.workplaceType || undefined,
                savedByUser: false,
                likedByUser: false
              };
            });
            setItems(mapped);
          } else {
            setItems([]);
          }
        }
      } catch (err: any) {
        console.error('Fetch section error:', err);
        if (active) {
          setErrorStatus(err.message || 'Error loading live feed');
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [normalizedKey, selectedGov, selectedUni]);

  // Apply visual governorate and university filtering
  const filteredItems = items.filter(item => {
    const matchesGov = selectedGov === 'all' || !item.governorateId || item.governorateId === 'all' || item.governorateId === selectedGov;
    const matchesUni = selectedUni === 'all' || !item.universityId || item.universityId === 'all' || item.universityId === selectedUni;
    return matchesGov && matchesUni;
  });

  const availableUnis = selectedGov === 'all' 
    ? IraqiUniversities 
    : IraqiUniversities.filter(u => u.governorateId === selectedGov);

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <div className="px-3.5 py-4 max-w-lg mx-auto flex flex-col pb-24 bg-[#0B1020]" id="section-view-container">
      
      {/* Back to Home Header button */}
      <div className="mb-4 flex items-center justify-between" id="section-back-bar">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121B2E] border border-[#1F2E4D] text-slate-200 text-xs font-black cursor-pointer shadow-sm hover:bg-[#1C2C4E] hover:text-[#FFD21F] active:scale-95 transition-all select-none"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>
            {language === 'ar' ? 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' : language === 'ku' ? 'Ú¯Û•Ú•Ø§Ù†Û•ÙˆÛ• Ø¨Û† Ø³Û•Ø±Û•Ú©ÛŒ' : 'Back to Home'}
          </span>
        </button>

        <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 font-black">
          {categoryConfig.isOpportunity ? 'OPPORTUNITY' : 'CAMPUS FEED'}
        </span>
      </div>

      {/* Title & Headline Header */}
      <div className="mb-5 border-l-4 border-[#FFD21F] pl-3.5 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-3.5 pb-1">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <span className="text-2xl">{categoryConfig.emoji}</span>
          <span>
            {language === 'ar' ? categoryConfig.titleAR : language === 'ku' ? categoryConfig.titleKU : categoryConfig.titleEN}
          </span>
        </h1>
        <p className="text-slate-400 text-[11px] leading-tight mt-1.5 font-medium">
          {language === 'ar' ? categoryConfig.descAR : language === 'ku' ? categoryConfig.descKU : categoryConfig.descEN}
        </p>
      </div>

      {/* 3. Filter Row: Side by Side Governorate & Academic Institution dropdowns */}
      <div className="grid grid-cols-2 gap-3.5 mb-5 select-none animate-fadeIn" id="section-filter-row">
        
        {/* Governorate filter select */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#121B2E] border border-[#1F2E4D] hover:border-cyan-500/30 transition-all shadow-sm">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedGov}
            onChange={(e) => {
              setSelectedGov(e.target.value);
              setSelectedUni('all'); // Clear specific university when governorate shifts
            }}
            className="w-full text-xs font-black bg-transparent text-slate-100 border-none focus:outline-none cursor-pointer outline-none overflow-hidden"
          >
            <option value="all" className="bg-[#121B2E] text-white">ðŸ“ {language === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª' : language === 'ku' ? 'Ù‡Û•Ù…ÙˆÙˆ Ù¾Ø§Ø±ÛŽØ²Ú¯Ø§Ú©Ø§Ù†' : 'All Governorates'}</option>
            {IraqiGovernorates.map((gov) => (
              <option key={gov.id} value={gov.id} className="bg-[#121B2E] text-white">
                {language === 'ar' ? gov.nameAR : language === 'ku' ? gov.nameKU : gov.nameEN}
              </option>
            ))}
          </select>
        </div>

        {/* University filter select */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-[#121B2E] border border-[#1F2E4D] hover:border-cyan-500/30 transition-all shadow-sm">
          <School className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="w-full text-xs font-black bg-transparent text-slate-100 border-none focus:outline-none cursor-pointer outline-none overflow-hidden"
          >
            <option value="all" className="bg-[#121B2E] text-white">ðŸ« {language === 'ar' ? 'ÙƒÙ„ Ø§Ù„Ø¬Ø§Ù…Ø¹Ø§Øª' : language === 'ku' ? 'Ù‡Û•Ù…ÙˆÙˆ Ø²Ø§Ù†Ú©Û†Ú©Ø§Ù†' : 'All Institutions'}</option>
            {availableUnis.map((uni) => (
              <option key={uni.id} value={uni.id} className="bg-[#121B2E] text-white">
                {uni.logo} {language === 'ar' ? uni.nameAR : language === 'ku' ? uni.nameKU : uni.nameEN}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main cards layout / loading list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3" id="section-loading-screen">
          <Loader2 className="w-8 h-8 text-[#FFD21F] animate-spin" />
          <span className="text-xs text-slate-400 font-extrabold animate-pulse">
            {language === 'ar' ? 'Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ÙØ±Øµ ÙˆØ§Ù„Ø£Ø®Ø¨Ø§Ø±...' : language === 'ku' ? 'Ø¨Ø§Ø±Ú©Ø±Ø¯Ù†ÛŒ Ø¯Û•Ø±ÙÛ•ØªÛ•Ú©Ø§Ù†...' : 'Fetching sector items from server...'}
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-[#121B2E] rounded-3xl border border-[#1F2E4D] border-dashed text-center shadow-lg" id="section-empty-container">
          <div className="w-12 h-12 rounded-full bg-slate-950/40 flex items-center justify-center text-xl mb-3.5 border border-[#1F2E4D]">
            {categoryConfig.emoji}
          </div>
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
            {language === 'ar' ? 'Ø§Ù„Ù‚Ø³Ù… ÙØ§Ø±Øº' : 'Section Empty'}
          </p>
          <p className="text-xs leading-relaxed text-slate-450 text-[#94A3B8]/90 max-w-[280px]">
            {language === 'ar' 
              ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¹Ù†Ø§ØµØ± Ø­Ø§Ù„ÙŠØ§Ù‹ Ù„Ù‡Ø°Ø§ Ø§Ù„Ù‚Ø³Ù…' 
              : language === 'ku' 
              ? 'Ø¦ÛŽØ³ØªØ§ Ù‡ÛŒÚ† Ø¨Ø§Ø¨Û•ØªÛŽÚ© Ø¨Û† Ø¦Û•Ù… Ø¨Û•Ø´Û• Ù†ÛŒÛŒÛ•' 
              : 'No items available in this section yet'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5" id="section-cards-feed">
          {filteredItems.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              language={language}
              onLike={onLike}
              onSave={onSave}
              onVote={onVote}
              onApply={onApply}
              onRsvp={onRsvp}
              onJoinGroup={onJoinGroup}
              onAddComment={onAddComment}
              onEditFeedItem={onEditFeedItem}
              onDeleteFeedItem={onDeleteFeedItem}
              isAdminMode={isAdminMode}
            />
          ))}
        </div>
      )}

    </div>
  );
}

