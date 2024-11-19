import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileUp, Mic } from "lucide-react";
import { FileList } from "./FileList";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface NoteFormProps {
  noteTitle: string;
  setNoteTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  useAITitle: boolean;
  setUseAITitle: (useAI: boolean) => void;
  files: File[];
  setFiles: (files: File[] | ((prev: File[]) => File[])) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  noteType: "meeting" | "call";
  participants?: string;
  setParticipants?: (participants: string) => void;
  location?: string;
  setLocation?: (location: string) => void;
  contactPerson?: string;
  setContactPerson?: (person: string) => void;
}

export function NoteForm({
  noteTitle,
  setNoteTitle,
  content,
  setContent,
  useAITitle,
  setUseAITitle,
  files,
  setFiles,
  onSubmit,
  onCancel,
  isLoading,
  noteType,
  participants,
  setParticipants,
  location,
  setLocation,
  contactPerson,
  setContactPerson,
}: NoteFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { isRecording, toggleVoiceInput } = useSpeechRecognition((transcript) => {
    setContent(prev => prev + transcript);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Input
            placeholder="タイトル"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required={!useAITitle}
            disabled={useAITitle}
            className="flex-1 mr-2"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="useAI"
              checked={useAITitle}
              onCheckedChange={(checked) => setUseAITitle(checked as boolean)}
            />
            <Label htmlFor="useAI" className="text-sm">AI生成</Label>
          </div>
        </div>
      </div>

      {noteType === "call" && setContactPerson && (
        <div className="space-y-2">
          <Input
            placeholder="相手"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>
      )}

      {noteType === "meeting" && (
        <>
          {setParticipants && (
            <div className="space-y-2">
              <Input
                placeholder="参加者"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
          )}
          {setLocation && (
            <div className="space-y-2">
              <Input
                placeholder="場所"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-2 relative">
        <Textarea
          placeholder="内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="min-h-[200px]"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`absolute bottom-2 left-2 ${isRecording ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
          onClick={toggleVoiceInput}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>

      {noteType === "meeting" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            <Label
              htmlFor="file-upload"
              className="flex items-center space-x-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
            >
              <FileUp className="h-4 w-4" />
              <span>添付ファイル追加</span>
            </Label>
          </div>
          {files.length > 0 && (
            <FileList files={files} onRemove={removeFile} />
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isLoading}
        >
          作成
        </Button>
      </div>
    </form>
  );
}
