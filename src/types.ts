export interface SearchResultImage {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  author?: string;
  aspectRatio?: number;
  isVideo?: boolean;
  videoUrl?: string;
}

export type FeedMode = 'fill' | 'fit';

export type SearchSource = 'google' | 'unsplash' | 'all';

export interface SearchCategory {
  id: string;
  label: string;
  query: string;
  icon: string;
}
