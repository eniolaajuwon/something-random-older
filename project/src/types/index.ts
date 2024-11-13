export interface DateInputs {
  location: string;
  date: string;
  timeOfDay: string;
  interests: string;
  personality: string;
  budget: string;
  loveLanguage: string;
}

export interface Activity {
  title: string;
  time: string;
  location: string;
  description: string;
  considerations: string;
  weather: string;
  travel: string;
  cost: string;
  bookingUrl?: string;
}

export interface DateItinerary {
  id?: string;
  title: string;
  activities: Activity[];
  totalCost: string;
  savedAt?: string;
  inputs?: DateInputs;
}

export interface SearchHistory {
  id: string;
  location: string;
  date: string;
  timeOfDay: string;
  searchedAt: string;
  dateItineraryId?: string;
  dateTitle?: string;
}

export type Step = 'location' | 'datetime' | 'partner' | 'results' | 'saved';

export type LoveLanguage = 
  | 'words-of-affirmation'
  | 'acts-of-service'
  | 'receiving-gifts'
  | 'quality-time'
  | 'physical-touch';