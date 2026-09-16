const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

export const defaultOpeningHours = () =>
  Object.fromEntries(DAYS.map((d) => [d, { open: "", close: "", isClosed: false }]));

export default function OpeningHoursEditor({ value, onChange }) {
  const hours = value || defaultOpeningHours();

  const setDay = (day, patch) => onChange({ ...hours, [day]: { ...hours[day], ...patch } });

  const allSelected = DAYS.every((d) => !hours[d]?.isClosed);

  const handleSelectAll = (open, close) => {
    const updated = {};
    DAYS.forEach((d) => { updated[d] = { open, close, isClosed: false }; });
    onChange(updated);
  };

  const handleToggleAll = (isClosed) => {
    const updated = {};
    DAYS.forEach((d) => { updated[d] = { ...hours[d], isClosed }; });
    onChange(updated);
  };

  // Get first open day's times as default for "apply all"
  const firstOpen = DAYS.find((d) => !hours[d]?.isClosed && hours[d]?.open);
  const defaultOpen = hours[firstOpen]?.open || "09:00";
  const defaultClose = hours[firstOpen]?.close || "21:00";

  return (
    <div className="rounded-xl border border-border overflow-hidden text-sm">
      {/* Bulk actions bar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-accent/5 border-b border-border">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Quick set</span>
        <button
          type="button"
          onClick={() => handleSelectAll(defaultOpen, defaultClose)}
          className="text-xs font-medium text-accent hover:underline"
        >
          Open all week ({defaultOpen}–{defaultClose})
        </button>
        <span className="text-secondary/40">|</span>
        <button
          type="button"
          onClick={() => handleToggleAll(true)}
          className="text-xs font-medium text-secondary hover:text-danger"
        >
          Close all
        </button>
        <span className="text-secondary/40">|</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-secondary">Apply time to all open days:</span>
          <input
            type="time"
            defaultValue="09:00"
            onChange={(e) => {
              const t = e.target.value;
              const updated = {};
              DAYS.forEach((d) => { updated[d] = { ...hours[d], open: hours[d]?.isClosed ? hours[d].open : t }; });
              onChange(updated);
            }}
            className="rounded-lg border border-border px-2 py-1 text-primary focus:outline-none focus:ring-2 focus:ring-accent text-xs"
          />
          <span className="text-secondary">–</span>
          <input
            type="time"
            defaultValue="21:00"
            onChange={(e) => {
              const t = e.target.value;
              const updated = {};
              DAYS.forEach((d) => { updated[d] = { ...hours[d], close: hours[d]?.isClosed ? hours[d].close : t }; });
              onChange(updated);
            }}
            className="rounded-lg border border-border px-2 py-1 text-primary focus:outline-none focus:ring-2 focus:ring-accent text-xs"
          />
        </div>
      </div>

      {DAYS.map((day, i) => {
        const d = hours[day] || { open: "", close: "", isClosed: false };
        return (
          <div
            key={day}
            className={`flex flex-wrap items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-background"}`}
          >
            <span className="w-24 text-primary font-medium shrink-0">{DAY_LABELS[day]}</span>
            <label className="flex items-center gap-1.5 text-secondary cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={d.isClosed}
                onChange={(e) => setDay(day, { isClosed: e.target.checked })}
                className="w-3.5 h-3.5 accent-danger"
              />
              Closed
            </label>
            {!d.isClosed && (
              <>
                <input
                  type="time"
                  value={d.open}
                  onChange={(e) => setDay(day, { open: e.target.value })}
                  className="rounded-lg border border-border px-2 py-1.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={`${DAY_LABELS[day]} open`}
                />
                <span className="text-secondary">–</span>
                <input
                  type="time"
                  value={d.close}
                  onChange={(e) => setDay(day, { close: e.target.value })}
                  className="rounded-lg border border-border px-2 py-1.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-label={`${DAY_LABELS[day]} close`}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
