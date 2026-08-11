import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-cream">
      <Text className="text-title2 font-semibold text-ink">Rehearsly</Text>
      <StatusBar style="dark" />
    </View>
  );
}
