import { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  lastTranscription: string | null;
}

export const [VoiceInputContext, useVoiceInput] = createContextHook(() => {
  const state = useMemo<VoiceInputState>(() => ({
    isRecording: false,
    isProcessing: false,
    lastTranscription: null,
  }), []);

  const startRecording = useCallback(async () => {
    Alert.alert('گەڕانی دەنگی', 'ئەم تایبەتمەندییە لە ئێستادا بەردەست نییە');
  }, []);

  const stopRecording = useCallback(async () => {
  }, []);

  const toggleRecording = useCallback(() => {
    Alert.alert('گەڕانی دەنگی', 'ئەم تایبەتمەندییە لە ئێستادا بەردەست نییە');
  }, []);

  const clearTranscription = useCallback(() => {
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscription,
  };
});
