import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateNoteDialog } from "./CreateNoteDialog";

interface MeetingNotesProps {
  projectId: string;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  note_type: string;
  created_at: string;
  created_by: {
    full_name: string | null;
  } | null;
}

export function MeetingNotes({ projectId }: MeetingNotesProps) {
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [isCreateCallDialogOpen, setIsCreateCallDialogOpen] = useState(false);

  const { data: notes, isLoading } = useQuery({
    queryKey: ["meeting-notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select(`
          *,
          created_by:profiles (
            full_name
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

  const meetingNotes = notes?.filter((note) => note.note_type === "meeting") || [];
  const callNotes = notes?.filter((note) => note.note_type === "call") || [];

  const NotesList = ({ notes, title }: { notes: Note[]; title: string }) => (
    <div className="space-y-4">
      {notes.map((note) => (
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
  );

  return (
    <div className="space-y-6">
      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            議事録
          </CardTitle>
          <Button
            onClick={() => setIsCreateMeetingDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </CardHeader>
        <CardContent>
          <NotesList notes={meetingNotes} title="議事録" />
        </CardContent>
      </Card>

      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">
            電話メモ
          </CardTitle>
          <Button
            onClick={() => setIsCreateCallDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規作成
          </Button>
        </CardHeader>
        <CardContent>
          <NotesList notes={callNotes} title="電話メモ" />
        </CardContent>
      </Card>

      <CreateNoteDialog
        projectId={projectId}
        open={isCreateMeetingDialogOpen}
        onOpenChange={setIsCreateMeetingDialogOpen}
        noteType="meeting"
        title="議事録の作成"
      />
      <CreateNoteDialog
        projectId={projectId}
        open={isCreateCallDialogOpen}
        onOpenChange={setIsCreateCallDialogOpen}
        noteType="call"
        title="電話メモの作成"
      />
    </div>
  );
}