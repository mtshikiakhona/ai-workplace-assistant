import { useState, type ReactNode } from "react";
import { toast } from "sonner";

export function PageIntro({
  heading,
  sub,
  badge,
}: {
  heading: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-balance text-[22px] font-bold tracking-tight">{heading}</h2>
        <p className="mt-1 text-pretty text-[13px] text-muted-foreground">{sub}</p>
      </div>
      {badge && (
        <span className="rounded-full border border-lagoon/20 bg-lagoon-soft px-3 py-1 font-mono text-[11px] text-secondary-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

export function Pane({
  label,
  meta,
  actions,
  children,
  padded = true,
}: {
  label: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface ring-1 ring-foreground/[0.02]">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-5">
        <span className="label-mono">{label}</span>
        <div className="flex items-center gap-2">
          {meta}
          {actions}
        </div>
      </div>
      <div className={padded ? "flex-1 p-5" : "flex-1"}>{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const controlClass =
  "w-full rounded-[9px] border border-line bg-background px-3 text-[13px] text-foreground outline-none transition focus:border-lagoon/50 focus:ring-2 focus:ring-ring";

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${controlClass} h-9 font-medium`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${controlClass} resize-y py-2.5 leading-relaxed placeholder:text-muted-foreground/60`}
    />
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center rounded-[9px] bg-gradient-to-br from-lagoon to-lagoon-deep px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  small,
}: {
  children: ReactNode;
  onClick?: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border border-line font-medium text-muted-foreground transition hover:bg-foreground/[0.03] ${
        small ? "h-8 px-3 text-[12px]" : "h-9 px-3.5 text-[13px]"
      }`}
    >
      {children}
    </button>
  );
}

export function copyText(text: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success("Copied to clipboard"),
    () => toast.error("Could not copy"),
  );
}

export function exportText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported as .txt");
}

export function OutputActions({ text, filename }: { text: string; filename: string }) {
  return (
    <div className="flex gap-2">
      <GhostButton small onClick={() => copyText(text)}>
        Copy
      </GhostButton>
      <button
        type="button"
        onClick={() => exportText(text, filename)}
        className="inline-flex h-8 items-center rounded-lg border border-lagoon/30 bg-lagoon-soft/60 px-3 text-[12px] font-medium text-secondary-foreground transition hover:bg-lagoon-soft"
      >
        Export
      </button>
    </div>
  );
}

export function useAsyncAction<T>() {
  const [loading, setLoading] = useState(false);

  async function run(fn: () => Promise<T>, onDone: (value: T) => void) {
    setLoading(true);
    try {
      onDone(await fn());
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, run };
}
