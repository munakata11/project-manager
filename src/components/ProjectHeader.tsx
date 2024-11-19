import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProjectHeaderProps {
  title: string;
  description?: string;
  onDelete: () => void;
}

export function ProjectHeader({ title, description, onDelete }: ProjectHeaderProps) {
  const [projectNameConfirm, setProjectNameConfirm] = useState("");

  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-500">{description}</p>
      </div>
      <div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="bg-white border-red-500 text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              プロジェクトを削除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>プロジェクトを削除しますか？</AlertDialogTitle>
              <AlertDialogDescription>
                この操作は取り消せません。削除を確認するには、プロジェクト名を入力してください。
                <div className="mt-4">
                  <Input
                    placeholder={title}
                    value={projectNameConfirm}
                    onChange={(e) => setProjectNameConfirm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProjectNameConfirm("")}>
                キャンセル
              </AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={() => {
                  if (projectNameConfirm === title) {
                    onDelete();
                    setProjectNameConfirm("");
                  }
                }}
                disabled={projectNameConfirm !== title}
              >
                削除する
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}