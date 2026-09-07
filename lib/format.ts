const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatUsd(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1000) return `$${compact.format(value)}`;
  return usd.format(value);
}

export function formatPrice(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1) return usd.format(value);
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  if (value >= 1e-8) {
    const digits = value.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
    return `$${digits}`;
  }
  return `$${value.toExponential(2)}`;
}

export function formatPct(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatShare(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  const pct = Math.abs(value) <= 1 ? value * 100 : value;
  return `${pct.toFixed(2)}%`;
}

export function formatCount(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return compact.format(value);
}

export function formatYesNo(value: boolean | null | undefined) {
  if (value == null) return "—";
  return value ? "Yes" : "No";
}

export type AgeStamp = {
  iso: string;
  label: string;
  absolute: string;
  fresh: boolean;
};

export function getAge(iso?: string | null, ms?: number | null): AgeStamp | null {
  const date = iso ? new Date(iso) : ms != null ? new Date(ms) : null;
  if (!date || Number.isNaN(date.getTime())) return null;

  const abs = Math.abs(Date.now() - date.getTime());
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const year = date.getFullYear();
  const thisYear = new Date().getFullYear();

  let label: string;
  if (abs < minute) label = "now";
  else if (abs < hour) label = `${Math.floor(abs / minute)}m`;
  else if (abs < day) label = `${Math.floor(abs / hour)}h`;
  else if (abs < 7 * day) label = `${Math.floor(abs / day)}d`;
  else {
    label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(year !== thisYear ? { year: "numeric" } : {}),
    });
  }

  return {
    iso: date.toISOString(),
    label,
    absolute: date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    fresh: abs < hour,
  };
}

export function formatRelativeTime(iso: string | null | undefined, ms?: number | null) {
  return getAge(iso, ms)?.label ?? "—";
}

export function formatAbsoluteTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortenId(id: string, size = 4) {
  if (id.length <= size * 2 + 3) return id;
  return `${id.slice(0, size)}…${id.slice(-size)}`;
}
