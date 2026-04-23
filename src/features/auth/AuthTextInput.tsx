import { useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';

export function AuthTextInput(props: TextInputProps) {
  const scheme = useColorScheme();
  const styles = useMemo(() => makeStyles(scheme === 'dark'), [scheme]);
  return (
    <View style={styles.wrapper}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={styles.placeholder.color}
        {...props}
        style={[styles.input, props.style]}
      />
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: dark ? 'white' : 'black',
    },
    placeholder: {
      color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
    },
  });

