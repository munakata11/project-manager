import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProcessProgressInputProps {
  percentage: number;
  onChange: (value: number) => void;
}

export const ProcessProgressInput = ({ percentage, onChange }: ProcessProgressInputProps) => {
  const handleChange = (value: number) => {
    // Ensure the value stays between 0 and 100
    const newValue = Math.min(100, Math.max(0, value));
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleChange(Math.max(0, percentage - 10))}
      >
        -10%
      </Button>
      <Input
        type="number"
        min={0}
        max={100}
        value={percentage}
        onChange={(e) => {
          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
          handleChange(value);
        }}
        className="w-20"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => handleChange(Math.min(100, percentage + 10))}
      >
        +10%
      </Button>
    </div>
  );
};