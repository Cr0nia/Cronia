import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  onPress,
  variant = 'default',
  disabled = false,
  loading = false,
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [styles.button];
  const textStyle: TextStyle[] = [styles.text];

  if (variant === 'default') {
    buttonStyle.push(styles.buttonDefault);
    textStyle.push(styles.textDefault);
  } else if (variant === 'ghost') {
    buttonStyle.push(styles.buttonGhost);
    textStyle.push(styles.textGhost);
  } else if (variant === 'outline') {
    buttonStyle.push(styles.buttonOutline);
    textStyle.push(styles.textOutline);
  }

  if (disabled) {
    buttonStyle.push(styles.buttonDisabled);
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'default' ? '#ffffff' : '#6366f1'} />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDefault: {
    backgroundColor: '#6366f1',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  textDefault: {
    color: '#ffffff',
  },
  textGhost: {
    color: '#6b7280',
  },
  textOutline: {
    color: '#111827',
  },
});
