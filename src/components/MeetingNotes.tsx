import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Notebook, Phone, Edit, FileText } from "lucide-react";
import { CreateNoteDialog } from "./notes/CreateNoteDialog";
import { EditNoteDialog } from "./notes/EditNoteDialog";
import { useToast } from "@/components/ui/use-toast";
import { NoteAttachments } from "./notes/NoteAttachments";

interface MeetingNotesProps {
  projectId: string;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  note_type: string;
  created_at: string;
  participants?: string | null;
  location?: string | null;
  contact_person?: string | null;
  created_by: {
    full_name: string | null;
  } | null;
  meeting_note_attachments?: Array<{
    id: string;
    filename: string;
    file_path: string;
    created_at: string;
  }>;
}

export function MeetingNotes({ projectId }: MeetingNotesProps) {
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [isCreateCallDialogOpen, setIsCreateCallDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["meeting-notes", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meeting_notes")
        .select(`
          *,
          created_by:profiles (
            full_name
          ),
          meeting_note_attachments (
            id,
            filename,
            file_path,
            created_at
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Note[];
    },
  });

  const handleDelete = async (noteId: string) => {
    if (!window.confirm("このメモを削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("meeting_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast({
        title: "メモを削除しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "メモの削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleFormat = async (note: Note) => {
    try {
      const { data, error } = await supabase.functions.invoke('format-note', {
        body: { content: note.content, noteType: note.note_type }
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('meeting_notes')
        .update({ content: data.content })
        .eq('id', note.id);

      if (updateError) throw updateError;

      toast({
        title: "メモを整形しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes", projectId] });
    } catch (error) {
      toast({
        title: "エラー",
        description: "メモの整形に失敗しました。",
        variant: "destructive",
      });
    }
  };

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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleDateString("ja-JP")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFormat(note)}
                  title="整形"
                >
                  <FileText className="h-4 w-4 text-purple-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingNote(note)}
                  title="編集"
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(note.id)}
                  title="削除"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            {note.note_type === "call" && note.contact_person && (
              <p className="text-sm text-gray-600 mb-2">
                相手: {note.contact_person}
              </p>
            )}
            {note.note_type === "meeting" && (
              <>
                {note.participants && (
                  <p className="text-sm text-gray-600">
                    参加者: {note.participants}
                  </p>
                )}
                {note.location && (
                  <p className="text-sm text-gray-600">
                    場所: {note.location}
                  </p>
                )}
              </>
            )}
            <p className="text-gray-600 whitespace-pre-wrap mt-2">
              {note.content}
            </p>
            {note.note_type === "meeting" && note.meeting_note_attachments && (
              <NoteAttachments noteId={note.id} attachments={note.meeting_note_attachments} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              電話メモ
            </CardTitle>
          </div>
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

      <Card className="w-full bg-white border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Notebook className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              議事録
            </CardTitle>
          </div>
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

      <CreateNoteDialog
        projectId={projectId}
        open={isCreateMeetingDialogOpen}
        onOpenChange={setIsCreateMeetingDialogOpen}
        noteType="meeting"
        title="議事録の作成"
        noteCount={meetingNotes.length}
      />
      <CreateNoteDialog
        projectId={projectId}
        open={isCreateCallDialogOpen}
        onOpenChange={setIsCreateCallDialogOpen}
        noteType="call"
        title="電話メモの作成"
        noteCount={callNotes.length}
      />
      {editingNote && (
        <EditNoteDialog
          note={editingNote}
          open={!!editingNote}
          onOpenChange={(open) => !open && setEditingNote(null)}
        />
      )}
    </div>
  );
}