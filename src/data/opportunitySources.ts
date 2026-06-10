export type Category =
  | 'jobs'
  | 'internships'
  | 'scholarships'
  | 'events'
  | 'ngojobs'
  | 'oilandgas'
  | 'unjobs';

export interface OpportunitySource {
  name: string;
  nameAr?: string;
  category: Category;
  website: string;
  governorates: string[];
  tags: string[];
}

export const opportunitySources: OpportunitySource[] = [
  { name: 'NCCI Iraq Jobs', nameAr: 'وظائف منظمات المجتمع المدني في العراق', category: 'ngojobs', website: 'ncciraqjobs.com', governorates: ['all'], tags: ['NGO Jobs', 'Humanitarian', 'All Iraq'] },
  { name: 'UN Jobs Iraq', nameAr: 'وظائف الأمم المتحدة في العراق', category: 'unjobs', website: 'unjobs.org/duty_stations/iraq', governorates: ['all'], tags: ['UN Jobs', 'International Organizations'] },
  { name: 'ReliefWeb Iraq Jobs', category: 'ngojobs', website: 'reliefweb.int/jobs?advanced-search=%28C104%29', governorates: ['all'], tags: ['NGO Jobs', 'Humanitarian'] },
  { name: 'Kurdistan Jobs', nameAr: 'وظائف إقليم كردستان', category: 'jobs', website: 'kurdistanjobs.com', governorates: ['Erbil', 'Sulaymaniyah', 'Duhok', 'Halabja'], tags: ['Kurdistan Jobs'] },
  { name: 'Iraq Jobs', nameAr: 'وظائف العراق', category: 'jobs', website: 'iraqjobs.com', governorates: ['all'], tags: ['General Job Board'] },
  { name: 'Bayt Iraq', category: 'jobs', website: 'bayt.com/en/iraq/jobs', governorates: ['all'], tags: ['Professional Jobs'] },
  { name: 'LinkedIn Jobs Iraq', category: 'jobs', website: 'linkedin.com/jobs/search/?location=Iraq', governorates: ['all'], tags: ['Recruitment Platform'] },
  { name: 'Foras Iraq', nameAr: 'فرص العراق', category: 'jobs', website: 'foras.iq', governorates: ['all'], tags: ['Youth Jobs'] },
  { name: 'IOM Iraq Jobs', category: 'ngojobs', website: 'iraq.iom.int/careers', governorates: ['all'], tags: ['NGO Jobs', 'Migration'] },
  { name: 'Rumaila Careers', category: 'oilandgas', website: 'rumaila.iq/careers', governorates: ['Basra'], tags: ['Oil & Gas Jobs'] },
  { name: 'Basra Oil Company', nameAr: 'شركة نفط البصرة', category: 'oilandgas', website: 'basraoil.gov.iq', governorates: ['Basra'], tags: ['Oil & Gas Jobs'] },
  { name: 'Zain Iraq Careers', category: 'jobs', website: 'iq.zain.com/en/careers', governorates: ['all'], tags: ['Telecom'] },
  { name: 'Asiacell Careers', category: 'jobs', website: 'asiacell.com/careers', governorates: ['all'], tags: ['Telecom'] },
  { name: 'Korek Telecom Careers', category: 'jobs', website: 'korektel.com/careers', governorates: ['Erbil', 'Sulaymaniyah', 'Duhok', 'all'], tags: ['Telecom'] },
  { name: 'The Station Events', nameAr: 'فعاليات المحطة', category: 'events', website: 'the-station.iq', governorates: ['Baghdad'], tags: ['Events', 'Entrepreneurship'] },
  { name: 'Five One Labs', category: 'events', website: 'fiveonelabs.org', governorates: ['Erbil', 'Sulaymaniyah', 'all'], tags: ['Events', 'Internships'] },
  { name: 'Kapita Iraq', category: 'events', website: 'kapita.iq', governorates: ['Baghdad', 'all'], tags: ['Events', 'Entrepreneurship'] },
];

