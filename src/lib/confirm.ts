import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export async function confirmDestructive({
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
}: ConfirmOptions) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true;
    }

    return window.confirm(`${title}\n\n${message}`);
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    Alert.alert(
      title,
      message,
      [
        {
          text: cancelLabel,
          style: 'cancel',
          onPress: () => finish(false),
        },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => finish(true),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => finish(false),
      }
    );
  });
}
