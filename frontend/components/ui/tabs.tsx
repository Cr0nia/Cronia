import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, createContext, useContext, type ReactNode } from 'react';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <View style={styles.container}>{children}</View>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return <View style={styles.list}>{children}</View>;
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <TouchableOpacity
      style={[styles.trigger, isActive && styles.triggerActive]}
      onPress={() => context.onChange(value)}
      activeOpacity={0.7}
    >
      <Text style={[styles.triggerText, isActive && styles.triggerTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  list: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  trigger: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerActive: {
    backgroundColor: '#f3f4f6',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  triggerTextActive: {
    color: '#111827',
  },
  content: {
    marginTop: 16,
  },
});
