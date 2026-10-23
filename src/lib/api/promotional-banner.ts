import { urls } from "@/constants/url";

export interface PromoBanner {
  _id: string;
  title: string;
  imageUrl: string;
  link: string;
  startDate: string;
  endDate: string;
  status: string;
  displayCountdown: boolean;
}

interface BannersApiResponse {
  success: boolean;
  banners: PromoBanner[];
}

async function fetchPromoBanners(endpoint: string): Promise<PromoBanner[]> {
  const res = await fetch(`${urls.api.base}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as BannersApiResponse;
  if (!data.success) return [];

  return data.banners ?? [];
}

function filterActive(banners: PromoBanner[]): PromoBanner[] {
  const now = Date.now();
  return banners.filter((b) => {
    if (b.status !== "active") return false;
    const start = new Date(b.startDate).getTime();
    const end = new Date(b.endDate).getTime();
    return start <= now && end >= now;
  });
}

export async function fetchPromotionalBanner(): Promise<PromoBanner | null> {
  const mobileBanners = await fetchPromoBanners(
    "/api/mobile-promotional-banners"
  );

  const active = filterActive(mobileBanners);
  return active[0] ?? null;
}