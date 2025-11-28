export enum SectionType {
  NRF_NEWS = 'NRF_NEWS',
  SCI_TECH = 'SCI_TECH',
  HUMANITIES = 'HUMANITIES',
  UNI_SUPPORT = 'UNI_SUPPORT'
}

export interface NewsArticle {
  title: string;
  url: string;
  source?: string;
  snippet?: string;
  publishedDate?: string;
  date?: string; // Display date
}

export interface SectionConfig {
  id: SectionType;
  label: string;
  shortLabel: string;
  searchQuery: string;
  description: string;
  iconName: 'Building' | 'Atom' | 'BookOpen' | 'School'; // Lucide icon names mapping
}