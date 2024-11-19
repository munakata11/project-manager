import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const formSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "内容は必須です"),
});

type FormData = z.infer<typeof formSchema>;

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const toast = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
    },
  });

  const { isRecording, toggleVoiceInput } = useSpeechRecognition((transcript) => {
    setContent((prev: string) => prev + transcript);
  });

  const onSubmitHandler = async (data: FormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "ノートが保存されました",
      });
    } catch (error) {
      toast({
        title: "エラー",
        description: "ノートの保存に失敗しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
      <Input
        {...form.register("title")}
        placeholder="タイトルを入力"
        className="border-gray-200"
      />
      {form.formState.errors.title && (
        <p className="text-red-500">{form.formState.errors.title.message}</p>
      )}
      <Textarea
        {...form.register("content")}
        placeholder="内容を入力"
        className="border-gray-200"
      />
      {form.formState.errors.content && (
        <p className="text-red-500">{form.formState.errors.content.message}</p>
      )}
      <div className="flex justify-between">
        <Button type="button" onClick={onCancel} variant="ghost">
          キャンセル
        </Button>
        <Button type="submit" className="bg-blue-600 text-white">
          保存
        </Button>
        <Button type="button" onClick={toggleVoiceInput} className="bg-gray-300">
          {isRecording ? "停止" : "音声入力"}
        </Button>
      </div>
    </form>
  );
}
