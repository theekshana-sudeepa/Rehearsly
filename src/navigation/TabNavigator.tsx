import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { ProgressScreen } from '@/screens/progress/ProgressScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { colors } from '@/theme/tokens';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Emoji tab glyphs keep Week 1 free of an icon-font dependency.
 * Swap for a vector icon set during Week 6 polish if it reads cheaply on device.
 */
function tabIcon(glyph: string) {
  return function TabIcon({ color }: { color: string }) {
    return (
      <Text style={{ color, fontSize: 20 }} accessibilityElementsHidden>
        {glyph}
      </Text>
    );
  };
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerShadowVisible: false,
        headerTintColor: colors.ink.DEFAULT,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: colors.clay[500],
        tabBarInactiveTintColor: colors.ink.faint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Practice', tabBarIcon: tabIcon('💬') }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress', tabBarIcon: tabIcon('📈') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', tabBarIcon: tabIcon('⚙️') }}
      />
    </Tab.Navigator>
  );
}
