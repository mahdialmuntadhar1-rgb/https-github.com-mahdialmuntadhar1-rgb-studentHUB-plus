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
  {
    name: 'NCCI Iraq Jobs',
    nameAr: 'وظائف منظمات المجتمع المدني في العراق',
    category: 'ngojobs',
    website: 'ncciraqjobs.com',
    governorates: ['all'],
    tags: ['NGO Jobs', 'Humanitarian', 'All Iraq'],
  },
  {
    name: 'UN Jobs Iraq',
    nameAr: 'وظائف الأمم المتحدة في العراق',
    category: 'unjobs',
    website: 'unjobs.org/duty_stations/iraq',
    governorates: ['all'],
    tags: ['UN Jobs', 'International Organizations', 'All Iraq'],
  },
  {
    name: 'UN Careers',
    category: 'unjobs',
    website: 'careers.un.org',
    governorates: ['all'],
    tags: ['UN Jobs', 'Professional Jobs'],
  },
  {
    name: 'ReliefWeb Iraq Jobs',
    category: 'ngojobs',
    website: 'reliefweb.int/jobs?advanced-search=%28C104%29',
    governorates: ['all'],
    tags: ['NGO Jobs', 'Humanitarian', 'International'],
  },
  {
    name: 'Kurdistan Jobs',
    nameAr: 'وظائف إقليم كردستان',
    category: 'jobs',
    website: 'kurdistanjobs.com',
    governorates: ['Erbil', 'Sulaymaniyah', 'Duhok', 'Halabja'],
    tags: ['Kurdistan Jobs', 'Professional Jobs'],
  },
  {
    name: 'Iraq Jobs',
    nameAr: 'وظائف العراق',
    category: 'jobs',
    website: 'iraqjobs.com',
    governorates: ['all'],
    tags: ['General Job Board', 'All Iraq'],
  },
  {
    name: 'Bayt Iraq',
    category: 'jobs',
    website: 'bayt.com/en/iraq/jobs',
    governorates: ['all'],
    tags: ['General Job Board', 'Professional Jobs'],
  },
  {
    name: 'LinkedIn Jobs Iraq',
    category: 'jobs',
    website: 'linkedin.com/jobs/search/?location=Iraq',
    governorates: ['all'],
    tags: ['Professional Jobs', 'Recruitment Platform'],
  },
  {
    name: 'OpenSooq Jobs Iraq',
    nameAr: 'وظائف السوق المفتوح العراق',
    category: 'jobs',
    website: 'iq.opensooq.com/en/jobs',
    governorates: ['all'],
    tags: ['General Job Board', 'Local Jobs'],
  },
  {
    name: 'Foras Iraq',
    nameAr: 'فرص العراق',
    category: 'jobs',
    website: 'foras.iq',
    governorates: ['all'],
    tags: ['Recruitment Platform', 'Youth Jobs'],
  },
  {
    name: 'IOM Iraq Jobs',
    category: 'ngojobs',
    website: 'iraq.iom.int/careers',
    governorates: ['all'],
    tags: ['NGO Jobs', 'Migration', 'International Organizations'],
  },
  {
    name: 'Save the Children Iraq',
    category: 'ngojobs',
    website: 'savethechildren.net/careers',
    governorates: ['all'],
    tags: ['NGO Jobs', 'Humanitarian', 'Children'],
  },
  {
    name: 'IRC Careers Iraq',
    category: 'ngojobs',
    website: 'rescue.org/careers',
    governorates: ['all'],
    tags: ['NGO Jobs', 'Humanitarian'],
  },
  {
    name: 'Rumaila Careers',
    category: 'oilandgas',
    website: 'rumaila.iq/careers',
    governorates: ['Basra'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'Basra Oil Company',
    nameAr: 'شركة نفط البصرة',
    category: 'oilandgas',
    website: 'basraoil.gov.iq',
    governorates: ['Basra'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'bp Careers Iraq',
    category: 'oilandgas',
    website: 'bp.com/en/global/corporate/careers.html',
    governorates: ['Basra', 'all'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'SLB Careers Iraq',
    category: 'oilandgas',
    website: 'careers.slb.com',
    governorates: ['Basra', 'Erbil', 'all'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'Halliburton Careers Iraq',
    category: 'oilandgas',
    website: 'jobs.halliburton.com',
    governorates: ['Basra', 'Erbil', 'all'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'Baker Hughes Careers Iraq',
    category: 'oilandgas',
    website: 'careers.bakerhughes.com',
    governorates: ['Basra', 'all'],
    tags: ['Oil & Gas Jobs', 'Company Careers'],
  },
  {
    name: 'Trade Bank of Iraq Careers',
    nameAr: 'المصرف العراقي للتجارة',
    category: 'jobs',
    website: 'tbi.com.iq',
    governorates: ['all'],
    tags: ['Banking Careers', 'Company Careers'],
  },
  {
    name: 'Qi Card Careers',
    category: 'jobs',
    website: 'qi.iq',
    governorates: ['all'],
    tags: ['Company Careers', 'Fintech', 'Banking Careers'],
  },
  {
    name: 'Zain Iraq Careers',
    category: 'jobs',
    website: 'iq.zain.com/en/careers',
    governorates: ['all'],
    tags: ['Company Careers', 'Telecom'],
  },
  {
    name: 'Asiacell Careers',
    category: 'jobs',
    website: 'asiacell.com/careers',
    governorates: ['all'],
    tags: ['Company Careers', 'Telecom', 'Kurdistan Jobs'],
  },
  {
    name: 'Korek Telecom Careers',
    category: 'jobs',
    website: 'korektel.com/careers',
    governorates: ['Erbil', 'Sulaymaniyah', 'Duhok', 'all'],
    tags: ['Company Careers', 'Telecom', 'Kurdistan Jobs'],
  },
  {
    name: 'The Station Events',
    nameAr: 'فعاليات المحطة',
    category: 'events',
    website: 'the-station.iq',
    governorates: ['Baghdad'],
    tags: ['Events', 'Entrepreneurship', 'Students'],
  },
  {
    name: 'Five One Labs',
    category: 'events',
    website: 'fiveonelabs.org',
    governorates: ['Erbil', 'Sulaymaniyah', 'all'],
    tags: ['Events', 'Internships', 'Entrepreneurship'],
  },
  {
    name: 'Kapita Iraq',
    category: 'events',
    website: 'kapita.iq',
    governorates: ['Baghdad', 'all'],
    tags: ['Events', 'Internships', 'Entrepreneurship'],
  },
  {
    name: 'Iraq British Business Council',
    category: 'events',
    website: 'webuildiraq.org',
    governorates: ['Baghdad', 'Basra', 'all'],
    tags: ['Events', 'Professional Jobs', 'Business'],
  },
];
