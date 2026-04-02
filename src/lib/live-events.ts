type NewsLike = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  category?: string | null;
  created_at?: string;
};

type RecentNewsRecord = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
};

type LiveEventRecord = {
  id: string;
  title: string;
  summary: string | null;
  main_image_url: string | null;
  category: string;
  status: 'active' | 'ended' | 'archived';
  created_at: string;
  updated_at: string;
};

type SupabaseLike = {
  from: (table: string) => any;
};

function buildNewsDetailsUrl(news: Pick<NewsLike, 'id' | 'slug'>) {
  if (news.slug && news.slug.trim().length > 0) {
    return `/news/${news.slug}`;
  }

  return `/news/${news.id}`;
}

function buildLiveUpdateContent(news: Pick<NewsLike, 'id' | 'slug' | 'title' | 'excerpt'>) {
  const summary = news.excerpt?.trim() || news.title;
  const detailsUrl = buildNewsDetailsUrl(news);

  return `${summary}<br /><br /><a href="${detailsUrl}" class="text-gold font-bold hover:underline">اقرأ التفاصيل الكاملة عبر الرابط</a>`;
}

export type LiveEventSuggestion = {
  title: string;
  summary: string;
  category: string;
  mainImageUrl: string | null;
  newsIds: string[];
  newsCount: number;
  latestCreatedAt: string;
  sampleTitles: string[];
};

export type ExistingLiveEventInput = {
  id: string;
  title: string;
  summary?: string | null;
  category?: string | null;
  keywords?: string[] | null;
};

const ARABIC_STOP_WORDS = new Set([
  'من', 'إلى', 'الى', 'على', 'عن', 'في', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك', 'هناك', 'هنا', 'بعد', 'قبل', 'خلال', 'حول',
  'بين', 'أمام', 'تحت', 'فوق', 'عبر', 'ضد', 'بسبب', 'بشأن', 'ضمن', 'عند', 'كان', 'كانت', 'يكون', 'تكون', 'تم', 'قد',
  'كما', 'لدى', 'لها', 'له', 'لهم', 'لنا', 'و', 'او', 'أو', 'ثم', 'أن', 'إن', 'الى', 'ما', 'لم', 'لن', 'هو', 'هي', 'هم',
  'السعودية', 'السعودي', 'السعوديه'
]);

const DEFENSE_INTERCEPTION_KEYWORDS = [
  'وزاره',
  'الدفاع',
  'اعتراض',
  'تعترض',
  'تدمير',
  'صاروخ',
  'صواريخ',
  'باليستي',
  'باليستيه',
  'مسيّره',
  'مسيره',
  'مسيّرات',
  'مسيرات',
  'هدف',
  'اهداف',
  'جويه',
  'الرياض',
];

function normalizeArabicText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeTopic(value: string) {
  return normalizeArabicText(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !ARABIC_STOP_WORDS.has(token));
}

function getTopicTokens(news: Pick<NewsLike, 'title' | 'excerpt'>) {
  const tokens = tokenizeTopic(`${news.title} ${news.excerpt ?? ''}`);
  return [...new Set(tokens)].slice(0, 12);
}

function getTopicLabel(news: Pick<NewsLike, 'title' | 'excerpt'>, related: RecentNewsRecord[]) {
  const tokenCounts = new Map<string, number>();
  const pool = [
    ...getTopicTokens(news),
    ...related.flatMap((item) => getTopicTokens(item)),
  ];

  for (const token of pool) {
    tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
  }

  const topTokens = [...tokenCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([token]) => token);

  if (topTokens.length === 0) {
    return news.title;
  }

  return topTokens.join(' ');
}

