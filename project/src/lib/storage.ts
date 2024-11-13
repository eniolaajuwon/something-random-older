import { DateItinerary, SearchHistory } from '@/types';

const STORAGE_KEY = 'saved_dates';
const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function saveDateItinerary(itinerary: DateItinerary): DateItinerary {
  const savedDates = getSavedDates();
  const dateToSave = {
    ...itinerary,
    id: itinerary.id || crypto.randomUUID(),
    savedAt: itinerary.savedAt || new Date().toISOString()
  };
  
  // Update or add the date
  const existingIndex = savedDates.findIndex(date => date.id === dateToSave.id);
  if (existingIndex !== -1) {
    savedDates[existingIndex] = dateToSave;
  } else {
    savedDates.unshift(dateToSave);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDates));
  return dateToSave;
}

export function getSavedDates(): DateItinerary[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function deleteSavedDate(id: string): void {
  const savedDates = getSavedDates().filter(date => date.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDates));

  // Update search history to remove references to the deleted date
  const searchHistory = getSearchHistory().map(search => 
    search.dateItineraryId === id ? { ...search, dateItineraryId: undefined, dateTitle: undefined } : search
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
}

export function searchSavedDates(query: string): DateItinerary[] {
  const savedDates = getSavedDates();
  const lowercaseQuery = query.toLowerCase();
  
  return savedDates.filter(date => 
    date.title.toLowerCase().includes(lowercaseQuery) ||
    date.activities.some(activity => 
      activity.title.toLowerCase().includes(lowercaseQuery) ||
      activity.location.toLowerCase().includes(lowercaseQuery)
    ) ||
    date.inputs?.location.toLowerCase().includes(lowercaseQuery)
  );
}

export function saveToSearchHistory(
  location: string, 
  date: string, 
  timeOfDay: string,
  dateItineraryId?: string,
  dateTitle?: string
): void {
  const searchHistory = getSearchHistory();
  
  const newSearch: SearchHistory = {
    id: crypto.randomUUID(),
    location,
    date,
    timeOfDay,
    searchedAt: new Date().toISOString(),
    dateItineraryId,
    dateTitle
  };

  searchHistory.unshift(newSearch);
  
  // Keep only the most recent searches
  while (searchHistory.length > MAX_HISTORY_ITEMS) {
    searchHistory.pop();
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
}

export function getSearchHistory(): SearchHistory[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function clearSearchHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}

export function deleteSearchHistoryItem(id: string): void {
  const searchHistory = getSearchHistory().filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
}