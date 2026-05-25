type AdSlotProps = {
  label: string;
  size: string;
  tone?: "dark" | "light";
};

export function AdSlot({ label, size, tone = "light" }: AdSlotProps) {
  return (
    <aside className={`ad-slot ${tone}`}>
      <span>Advertisement</span>
      <strong>{label}</strong>
      <small>{size}</small>
    </aside>
  );
}
