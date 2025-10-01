import React from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mic } from 'lucide-react-native';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  language?: 'ku' | 'en';
  searchType?: 'customer' | 'employee' | 'debt' | 'payment' | 'phone' | 'date' | 'amount' | 'general';
}

export default function VoiceSearchButton({ onResult, language = 'ku', searchType = 'general' }: VoiceSearchButtonProps) {
  const handlePress = () => {
    Alert.alert('گەڕانی دەنگی', 'ئەم تایبەتمەندییە لە ئێستادا بەردەست نییە');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
      >
        <Mic size={24} color="#fff" />
      </TouchableOpacity>
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

});
