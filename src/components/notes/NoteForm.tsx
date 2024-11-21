import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mic } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface NoteFormProps {
  noteTitle: string;
  setNoteTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  useAITitle: boolean;
  setUseAITitle: (useAI: boolean) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  noteType: "meeting" | "call";
  participants?: string;
  setParticipants?: (participants: string) => void;
  location?: string;
  setLocation?: (location: string) => void;
  contactPerson?: string;
  setContactPerson?: (contactPerson: string) => void;
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
  const { toast } = useToast();
  const { isRecording, toggleVoiceInput } = useSpeechRecognition((transcript) => {
    setContent(content + transcript);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) {
      toast({
        title: "エラー",
        description: "内容を入力してください",
        variant: "destructive",
      });
      return;
    }
    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="タイトル"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="border-gray-200"
          disabled={useAITitle}
        />
        <label className="ml-2 flex items-center">
          <input
            type="checkbox"
            checked={useAITitle}
            onChange={(e) => setUseAITitle(e.target.checked)}
            className="mr-1"
          />
          AI
        </label>
      </div>

      {noteType === "meeting" && (
        <>
          <Input
            placeholder="参加者"
            value={participants}
            onChange={(e) => setParticipants?.(e.target.value)}
            className="border-gray-200"
          />
          <Input
            placeholder="場所"
            value={location}
            onChange={(e) => setLocation?.(e.target.value)}
            className="border-gray-200"
          />
        </>
      )}

      {noteType === "call" && (
        <Input
          placeholder="相手"
          value={contactPerson}
          onChange={(e) => setContactPerson?.(e.target.value)}
          className="border-gray-200"
        />
      )}

      <div className="space-y-2">
        <Textarea
          placeholder="内容を入力"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] border-gray-200"
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" onClick={onCancel} variant="ghost">
          キャンセル
        </Button>
        <Button
          type="button"
          onClick={toggleVoiceInput}
          variant="outline"
          className={`flex items-center gap-2 ${isRecording ? "text-blue-500" : ""}`}
        >
          <Mic className={`h-4 w-4 ${isRecording ? "text-blue-500" : ""}`} />
          {isRecording ? "停止" : "音声入力"}
        </Button>
        <Button type="submit" disabled={isLoading}>
          保存
        </Button>
      </div>
    </form>
  );
}