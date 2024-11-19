import { useState } from "react";

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  const toggleVoiceInput = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('お使いのブラウザは音声入力に対応していません。');
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.lang = 'ja-JP';
    newRecognition.continuous = true;
    newRecognition.interimResults = true;

    newRecognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      onTranscript(transcript);
    };

    newRecognition.onend = () => {
      setIsRecording(false);
    };

    newRecognition.start();
    setRecognition(newRecognition);
    setIsRecording(true);
  };

  return {
    isRecording,
    toggleVoiceInput
  };
}