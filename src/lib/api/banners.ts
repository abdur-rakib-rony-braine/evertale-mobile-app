import { urls } from "@/constants/url";

export interface Banner {
  _id: string;
  headline: string;
  urlname: string;
  fileUrl: string;
  slug: string;
  description: string;
  isMobile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  banner: Banner[];
  mobileBanner: Banner[];
}

export async function fetchBanners(): Promise<BannersResponse> {
  const res = await fetch(`${urls.api.base}/api/banners`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch banners: ${res.status}`);
  }

  const data = (await res.json()) as BannersResponse;

  return {
    banner: data.banner ?? [],
    mobileBanner: data.mobileBanner ?? [],
  };
}