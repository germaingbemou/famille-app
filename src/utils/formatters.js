export function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(
    "fr-FR"
  );
}

export function formatMoney(amount) {
  if (!amount) return "0 GNF";

  return Number(amount).toLocaleString(
    "fr-FR"
  ) + " GNF";
}