export const formatPrice = (price: number) => {
  const parts = price.toFixed(2).split(".");
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return parts.join(",");
};
