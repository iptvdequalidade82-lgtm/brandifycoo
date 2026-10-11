export function normalizeBrazilianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("55") && (digits.length === 12 || digits.length === 13) ? digits.slice(2) : digits;
  return /^[1-9]\d{9,10}$/.test(local) ? `55${local}` : null;
}

export function timeOptions(slots: { start: string; end: string }[]): string[] {
  const minutes = (value: string) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return NaN;
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  const times = new Set<string>();
  for (const slot of slots) {
    const start = minutes(slot.start), end = minutes(slot.end);
    for (let t = start; t < end; t += 30) {
      times.add(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
    }
  }
  return [...times].sort();
}

export function validSlots(slots: { start: string; end: string }[]): boolean {
  return slots.length > 0 && slots.every(s => /^([01]\d|2[0-3]):[0-5]\d$/.test(s.start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.end) && s.start < s.end);
}
