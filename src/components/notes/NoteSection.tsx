import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Note } from "@/types/note";
import { NoteCard } from "./NoteCard";

interface NoteSectionProps {
  title: string;
  icon: React.ReactNode;
  notes: Note[];
  onCreateClick: () => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onFormat: (note: Note) => void;
}

export function NoteSection({
  title,
  icon,
  notes,
  onCreateClick,
  onEdit,
  onDelete,
  onFormat,
}: NoteSectionProps) {
  return (
    <Card className="w-full bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>
        </div>
        <Button
          onClick={onCreateClick}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onFormat={onFormat}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}