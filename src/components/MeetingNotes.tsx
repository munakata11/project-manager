import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Notebook } from "lucide-react";
import { CreateNoteDialog } from "./notes/CreateNoteDialog";
import { EditNoteDialog } from "./notes/EditNoteDialog";
import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/types/note";
import { NoteSection } from "./notes/NoteSection";

interface MeetingNotesProps {
  projectId: string;
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

  return (
    <div className="space-y-6">
      <NoteSection
        title="電話メモ"
        icon={<Phone className="h-5 w-5 text-gray-500" />}
        notes={callNotes}
        onCreateClick={() => setIsCreateCallDialogOpen(true)}
        onEdit={setEditingNote}
        onDelete={handleDelete}
        onFormat={handleFormat}
      />

      <NoteSection
        title="議事録"
        icon={<Notebook className="h-5 w-5 text-gray-500" />}
        notes={meetingNotes}
        onCreateClick={() => setIsCreateMeetingDialogOpen(true)}
        onEdit={setEditingNote}
        onDelete={handleDelete}
        onFormat={handleFormat}
      />

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