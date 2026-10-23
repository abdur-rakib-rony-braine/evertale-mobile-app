export const ORDERS_PER_PAGE = 10;

export const FILTER_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "confirmed", label: "Confirmed" },
  { value: "on-its-way", label: "On Its Way" },
  { value: "delivered", label: "Delivered" },
  { value: "refunded", label: "Refunded" },
] as const;

export type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

export const getTrackingUrl = (carrier?: string, trackingNumber?: string) => {
  switch (carrier) {
    case "DHL":
      return `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;
    case "FedEx":
      return `https://www.fedex.com/fedextrack/?tracknum=${trackingNumber}`;
    case "TNT":
      return `https://www.tnt.com/express/en_au/site_tools/tracking.html?searchType=con&cons=${trackingNumber}`;
    default:
      return `https://auspost.com.au/mypost/track/details/${trackingNumber}`;
  }
};

export const getStatusLabel = (order: any) => {
  const returns = order?.returns || [];
  const exchanges = order?.exchanges || [];
  if (returns.length > 0) return `Return: ${returns[0].status}`;
  if (exchanges.length > 0) return `Exchange: ${exchanges[0].status}`;
  return order?.orderStatus || "";
};

export const matchesFilter = (order: any, filter: FilterValue) => {
  if (filter === "all") return true;
  const status = order?.orderStatus;
  const paymentStatus = order?.paymentStatus?.toLowerCase();
  switch (filter) {
    case "confirmed":
      return status === "Confirmed";
    case "on-its-way":
      return status === "Unfulfilled" || status === "Fulfilled";
    case "delivered":
      return status === "Delivered";
    case "refunded":
      return (
        status === "Refunded" ||
        status === "Partially Refunded" ||
        !!paymentStatus?.includes("refund")
      );
    default:
      return true;
  }
};

export const matchesSearch = (order: any, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return (
    !!order?.orderId?.toLowerCase().includes(q) ||
    !!order?.orderProducts?.some((p: any) => p?.name?.toLowerCase().includes(q))
  );
};

export const isWithin30Days = (createdAt?: string) => {
  const orderDate = new Date(createdAt || Date.now());
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return orderDate >= cutoff;
};

export const formatOrderDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

export const getShortAddress = (address: any) => {
  if (!address) return "";
  const { suburb, state, postcode } = address;
  return [suburb, state, postcode].filter(Boolean).join(", ");
};

export const getFullAddress = (address: any) => {
  if (!address) return "";
  const { address: addr, address2, suburb, state, postcode, country } = address;
  return [
    addr,
    address2,
    suburb,
    [state, postcode].filter(Boolean).join(" "),
    country,
  ]
    .filter(Boolean)
    .join(", ");
};