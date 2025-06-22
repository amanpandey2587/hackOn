
import React, { useState, useRef, useCallback } from "react";
import { Mic } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

interface NetflixStreamerProps {
  onTranscriptionReceived: (transcription: string) => void;
}

const NetflixStreamer: React.FC<NetflixStreamerProps> = ({ onTranscriptionReceived }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { getToken } = useAuth();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
const interimTranscriptRef = useRef<string>("");

const startSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('⚠️ Web Speech API not supported in this browser');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      interimTranscript += result[0].transcript;
    }
    interimTranscriptRef.current = interimTranscript;
    console.log('🎙️ Interim transcript:', interimTranscript);
  };

  recognition.onerror = (event) => {
    console.error('🎙️ Speech recognition error:', event.error);
  };

  recognitionRef.current = recognition;
  recognition.start();
  console.log('🎙️ Speech recognition started');
};

const stopSpeechRecognition = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop();
    console.log('🎙️ Speech recognition stopped');
  }
};


  const convertToWAV = useCallback(async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();

      fileReader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
          resolve(wavBlob);
        } catch (error) {
          console.error("🎵 Error converting to WAV:", error);
          resolve(audioBlob);
        }
      };
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }, []);

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    const writeString = (str: string): void => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
      pos += str.length;
    };

    const writeUint32 = (data: number): void => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    const writeUint16 = (data: number): void => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    writeString("RIFF");
    writeUint32(length - 8);
    writeString("WAVE");
    writeString("fmt ");
    writeUint32(16);
    writeUint16(1);
    writeUint16(buffer.numberOfChannels);
    writeUint32(buffer.sampleRate);
    writeUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    writeUint16(buffer.numberOfChannels * 2);
    writeUint16(16);
    writeString("data");
    writeUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  const uploadAudio = async (audioBlob: Blob): Promise<void> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const token = await getToken();
      
      const response = await fetch('http://localhost:4000/api/get-audio/getAudio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload result: ',result)
        
      }else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      console.log(' Upload process completed');
      setIsUploading(false);
    }
  };

  const handleMicClick = async (): Promise<void> => {
    
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      stopSpeechRecognition();  
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
  
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
  
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
  
        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
  
        mediaRecorder.onstop = async () => {
          
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          
          const wavBlob = await convertToWAV(audioBlob);
          
          await uploadAudio(wavBlob);
          stream.getTracks().forEach((track) => track.stop());
  
          const finalTranscript = interimTranscriptRef.current.trim();
          if (finalTranscript) {
            console.log('🚀 Sending transcribed voice to onTranscriptionReceived:', finalTranscript);
            if (onTranscriptionReceived) {
              onTranscriptionReceived(finalTranscript);
            }
          } else {
            console.warn('⚠️ No transcribed text available');
          }
  
          interimTranscriptRef.current = '';
        };
  
        mediaRecorder.start(100);
        setIsRecording(true);
        console.log('🎙️ Recording started successfully');
  
        startSpeechRecognition();
  
      } catch (error) {
        console.error("💥 Error starting recording:", error);
      }
    }
  };
  

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        onClick={handleMicClick}
        disabled={isUploading}
        className={`
          w-15 h-15 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
          ${isRecording ? "bg-red-800 hover:bg-red-900 animate-pulse" : 
            isUploading ? "bg-gray-400 cursor-not-allowed" : 
            "bg-red-700 hover:bg-red-800 hover:scale-110"}
          ${!isUploading && "active:scale-95"}
        `}
      >
        <Mic size={16} className={`text-white ${isRecording ? "animate-pulse" : ""}`} />
      </button>
     
    </div>
  );
};

export default NetflixStreamer;