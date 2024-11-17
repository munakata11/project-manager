import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProcessHeaderProps {
  title: string;
  percentage: number;
  status: string | null;
  isUpdating: boolean;
  onStatusChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const ProcessHeader = ({
  title,
  percentage,
  status,
  isUpdating,
  onStatusChange,
  onDelete,
}: ProcessHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={status === "完了"}
          onCheckedChange={onStatusChange}
          disabled={isUpdating}
        />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">
            進捗: {percentage}%
          </div>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};