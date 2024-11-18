export interface Note {
  id: string;
  title: string;
  content: string | null;
  note_type: "meeting" | "call";
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