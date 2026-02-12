
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  UPLOAD = 'upload',
  PLAYER = 'player',
  SERIES_DETAIL = 'series_detail',
  NEWS = 'news'
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  videoUrl: string;
  sourceWebsite?: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
}

export interface Anime {
  id: string;
  title: string;
  descriptionHindi: string;
  descriptionEnglish: string;
  thumbnail: string;
  genres: string[];
  dubbed: boolean;
  subbed: boolean;
  isSeries: boolean;
  episodes?: Episode[];
  addedAt: number;
  sourceWebsite?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface NewsArticle {
  title: string;
  snippet: string;
  url: string;
  date?: string;
}
