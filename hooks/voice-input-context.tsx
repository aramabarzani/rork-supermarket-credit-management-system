import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  lastTranscription: string | null;
}

export const [VoiceInputContext, useVoiceInput] = createContextHook(() => {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    isProcessing: false,
    lastTranscription: null,
  });

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const voiceSearchMutation = trpc.voice.search.useMutation();

  const startRecording = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          setState((prev) => ({ ...prev, isProcessing: true }));
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
              const result = await voiceSearchMutation.mutateAsync({
                audioUri: base64data,
                language: 'ku',
              });
              setState({
                isRecording: false,
                isProcessing: false,
                lastTranscription: result.text,
              });
            } catch (error) {
              console.error('Voice input error:', error);
              Alert.alert('هەڵە', 'نووسینی دەنگی سەرکەوتوو نەبوو');
              setState({ isRecording: false, isProcessing: false, lastTranscription: null });
            }
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setState((prev) => ({ ...prev, isRecording: true }));
      } else {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        });

        setRecording(newRecording);
        setState((prev) => ({ ...prev, isRecording: true }));
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('هەڵە', 'تۆمارکردنی دەنگ سەرکەوتوو نەبوو');
    }
  }, [voiceSearchMutation]);

  const stopRecording = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorder) {
          mediaRecorder.stop();
          setMediaRecorder(null);
        }
      } else {
        if (recording) {
          setState((prev) => ({ ...prev, isProcessing: true }));
          await recording.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
          });

          const uri = recording.getURI();
          if (uri) {
            try {
              const result = await voiceSearchMutation.mutateAsync({
                audioUri: uri,
                language: 'ku',
              });
              setState({
                isRecording: false,
                isProcessing: false,
                lastTranscription: result.text,
              });
            } catch (error) {
              console.error('Voice input error:', error);
              Alert.alert('هەڵە', 'نووسینی دەنگی سەرکەوتوو نەبوو');
              setState({ isRecording: false, isProcessing: false, lastTranscription: null });
            }
          }
          setRecording(null);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('هەڵە', 'وەستاندنی تۆمارکردن سەرکەوتوو نەبوو');
      setState({ isRecording: false, isProcessing: false, lastTranscription: null });
    }
  }, [recording, mediaRecorder, voiceSearchMutation]);

  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  const clearTranscription = useCallback(() => {
    setState((prev) => ({ ...prev, lastTranscription: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscription,
  };
});