function createSuggestionFromGroup(group: RecentNewsRecord[]): LiveEventSuggestion | null {
  if (group.length < 3) {
    return null;
  }

  const sortedGroup = group.slice().sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
  const seed = sortedGroup[0];
  const title = getTopicLabel(seed, sortedGroup.slice(1));

  return {
    title,
    summary: seed.excerpt || seed.title,
    category: seed.category || 'local',
    mainImageUrl: seed.image_url || null,
    newsIds: sortedGroup.map((item) => item.id),
    newsCount: sortedGroup.length,
    latestCreatedAt: seed.created_at,
    sampleTitles: sortedGroup.slice(0, 3).map((item) => item.title),
  };
}

function groupNewsByTopic(items: RecentNewsRecord[]) {
  const groups: RecentNewsRecord[][] = [];

  for (const item of items) {
    let matchedGroup: RecentNewsRecord[] | null = null;

    for (const group of groups) {
      const hasMatch = group.some((candidate) => {
        if ((candidate.category || 'local') !== (item.category || 'local')) {
          return false;
        }

        return isSameTopic(item, candidate);
      });

      if (hasMatch) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      matchedGroup.push(item);
    } else {
      groups.push([item]);
    }
  }

  return groups;
}

function getSimilarityScore(leftTokens: string[], rightTokens: string[]) {
  const leftSet = new Set(leftTokens);
  const rightSet = new Set(rightTokens);
  const intersection = [...leftSet].filter((token) => rightSet.has(token)).length;
  const union = new Set([...leftSet, ...rightSet]).size;

  if (union === 0) {
    return 0;
  }

  return intersection / union;
}

function hasRequiredTopicOverlap(leftTokens: string[], rightTokens: string[]) {
  const overlap = leftTokens.filter((token) => rightTokens.includes(token));
  return overlap.length >= 2;
}

function countKeywordMatches(value: string, keywords: string[]) {
  const normalized = normalizeArabicText(value);
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function isDefenseInterceptionTopic(value: string) {
  return countKeywordMatches(value, DEFENSE_INTERCEPTION_KEYWORDS) >= 2;
}

function isSameTopic(news: Pick<NewsLike, 'title' | 'excerpt'>, candidate: RecentNewsRecord) {
  const newsTokens = getTopicTokens(news);
  const candidateTokens = getTopicTokens(candidate);
  const similarity = getSimilarityScore(newsTokens, candidateTokens);
  const newsText = `${news.title} ${news.excerpt ?? ''}`;
  const candidateText = `${candidate.title} ${candidate.excerpt ?? ''}`;

  if (isDefenseInterceptionTopic(newsText) && isDefenseInterceptionTopic(candidateText)) {
    return true;
  }

  return hasRequiredTopicOverlap(newsTokens, candidateTokens) && similarity >= 0.35;
}

function matchesEventTopic(event: ExistingLiveEventInput, news: RecentNewsRecord) {
  const eventText = `${event.title} ${event.summary ?? ''}`;
  const newsText = `${news.title} ${news.excerpt ?? ''}`;

  if (isDefenseInterceptionTopic(eventText) && isDefenseInterceptionTopic(newsText)) {
    return true;
  }

  // If event has explicit keywords, check if any keyword appears in the news text
  if (event.keywords && event.keywords.length > 0) {
    const normalizedNews = normalizeArabicText(newsText);
    const matchedKeywords = event.keywords.filter((kw) =>
      normalizedNews.includes(normalizeArabicText(kw))
    );
    if (matchedKeywords.length >= 1) {
      return true;
    }
  }

  const eventTokens = tokenizeTopic(`${event.title} ${event.summary ?? ''}`);
  const newsTokens = getTopicTokens(news);
  const similarity = getSimilarityScore(eventTokens, newsTokens);

  if (!hasRequiredTopicOverlap(eventTokens, newsTokens)) {
    return false;
  }

  if (similarity >= 0.2) {
    return true;
  }

  const normalizedEvent = normalizeArabicText(eventText);
  const normalizedNews = normalizeArabicText(newsText);

  return eventTokens.some((token) => normalizedEvent.includes(token) && normalizedNews.includes(token));
}

export function buildLiveEventSuggestions(items: RecentNewsRecord[]) {
  return groupNewsByTopic(items)
    .map((group) => createSuggestionFromGroup(group))
    .filter((group): group is LiveEventSuggestion => Boolean(group))
    .sort((left, right) => new Date(right.latestCreatedAt).getTime() - new Date(left.latestCreatedAt).getTime());
}

function findGroupForNews(items: RecentNewsRecord[], news: Pick<NewsLike, 'id' | 'title' | 'excerpt' | 'category' | 'created_at'>) {
  const groups = groupNewsByTopic(items);

  return groups.find((group) =>
    group.some((item) => item.id === news.id)
      || group.some((item) => (item.category || 'local') === (news.category || 'local') && isSameTopic(news, item))
  ) ?? null;
}

async function findMatchingLiveEvent(supabase: SupabaseLike, news: Pick<NewsLike, 'title' | 'excerpt' | 'category'>) {
  const { data, error } = await supabase
    .from('live_events')
    .select('id, title, summary, main_image_url, category, status, created_at, updated_at')
    .in('status', ['active', 'ended'])
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return null;
  }

  return (data as LiveEventRecord[]).find((event) => {
    if ((event.category || '') !== (news.category || 'local')) {
      return false;
    }

    return isSameTopic(news, {
      id: event.id,
      title: event.title,
      excerpt: event.summary,
      image_url: event.main_image_url,
      category: event.category,
      created_at: event.created_at,
    });
  }) ?? null;
}

