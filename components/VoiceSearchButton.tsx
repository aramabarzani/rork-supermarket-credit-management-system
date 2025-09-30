import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { trpc } from '@/lib/trpc';
import { KurdishText } from './KurdishText';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  language?: 'ku' | 'en';
  searchType?: 'customer' | 'employee' | 'debt' | 'payment' | 'phone' | 'date' | 'amount' | 'general';
}

export default function VoiceSearchButton({ onResult, language = 'ku', searchType = 'general' }: VoiceSearchButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const voiceSearchMutation = trpc.voice.search.useMutation();

  const startRecording = async () => {
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
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
              const result = await voiceSearchMutation.mutateAsync({
                audioUri: base64data,
                searchType,
                language,
              });
              onResult(result.text);
            } catch (error) {
              console.error('Voice search error:', error);
              Alert.alert('هەڵە', 'گەڕانی دەنگی سەرکەوتوو نەبوو');
            }
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
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
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('هەڵە', 'تۆمارکردنی دەنگ سەرکەوتوو نەبوو');
    }
  };

  const stopRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (mediaRecorder) {
          mediaRecorder.stop();
          setMediaRecorder(null);
        }
      } else {
        if (recording) {
          await recording.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
          });

          const uri = recording.getURI();
          if (uri) {
            try {
              const result = await voiceSearchMutation.mutateAsync({
                audioUri: uri,
                searchType,
                language,
              });
              onResult(result.text);
            } catch (error) {
              console.error('Voice search error:', error);
              Alert.alert('هەڵە', 'گەڕانی دەنگی سەرکەوتوو نەبوو');
            }
          }
          setRecording(null);
        }
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('هەڵە', 'وەستاندنی تۆمارکردن سەرکەوتوو نەبوو');
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={toggleRecording}
        disabled={voiceSearchMutation.isPending}
      >
        {isRecording ? (
          <MicOff size={24} color="#fff" />
        ) : (
          <Mic size={24} color="#fff" />
        )}
      </TouchableOpacity>
      {isRecording && (
        <KurdishText style={styles.recordingText}>تۆمارکردن...</KurdishText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600' as const,
  },
});
