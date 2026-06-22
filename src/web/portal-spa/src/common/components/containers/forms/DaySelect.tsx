import { Button } from "@common/components/ui/button";

import { cn } from "@common/lib/core/utils";

type DaySelectProps = {
  selectedDays: number[];
  setSelectedDays: React.Dispatch<React.SetStateAction<number[]>>;
};

const DaySelect = ({ selectedDays, setSelectedDays }: DaySelectProps) => {
  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <div className="grid grid-cols-6 gap-2 p-2">
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
        <Button
          key={day}
          variant={selectedDays.includes(day) ? "secondary" : "tertiary"}
          className={cn(
            "h-7 w-[2.5rem]",
            selectedDays.includes(day)
              ? "bg-primary-50"
              : "border-none text-neutral-800",
          )}
          onClick={() => {
            toggleDay(day);
          }}
        >
          {day}
        </Button>
      ))}
    </div>
  );
};

export default DaySelect;
