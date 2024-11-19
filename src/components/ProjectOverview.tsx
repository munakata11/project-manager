import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Building2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectOverviewProps {
  project: {
    title: string;
    description: string;
    progress: number;
    created_at: string;
    design_period: string;
    amount_excl_tax: number;
    amount_incl_tax: number;
    contractor_company_name?: string;
  };
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          概要
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-1.5">
              <span>進捗</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2 bg-gray-100" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>
                作成日: {new Date(project.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>
                設計工期: {project.design_period ? format(new Date(project.design_period), "yyyy年MM月dd日") : "未設定"}
              </span>
            </div>

            {project.contractor_company_name && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span>受注会社: {project.contractor_company_name}</span>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <div>受注金額（税抜）: {project.amount_excl_tax?.toLocaleString()}円</div>
              <div>受注金額（税込）: {project.amount_incl_tax?.toLocaleString()}円</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}