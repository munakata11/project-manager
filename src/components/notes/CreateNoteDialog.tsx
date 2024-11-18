import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../AuthProvider";
import { NoteForm } from "./NoteForm";

interface CreateNoteDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: "meeting" | "call";
  title: string;
  noteCount: number;
}

export function CreateNoteDialog({
  projectId,
  open,
  onOpenChange,
  noteType,
  title,
  noteCount,
}: CreateNoteDialogProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useAITitle, setUseAITitle] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const generateTitle = async (content: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { content }
      });

      if (error) throw error;
      return data.title;
    } catch (error) {
      console.error("Error generating title:", error);
      throw error;
    }
  };

  const uploadFile = async (file: File, noteId: string) => {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${noteId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("meeting-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("meeting_note_attachments")
        .insert({
          note_id: noteId,
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          size: file.size,
          uploaded_by: session?.user.id,
        });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || (!noteTitle && !useAITitle)) return;

    try {
      setIsLoading(true);
      let finalTitle = noteTitle;

      if (useAITitle) {
        try {
          finalTitle = await generateTitle(content);
        } catch (error) {
          toast({
            title: "エラー",
            description: "タイトルの生成に失敗しました。",
            variant: "destructive",
          });
          return;
        }
      }

      const formattedTitle = `${noteType === "meeting" ? "議事録" : "電話メモ"}#${noteCount + 1} ${finalTitle}`;

      const { data: noteData, error } = await supabase
        .from("meeting_notes")
        .insert({
          project_id: projectId,
          title: formattedTitle,
          content,
          note_type: noteType,
          created_by: session?.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (files.length > 0) {
        for (const file of files) {
          await uploadFile(file, noteData.id);
        }
      }

      toast({
        title: noteType === "meeting" ? "議事録を作成しました" : "電話メモを作成しました",
      });

      queryClient.invalidateQueries({ queryKey: ["meeting-notes", projectId] });
      onOpenChange(false);
      setNoteTitle("");
      setContent("");
      setUseAITitle(true);
      setFiles([]);
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "エラー",
        description: noteType === "meeting" ? "議事録の作成に失敗しました。" : "電話メモの作成に失敗しました。",
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
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <NoteForm
          noteTitle={noteTitle}
          setNoteTitle={setNoteTitle}
          content={content}
          setContent={setContent}
          useAITitle={useAITitle}
          setUseAITitle={setUseAITitle}
          files={files}
          setFiles={setFiles}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          noteType={noteType}
        />
      </DialogContent>
    </Dialog>
  );
}