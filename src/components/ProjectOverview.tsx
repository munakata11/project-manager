import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";

interface ProjectOverviewProps {
  project: {
    title: string;
    description: string;
    progress: number;
    created_at: string;
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

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span>
              作成日: {new Date(project.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}