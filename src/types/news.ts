export interface News {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  category: string;
  content: string;
  keywords: string[] | null;
  meta_description: string | null;
  canonical_url: string | null;
  key_points: string[] | null;
  editor_id: string | null;
  location: string | null;
  editors?: {
    name: string;
    position: string;
    bio?: string | null;
  } | null;
}

export interface LiveEvent {
  id: string;
  title: string;
  summary: string | null;
  main_image_url: string | null;
  category: string;
  status: 'active' | 'ended' | 'archived';
  created_at: string;
  updated_at: string;
  updates_count?: number;
}

export interface LiveEventUpdate {
  id: string;
  live_event_id: string;
  content: string;
  created_at: string;
  update_type: string;
  source_news_id: string | null;
}
