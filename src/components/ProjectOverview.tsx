import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Building2, Coins, Percent } from "lucide-react";
import { useState } from "react";
import { EditProjectDialog } from "./EditProjectDialog";
import { Progress } from "@/components/ui/progress";

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
    progress: number;
  };
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">プロジェクト概要</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-500">進捗状況</div>
              <div className="flex items-center gap-2">
                <Progress value={project.progress || 0} className="flex-1 h-2" />
                <span className="text-sm text-gray-500">{project.progress || 0}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">設計工期</div>
                <div className="text-sm">
                  {project.design_period
                    ? format(new Date(project.design_period), "yyyy年MM月dd日", {
                        locale: ja,
                      })
                    : "未定"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gray-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">受注金額（税抜）</div>
                <div className="text-sm">
                  {project.amount_excl_tax
                    ? `¥${project.amount_excl_tax.toLocaleString()}`
                    : "未設定"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">受注会社</div>
                <div className="text-sm">
                  {project.contractor_companies?.name || "未設定"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-gray-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">受注金額（税込）</div>
                <div className="text-sm">
                  {project.amount_incl_tax
                    ? `¥${project.amount_incl_tax.toLocaleString()}`
                    : "未設定"}
                </div>
              </div>
            </div>
          </div>
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