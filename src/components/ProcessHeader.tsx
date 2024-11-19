import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { EditProcessDialog } from "./EditProcessDialog";

interface ProcessHeaderProps {
  process: {
    id: string;
    title: string;
    description: string | null;
    percentage: number;
  };
  status: string | null;
  isUpdating: boolean;
  projectId: string;
  onStatusChange: (checked: boolean) => void;
  onDelete: () => void;
}

export const ProcessHeader = ({
  process,
  status,
  isUpdating,
  projectId,
  onStatusChange,
  onDelete,
}: ProcessHeaderProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={status === "完了"}
          onCheckedChange={onStatusChange}
          disabled={isUpdating}
          className="h-5 w-5"
        />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{process.title}</h3>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditDialogOpen(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditProcessDialog
        process={process}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};