import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, FileText, Trash2 } from "lucide-react";
import { Note } from "@/types/note";
import { NoteAttachments } from "./NoteAttachments";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onFormat: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onFormat }: NoteCardProps) {
  return (
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
              onClick={() => onFormat(note)}
              title="整形"
            >
              <FileText className="h-4 w-4 text-purple-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(note)}
              title="編集"
            >
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(note.id)}
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
  );
}