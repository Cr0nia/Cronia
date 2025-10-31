import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona para a tela de onboarding
  // Em produção, você pode verificar se o usuário já está autenticado
  // e redirecionar para (tabs) se sim
  return <Redirect href="/(auth)/onboarding" />;
}
