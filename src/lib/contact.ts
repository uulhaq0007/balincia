// Turns the store's editable contact settings into working links.
// Pure functions, safe for both server and client components.

/** Digits for a wa.me link from local Pakistani ("0300-1234567") or international ("+92 300 1234567") input. */
export function whatsappDigits(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : "";
}

export function whatsappHref(number: string, message?: string) {
  const digits = whatsappDigits(number);
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
}
