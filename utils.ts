export const formatNumber = (value: string | number) => {
  if (!value && value !== 0) return "";
  return value.toString().replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};