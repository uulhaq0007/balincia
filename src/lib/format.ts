const priceFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export function formatPrice(amount: number) {
  return `Rs. ${priceFormatter.format(Math.round(amount))}`;
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
