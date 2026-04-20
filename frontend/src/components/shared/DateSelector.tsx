interface DateSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  yearRange?: { min: number; max: number };
}

const SELECT_CLASS =
  "bg-surface-low border border-outline-variant/15 rounded-xl px-3 py-2.5 font-body text-sm text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer";

export const DateSelector = ({
  label,
  value,
  onChange,
  yearRange,
}: DateSelectorProps) => {
  const today = new Date();

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0"),
  );

  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const currentYear = today.getFullYear();
  const minYear = yearRange?.min ?? currentYear - 30;
  const maxYear = yearRange?.max ?? currentYear + 1;
  const yearCount = maxYear - minYear + 1;
  const years = Array.from({ length: yearCount }, (_, i) =>
    (minYear + i).toString(),
  ).reverse();

  const [selectedYear, selectedMonth, selectedDay] = value
    ? value.split("-")
    : [
        today.getFullYear().toString(),
        (today.getMonth() + 1).toString().padStart(2, "0"),
        today.getDate().toString().padStart(2, "0"),
      ];

  const handleChange = (year: string, month: string, day: string) => {
    if (year && month && day) onChange(`${year}-${month}-${day}`);
  };

  return (
    <div>
      <label className="font-body text-sm text-on-surface-variant">
        {label}
      </label>
      <div className="flex gap-2 mt-1">
        <select
          value={selectedDay}
          onChange={(e) =>
            handleChange(selectedYear, selectedMonth, e.target.value)
          }
          className={`w-20 ${SELECT_CLASS}`}
        >
          <option value="" disabled>
            Día
          </option>
          {days.map((d) => (
            <option key={d} value={d} className="bg-surface-high">
              {d}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) =>
            handleChange(selectedYear, e.target.value, selectedDay)
          }
          className={`flex-1 ${SELECT_CLASS}`}
        >
          <option value="" disabled>
            Mes
          </option>
          {months.map((m) => (
            <option key={m.value} value={m.value} className="bg-surface-high">
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) =>
            handleChange(e.target.value, selectedMonth, selectedDay)
          }
          className={`w-24 ${SELECT_CLASS}`}
        >
          <option value="" disabled>
            Año
          </option>
          {years.map((y) => (
            <option key={y} value={y} className="bg-surface-high">
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
