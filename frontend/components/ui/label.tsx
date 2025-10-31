import { Text, type TextProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(Text, {
  className: {
    target: 'style',
  },
});

export function Label({ className = '', style, children, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      className={`text-sm font-semibold text-slate-600 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}
