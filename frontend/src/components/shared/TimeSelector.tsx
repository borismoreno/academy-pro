interface TimeSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const SELECT_CLASS =
  "bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer";

export const TimeSelector = ({ label, value, onChange }: TimeSelectorProps) => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minutes = ["00", "15", "30", "45"];
  const [selectedHour, selectedMinute] = value ? value.split(":") : ["", ""];

  const handleHourChange = (hour: string) => {
    onChange(`${hour}:${selectedMinute || "00"}`);
  };

  const handleMinuteChange = (minute: string) => {
    onChange(`${selectedHour || "00"}:${minute}`);
  };

  return (
    <div>
      <label className="text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
        {label}
      </label>
      <div className="flex gap-2 mt-1">
        <select
          value={selectedHour}
          onChange={(e) => handleHourChange(e.target.value)}
          className={`flex-1 ${SELECT_CLASS}`}
        >
          <option value="" disabled>
            Hora
          </option>
          {hours.map((h) => (
            <option key={h} value={h} className="bg-surface-high">
              {h}:00
            </option>
          ))}
        </select>
        <select
          value={selectedMinute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className={`w-24 ${SELECT_CLASS}`}
        >
          <option value="" disabled>
            Min
          </option>
          {minutes.map((m) => (
            <option key={m} value={m} className="bg-surface-high">
              :{m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
