import { forwardRef } from 'react';
import { TextInput, type TextInputProps } from 'react-native';
import { cssInterop } from 'nativewind';

cssInterop(TextInput, {
  className: {
    target: 'style',
  },
});

export const Input = forwardRef<TextInput, TextInputProps & { className?: string }>(
  ({ className = '', style, placeholderTextColor = '#9ca3af', ...props }, ref) => (
    <TextInput
      ref={ref}
      className={`h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 focus:border-indigo-400 focus:outline-none ${className}`}
      style={style}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
