import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { EditProjectDialog } from "./EditProjectDialog";

interface ProjectOverviewProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    design_period: string | null;
    amount_excl_tax: number | null;
    amount_incl_tax: number | null;
    contractor_company_id: string | null;
    contractor_companies?: {
      name: string;
    } | null;
  };
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">プロジェクト概要</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          編集
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">設計工期</h3>
            <p className="mt-1">
              {project.design_period
                ? format(new Date(project.design_period), "yyyy年MM月dd日", {
                    locale: ja,
                  })
                : "未設定"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">受注会社</h3>
            <p className="mt-1">
              {project.contractor_companies?.name || "未設定"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">受注金額（税抜）</h3>
            <p className="mt-1">
              {project.amount_excl_tax
                ? `¥${project.amount_excl_tax.toLocaleString()}`
                : "未設定"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">受注金額（税込）</h3>
            <p className="mt-1">
              {project.amount_incl_tax
                ? `¥${project.amount_incl_tax.toLocaleString()}`
                : "未設定"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">説明</h3>
          <p className="mt-1 whitespace-pre-wrap">{project.description || "未設定"}</p>
        </div>
      </CardContent>

      <EditProjectDialog
        project={project}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </Card>
  );
}