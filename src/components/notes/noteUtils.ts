import { supabase } from "@/integrations/supabase/client";

export const uploadAttachment = async (file: File, noteId: string, userId: string) => {
  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${noteId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("meeting-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from("meeting_note_attachments")
      .insert({
        note_id: noteId,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        uploaded_by: userId,
      });

    if (dbError) throw dbError;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};