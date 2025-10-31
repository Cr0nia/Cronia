import { Stack } from 'expo-router';

export default function MerchantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="merchant-dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="advance" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="receive" />
    </Stack>
  );
}
