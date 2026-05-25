type AdSlotProps = {
  label: string;
  size: string;
  compact?: boolean;
};

export function AdSlot({ label, size, compact = false }: AdSlotProps) {
  return (
    <aside className={compact ? "ad-slot compact" : "ad-slot"} aria-label={`${label} advertisement`}>
      <span>Advertisement</span>
      <strong>{label}</strong>
      <small>{size}</small>
    </aside>
  );
}
