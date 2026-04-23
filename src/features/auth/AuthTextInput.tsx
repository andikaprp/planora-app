import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { planoraColors } from '@/src/components/planora-ui';

export function AuthTextInput(props: TextInputProps) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      placeholderTextColor={planoraColors.void700}
      {...props}
      style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(30, 30, 30, 0.12)',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    lineHeight: 20,
    color: planoraColors.void1000,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