async function createOrReuseLiveEvent(supabase: SupabaseLike, news: NewsLike, relatedNews: RecentNewsRecord[]) {
  const matchedEvent = await findMatchingLiveEvent(supabase, news);
  const now = new Date().toISOString();

  if (matchedEvent) {
    const { data, error } = await supabase
      .from('live_events')
      .update({
        status: 'active',
        updated_at: now,
        summary: matchedEvent.summary || news.excerpt || news.title,
        main_image_url: matchedEvent.main_image_url || news.image_url || null,
      })
      .eq('id', matchedEvent.id)
      .select('id, title, summary, main_image_url, category, status, created_at, updated_at')
      .single();

    if (!error && data) {
      return data as LiveEventRecord;
    }

    return matchedEvent;
  }

  const title = getTopicLabel(news, relatedNews);
  const { data, error } = await supabase
    .from('live_events')
    .insert({
      title,
      summary: news.excerpt || news.title,
      main_image_url: news.image_url || null,
      category: news.category || 'local',
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select('id, title, summary, main_image_url, category, status, created_at, updated_at')
    .single();

  if (error || !data) {
    return null;
  }

  return data as LiveEventRecord;
}

async function ensureLiveEventUpdate(supabase: SupabaseLike, eventId: string, news: NewsLike) {
  const { data: existingUpdate } = await supabase
    .from('live_event_updates')
    .select('id')
    .eq('live_event_id', eventId)
    .eq('source_news_id', news.id)
    .maybeSingle();

  if (existingUpdate) {
    return;
  }

  await supabase
    .from('live_event_updates')
    .insert({
      live_event_id: eventId,
      content: buildLiveUpdateContent(news),
      created_at: news.created_at || new Date().toISOString(),
      update_type: 'news',
      source_news_id: news.id,
    });

  await supabase
    .from('live_events')
    .update({
      updated_at: news.created_at || new Date().toISOString(),
    })
    .eq('id', eventId);
}

export async function createLiveEventWithUpdates(
  supabase: SupabaseLike,
  input: {
    title: string;
    summary: string;
    category: string;
    mainImageUrl?: string | null;
    newsItems: RecentNewsRecord[];
  },
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('live_events')
    .insert({
      title: input.title,
      summary: input.summary,
      main_image_url: input.mainImageUrl || null,
      category: input.category,
      status: 'active',
      created_at: now,
      updated_at: now,
    })
    .select('id, title, summary, main_image_url, category, status, created_at, updated_at')
    .single();

  if (error || !data) {
    return null;
  }

  for (const item of input.newsItems) {
    await ensureLiveEventUpdate(supabase, data.id, item);
  }

  return data as LiveEventRecord;
}

export async function backfillLiveEventUpdates(
  supabase: SupabaseLike,
  event: ExistingLiveEventInput,
  options?: {
    limit?: number;
    days?: number;
  },
) {
  const lookbackDays = options?.days ?? 30;
  const limit = options?.limit ?? 300;
  const windowStart = new Date(Date.now() - 1000 * 60 * 60 * 24 * lookbackDays).toISOString();
  const category = event.category || 'local';

  let rows: RecentNewsRecord[] = [];

  if (event.keywords && event.keywords.length > 0) {
    const keywordFilters = event.keywords
      .map((kw) => kw.trim())
      .filter(Boolean)
      .flatMap((kw) => [`title.ilike.%${kw}%`, `excerpt.ilike.%${kw}%`, `content.ilike.%${kw}%`])
      .join(',');

    const { data, error } = await supabase
      .from('news')
      .select('id, slug, title, excerpt, content, image_url, category, created_at')
      .gte('created_at', windowStart)
      .or(keywordFilters)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (!error && data) {
      rows = (data as RecentNewsRecord[]).filter((item) => matchesEventTopic(event, item));
    }

    if (rows.length === 0) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('news')
        .select('id, slug, title, excerpt, content, image_url, category, created_at')
        .eq('category', category)
        .gte('created_at', windowStart)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (!fallbackError && fallbackData) {
        rows = (fallbackData as RecentNewsRecord[]).filter((item) => matchesEventTopic(event, item));
      }
    }
  } else {
    const { data, error } = await supabase
      .from('news')
      .select('id, slug, title, excerpt, content, image_url, category, created_at')
      .eq('category', category)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (!error && data) {
      rows = (data as RecentNewsRecord[]).filter((item) => matchesEventTopic(event, item));
    }
  }

  for (const item of rows) {
    await ensureLiveEventUpdate(supabase, event.id, item);
  }

  return rows.length;
}

export async function syncLiveEventFromNews(supabase: SupabaseLike, news: NewsLike) {
  const newsCreatedAt = news.created_at || new Date().toISOString();
  const windowStart = new Date(new Date(newsCreatedAt).getTime() - 1000 * 60 * 60 * 24 * 7).toISOString();

  const { data, error } = await supabase
    .from('news')
    .select('id, slug, title, excerpt, image_url, category, created_at')
    .eq('category', news.category || 'local')
    .gte('created_at', windowStart)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return null;
  }

  const recentNews = (data ?? []) as RecentNewsRecord[];
  const currentNewsRecord: RecentNewsRecord = {
    id: news.id,
    slug: news.slug ?? null,
    title: news.title,
    excerpt: news.excerpt ?? null,
    image_url: news.image_url ?? null,
    category: news.category ?? 'local',
    created_at: newsCreatedAt,
  };
  const dedupedNews = [
    currentNewsRecord,
    ...recentNews.filter((item) => item.id !== news.id),
  ];
  const matchedGroup = findGroupForNews(dedupedNews, {
    id: news.id,
    title: news.title,
    excerpt: news.excerpt,
    category: news.category,
    created_at: newsCreatedAt,
  });

  if (!matchedGroup || matchedGroup.length < 3) {
    return null;
  }

  const sortedGroup = matchedGroup
    .slice()
    .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
  const relatedNews = sortedGroup.filter((item) => item.id !== news.id);
  const liveEvent = await createOrReuseLiveEvent(supabase, { ...news, created_at: newsCreatedAt }, relatedNews);

  if (!liveEvent) {
    return null;
  }

  for (const item of sortedGroup) {
    await ensureLiveEventUpdate(supabase, liveEvent.id, item);
  }

  return liveEvent;
}
