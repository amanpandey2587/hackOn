import React, { useState, useRef, useCallback } from 'react';
import { Mic } from 'lucide-react';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const convertToWAV = useCallback(async (audioBlob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          console.error('Error converting to WAV:', error);
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
    const channels = [];
    let offset = 0;
    let pos = 0;

    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
      pos += str.length;
    };

    const writeUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    const writeUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    writeString('RIFF');
    writeUint32(length - 8);
    writeString('WAVE');
    writeString('fmt ');
    writeUint32(16);
    writeUint16(1);
    writeUint16(buffer.numberOfChannels);
    writeUint32(buffer.sampleRate);
    writeUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    writeUint16(buffer.numberOfChannels * 2);
    writeUint16(16);
    writeString('data');
    writeUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]));
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        pos += 2;
      }
      offset++;
    }

    return arrayBuffer;
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:4000/api/get-audio/getAudio', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
      } else {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            sampleRate: 44100,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
          } 
        });
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const wavBlob = await convertToWAV(audioBlob);
          await uploadAudio(wavBlob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start(100);
        setIsRecording(true);
        
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button
        onClick={handleMicClick}
        disabled={isUploading}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
          }
          ${!isUploading && 'active:scale-95'}
        `}
      >
        <Mic 
          size={32} 
          className={`text-white ${isRecording ? 'animate-pulse' : ''}`} 
        />
      </button>
      
      {isUploading && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-gray-700">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;