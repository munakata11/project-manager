import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { CreateNoteDialog } from "./CreateNoteDialog";

interface MeetingNotesProps {
  projectId: string;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  created_by: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function MeetingNotes({ projectId }: MeetingNotesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["meeting-notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select(`
          *,
          created_by:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          議事録・電話メモ
        </CardTitle>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes?.map((note) => (
            <Card key={note.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(note.created_at).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  作成者: {note.created_by?.full_name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <CreateNoteDialog
        projectId={projectId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Card>
  );
}