// src/utils/alerts.ts

import { Alert } from 'react-native';

/**
 * 開発中機能のアラートを表示
 */
export const showComingSoonAlert = (featureName?: string) => {
  Alert.alert(
    '開発中',
    featureName
      ? `${featureName}は現在開発中です。\n今しばらくお待ちください。`
      : 'この機能は現在開発中です。\n今しばらくお待ちください。',
    [{ text: 'OK' }]
  );
};

/**
 * エラーアラートを表示
 */
export const showErrorAlert = (message: string, title: string = 'エラー') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

/**
 * 確認アラートを表示
 */
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'キャンセル',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'OK',
        onPress: onConfirm,
      },
    ]
  );
};

/**
 * 成功アラートを表示
 */
export const showSuccessAlert = (message: string, title: string = '成功') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};
