import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/types/note";

interface EditNoteDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNoteDialog({
  note,
  open,
  onOpenChange,
}: EditNoteDialogProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [participants, setParticipants] = useState(note.participants || "");
  const [location, setLocation] = useState(note.location || "");
  const [contactPerson, setContactPerson] = useState(note.contact_person || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !title) return;

    try {
      setIsLoading(true);

      const updateData = {
        title,
        content,
        ...(note.note_type === "meeting" ? {
          participants,
          location,
        } : {
          contact_person: contactPerson,
        }),
      };

      const { error } = await supabase
        .from("meeting_notes")
        .update(updateData)
        .eq("id", note.id);

      if (error) throw error;

      toast({
        title: "メモを更新しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes"] });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "エラー",
        description: "メモの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {note.note_type === "meeting" ? "議事録の編集" : "電話メモの編集"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {note.note_type === "call" && (
            <div className="space-y-2">
              <Input
                placeholder="相手"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
          )}

          {note.note_type === "meeting" && (
            <>
              <div className="space-y-2">
                <Input
                  placeholder="参加者"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="場所"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Textarea
              placeholder="内容"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[200px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading}
            >
              更新
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}