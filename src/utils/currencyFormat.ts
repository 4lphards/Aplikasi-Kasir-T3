export const formatToRupiah = (value: string): string => {
  // Remove non-digit characters and leading zeros
  const number = value.replace(/\D/g, "").replace(/^0+/, "");
  // Format with dots
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return formatted ? `Rp. ${formatted}` : "";
};

export const parseRupiahToNumber = (value: string): string => {
  return value.replace(/\D/g, "");
};
