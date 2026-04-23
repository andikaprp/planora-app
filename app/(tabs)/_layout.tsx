import { Tabs } from 'expo-router';
import { PlanoraTabBar } from '@/src/components/planora-ui';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="todo"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <PlanoraTabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          href: null,
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: 'To-do',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Pelajaran',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: 'Profil',
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          href: null,
          title: 'Flashcards',
        }}
      />
    </Tabs>
  );
}
