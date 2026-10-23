const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://evertale.com.au";

export const urls = {
  api: {
    base: API_BASE_URL,
    auth: {
      login: `${API_BASE_URL}/api/auth/login`,
      register: `${API_BASE_URL}/api/auth/register`,
      logout: `${API_BASE_URL}/api/auth/logout`,
      me: `${API_BASE_URL}/api/auth/me`,
    },
    products: {
      list: `${API_BASE_URL}/api/products`,
      detail: (id: string) => `${API_BASE_URL}/api/products/${id}`,
    },
    orders: {
      list: `${API_BASE_URL}/api/orders`,
      detail: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
    },
  },
  web: {
    base: "https://evertale.com.au",
    privacy: "https://evertale.com.au/privacy-policy",
    terms: "https://evertale.com.au/terms-conditions",
  },
  social: {
    facebook: "https://www.facebook.com/evertale.com.au",
    instagram: "https://www.instagram.com/evertale_au",
    tiktok: "https://www.tiktok.com/@evertale.com.au",
    youtube: "https://www.youtube.com/@evertale_au",
  },
};