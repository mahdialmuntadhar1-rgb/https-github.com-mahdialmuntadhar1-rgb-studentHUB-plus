export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  secondaryDark?: string;
  surface: string;
  softCard: string;
  border: string;
  text: string;
  mutedText: string;
  shadow: string;
  bgGradient?: string;
  cardText?: string;
}

export const brandingThemes: Theme[] = [
  {
    id: 'iraq-local',
    name: 'Iraq Premium Local 🇮🇶',
    primary: '#FF6B00', // Brand Orange
    secondary: '#0EA5E9', // Iraqi Cyan
    accent: '#F59E0B', // Warm Amber (Main CTA)
    background: '#070314', // Futuristic deep charcoal/black base
    secondaryDark: '#120703',
    surface: '#FFFFFF', // Clean White Card
    softCard: '#F8FAFC',
    border: 'rgba(255, 107, 0, 0.28)', // Futuristic warm orange border
    text: '#F3F4F6', // Readable light color over dark navy background
    mutedText: '#94A3B8', // Muted text for dark background
    shadow: '0 12px 30px -10px rgba(255, 107, 0, 0.14), 0 20px 42px -20px rgba(255, 107, 0, 0.06)',
    bgGradient: 'radial-gradient(circle at 50% 0%, rgba(255, 107, 0, 0.35) 0%, rgba(249, 115, 22, 0.15) 30%, rgba(13, 8, 30, 0.8) 75%, transparent 100%), radial-gradient(circle at 10% 80%, rgba(14, 165, 233, 0.12) 0%, transparent 50%), linear-gradient(180deg, #070314 0%, #120703 35%, #0B0401 70%, #030107 100%)',
    cardText: '#2D1A04' // Dark Navy-Brown text on white cards
  },
  {
    id: 'campus-sunrise',
    name: 'Campus Sunrise 🌅',
    primary: '#FF6B00',
    secondary: '#1D4ED8',
    accent: '#FF2E93',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    softCard: '#FFF1E6',
    border: '#FFD8B5',
    text: '#102033',
    mutedText: '#4B5563',
    shadow: '0 4px 15px rgba(255, 107, 0, 0.08)'
  },
  {
    id: 'future-blue',
    name: 'Future Blue 🚀',
    primary: '#2563EB',
    secondary: '#06B6D4',
    accent: '#F97316',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    softCard: '#EFF6FF',
    border: '#BFDBFE',
    text: '#0F172A',
    mutedText: '#475569',
    shadow: '0 4px 15px rgba(37, 99, 235, 0.08)'
  },
  {
    id: 'youth-violet',
    name: 'Youth Violet 🔮',
    primary: '#7C3AED',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    softCard: '#F3E8FF',
    border: '#DDD6FE',
    text: '#1E1B4B',
    mutedText: '#6B7280',
    shadow: '0 4px 15px rgba(124, 58, 237, 0.08)'
  },
  {
    id: 'basra-energy',
    name: 'Basra Energy 🌴',
    primary: '#FF7A00',
    secondary: '#0EA5E9',
    accent: '#22C55E',
    background: '#FFF8EB',
    surface: '#FFFFFF',
    softCard: '#FFF0D6',
    border: '#FED7AA',
    text: '#172033',
    mutedText: '#4B5563',
    shadow: '0 4px 15px rgba(255, 122, 0, 0.08)'
  },
  {
    id: 'academic-trust',
    name: 'Academic Trust 🎓',
    primary: '#0F4C81',
    secondary: '#2563EB',
    accent: '#FFB703',
    background: '#F3F7FB',
    surface: '#FFFFFF',
    softCard: '#EAF2FA',
    border: '#C7D7EA',
    text: '#0B1F33',
    mutedText: '#4B5F75',
    shadow: '0 4px 15px rgba(15, 76, 129, 0.08)'
  },
  {
    id: 'emerald-campus',
    name: 'Emerald Campus 🌿',
    primary: '#059669',
    secondary: '#0F766E',
    accent: '#F97316',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    softCard: '#DCFCE7',
    border: '#BBF7D0',
    text: '#052E2B',
    mutedText: '#374151',
    shadow: '0 4px 15px rgba(5, 150, 105, 0.08)'
  },
  {
    id: 'neon-student',
    name: 'Neon Student ⚡',
    primary: '#4F46E5',
    secondary: '#06B6D4',
    accent: '#F43F5E',
    background: '#F8FAFF',
    surface: '#FFFFFF',
    softCard: '#EEF2FF',
    border: '#C7D2FE',
    text: '#111827',
    mutedText: '#4B5563',
    shadow: '0 4px 15px rgba(79, 70, 229, 0.08)'
  },
  {
    id: 'rose-navy',
    name: 'Rose Navy 🌹',
    primary: '#E11D48',
    secondary: '#1E3A8A',
    accent: '#F59E0B',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    softCard: '#FFE4E6',
    border: '#FDA4AF',
    text: '#111827',
    mutedText: '#4B5563',
    shadow: '0 4px 15px rgba(225, 29, 72, 0.08)'
  },
  {
    id: 'kurdistan-fresh',
    name: 'Kurdistan Fresh☀️',
    primary: '#16A34A',
    secondary: '#DC2626',
    accent: '#FACC15',
    background: '#F7FEE7',
    surface: '#FFFFFF',
    softCard: '#ECFCCB',
    border: '#BEF264',
    text: '#1A2E05',
    mutedText: '#4B5320',
    shadow: '0 4px 15px rgba(22, 163, 74, 0.08)'
  }
];
