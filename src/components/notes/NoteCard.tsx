import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { Note } from "@/types/note";
import { NoteAttachments } from "./NoteAttachments";
import { Separator } from "@/components/ui/separator";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onFormat: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete, onFormat }: NoteCardProps) {
  const hasMetadata = (note.note_type === "call" && note.contact_person) ||
    (note.note_type === "meeting" && (note.participants || note.location));

  const hasAttachments = note.note_type === "meeting" && 
    note.meeting_note_attachments && 
    note.meeting_note_attachments.length > 0;

  return (
    <Card key={note.id} className="border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
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
              className="text-gray-500 hover:text-gray-700"
            >
              整形
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

        {hasMetadata && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            {note.note_type === "call" && note.contact_person && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">相手:</span> {note.contact_person}
              </p>
            )}
            {note.note_type === "meeting" && (
              <>
                {note.participants && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">参加者:</span> {note.participants}
                  </p>
                )}
                {note.location && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">場所:</span> {note.location}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <p className="text-gray-600 whitespace-pre-wrap">
          {note.content}
        </p>

        {hasAttachments && (
          <>
            <Separator className="my-4" />
            <NoteAttachments noteId={note.id} attachments={note.meeting_note_attachments} />
          </>
        )}
      </CardContent>
    </Card>
  );
}