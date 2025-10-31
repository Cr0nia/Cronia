import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { useState, createContext, useContext, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectContextValue {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange: onValueChange, open, setOpen }}>
      <View>{children}</View>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  return (
    <TouchableOpacity
      style={styles.trigger}
      onPress={() => context.setOpen(true)}
      activeOpacity={0.7}
    >
      <View style={styles.triggerContent}>{children}</View>
      <ChevronDown color="#6b7280" size={20} />
    </TouchableOpacity>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  return (
    <Text style={styles.value}>
      {context.value || placeholder}
    </Text>
  );
}

interface SelectContentProps {
  children: ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  return (
    <Modal
      visible={context.open}
      transparent
      animationType="fade"
      onRequestClose={() => context.setOpen(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => context.setOpen(false)}
      >
        <View style={styles.content}>
          <ScrollView style={styles.scrollView}>
            {children}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const isSelected = context.value === value;

  return (
    <TouchableOpacity
      style={[styles.item, isSelected && styles.itemSelected]}
      onPress={() => {
        context.onChange(value);
        context.setOpen(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
        {children}
      </Text>
      {isSelected && <Check color="#6366f1" size={20} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  triggerContent: {
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollView: {
    maxHeight: 400,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemSelected: {
    backgroundColor: '#eef2ff',
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  itemTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
});
