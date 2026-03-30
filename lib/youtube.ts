const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || "";

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: string;
}

export const SUGGESTED_KEYWORDS = [
  { label: "🤰 임신 초기", query: "임신 초기 주의사항" },
  { label: "🤢 입덧 극복", query: "입덧 줄이는 방법" },
  { label: "🏥 산전검사", query: "임산부 산전검사" },
  { label: "🍽️ 임산부 식단", query: "임산부 좋은 음식" },
  { label: "🧘 태교", query: "태교 방법 추천" },
  { label: "🎒 출산준비물", query: "출산준비물 리스트" },
  { label: "👶 신생아 돌봄", query: "신생아 육아 꿀팁" },
  { label: "💪 임산부 운동", query: "임산부 스트레칭 운동" },
];

export async function searchYouTube(
  query: string,
  maxResults: number = 10
): Promise<{ videos: YouTubeVideo[]; error: string | null }> {
  if (!YOUTUBE_API_KEY) {
    return { videos: getDemoVideos(query), error: null };
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: String(maxResults),
      regionCode: "KR",
      relevanceLanguage: "ko",
      safeSearch: "strict",
      key: YOUTUBE_API_KEY,
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "YouTube API 요청 실패");
    }

    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: decodeHtml(item.snippet.title),
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      publishedAt: item.snippet.publishedAt,
    }));

    return { videos, error: null };
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return { videos: getDemoVideos(query), error: error.message };
  }
}

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getDemoVideos(query: string): YouTubeVideo[] {
  const demoSets: Record<string, YouTubeVideo[]> = {
    default: [
      {
        id: "demo-v1",
        title: "임신 초기 1~12주 증상과 주의사항 총정리! 산부인과 전문의가 알려드려요",
        channelTitle: "닥터맘의 임신출산",
        thumbnail: "https://picsum.photos/seed/preg1/480/360",
        publishedAt: "2026-02-15T00:00:00Z",
      },
      {
        id: "demo-v2",
        title: "입덧 줄이는 현실적인 방법 7가지 🤢 3번째가 진짜 효과 있어요",
        channelTitle: "예비맘TV",
        thumbnail: "https://picsum.photos/seed/preg2/480/360",
        publishedAt: "2026-03-01T00:00:00Z",
      },
      {
        id: "demo-v3",
        title: "임산부가 꼭 먹어야 할 영양제 TOP 5 (엽산, 철분, 비타민D...)",
        channelTitle: "약사언니",
        thumbnail: "https://picsum.photos/seed/preg3/480/360",
        publishedAt: "2026-01-20T00:00:00Z",
      },
      {
        id: "demo-v4",
        title: "출산준비물 리스트 총정리! 꼭 필요한 것 vs 안 사도 되는 것",
        channelTitle: "육아의 정석",
        thumbnail: "https://picsum.photos/seed/preg4/480/360",
        publishedAt: "2026-02-28T00:00:00Z",
      },
      {
        id: "demo-v5",
        title: "임산부 요가 20분 루틴 🧘‍♀️ 허리통증 완화 & 순산 준비",
        channelTitle: "맘핏요가",
        thumbnail: "https://picsum.photos/seed/preg5/480/360",
        publishedAt: "2026-03-10T00:00:00Z",
      },
      {
        id: "demo-v6",
        title: "임신 주수별 아기 크기 변화 1주~40주 한눈에 보기 👶",
        channelTitle: "닥터맘의 임신출산",
        thumbnail: "https://picsum.photos/seed/preg6/480/360",
        publishedAt: "2026-01-05T00:00:00Z",
      },
    ],
  };

  return demoSets.default;
}
