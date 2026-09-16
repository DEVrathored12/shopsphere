const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

export const defaultOpeningHours = () =>
  Object.fromEntries(DAYS.map((d) => [d, { open: "", close: "", isClosed: false }]));

export default function OpeningHoursEditor({ value, onChange }) {
  const hours = value || defaultOpeningHours();

  const setDay = (day, patch) => {
    onChange({ ...hours, [day]: { ...hours[day], ...patch } });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden text-sm">
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
