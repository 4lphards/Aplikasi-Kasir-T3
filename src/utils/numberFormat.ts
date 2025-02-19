export const numberFormat = (prices: string | number | null | undefined) => {
  const price = Number(prices);
  const parts = price.toFixed(2).split(".");
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return parts.join(",").slice(0, -3);
};
