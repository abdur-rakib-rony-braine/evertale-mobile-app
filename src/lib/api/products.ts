import { urls } from "@/constants/url";

export interface ProductColor {
  name: string;
  url: string;
}

export interface ProductSize {
  name: string;
  stockQuantity: number;
}

export interface ProductReview {
  _id?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  comment?: string;
  reviewTitle?: string;
  rating: number;
  images?: string[];
  likes?: { userId: string }[];
  dislikes?: { userId: string }[];
  createdAt?: string;
  approved?: boolean;
}

export interface SizeChartMeasurementSize {
  size: string;
  start: string;
  end?: string;
}

export interface SizeChartMeasurement {
  measurementName: string;
  sizes: SizeChartMeasurementSize[];
}

export interface ProductSizeChart {
  sizes?: string[];
  measurements?: SizeChartMeasurement[];
  images?: string[];
}

export interface Product {
  _id: string;
  title: string;
  handle: string;
  description?: string;
  category?: string;
  subCategory?: string;
  type?: string;
  price: number;
  discount?: number;
  discounted_price?: number;
  compareAtPrice?: number;
  available?: boolean;
  status?: boolean;
  sizes: ProductSize[];
  colors: ProductColor[];
  images: string[];
  featured_image?: string;
  videoThumbnail?: string;
  promovideos?: string[];
  barcode?: string;
  rating?: number;
  reviews?: ProductReview[];
  new_arrival?: boolean;
  best_sellers?: boolean;
  collections?: string[];
  pointofsale?: boolean;
  onlinestore?: boolean;
  countInStock?: number;
  costPerItem?: number;
  profit?: number;
  profitMargin?: number;
  sizeChart?: ProductSizeChart | string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface NewArrivalResponse {
  products: Product[];
}

interface BestSellersResponse {
  products: Product[];
}

interface ProductsResponse {
  products: Product[];
  total?: number;
}

export async function fetchNewArrivals(): Promise<Product[]> {
  const res = await fetch(`${urls.api.base}/api/new-arrival`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as NewArrivalResponse;
  return data.products ?? [];
}

export async function fetchBestSellers(): Promise<Product[]> {
  const res = await fetch(`${urls.api.base}/api/best-sellers`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as BestSellersResponse;
  return data.products ?? [];
}

export async function fetchProducts(params?: {
  category?: string;
  subCategory?: string;
  limit?: number;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.subCategory) query.set("subCategory", params.subCategory);
  if (params?.limit) query.set("limit", String(params.limit));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  const res = await fetch(`${urls.api.base}/api/products${suffix}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as ProductsResponse;
  return data.products ?? [];
}

export async function fetchProductByHandle(
  handle: string
): Promise<Product | null> {
  const res = await fetch(
    `${urls.api.base}/api/product-details/${encodeURIComponent(handle)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  console.log('res', res)

  if (!res.ok) return null;

  const data = (await res.json()) as { product: Product };
  return data.product ?? null;
}