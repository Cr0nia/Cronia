import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-assets" />
      <Stack.Screen name="lock-collateral" />
      <Stack.Screen name="pay-qr" />
      <Stack.Screen name="invoices" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
