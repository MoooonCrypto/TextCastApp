// src/utils/validation.ts

/**
 * バリデーション結果の型
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * タイトルのバリデーション（最大50文字）
 */
export const validateTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      error: 'タイトルを入力してください',
    };
  }

  if (title.length > 50) {
    return {
      isValid: false,
      error: `タイトルは50文字以内で入力してください（現在${title.length}文字）`,
    };
  }

  return { isValid: true };
};

/**
 * 本文のバリデーション（最大100,000文字）
 */
export const validateContent = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: '本文を入力してください',
    };
  }

  if (content.length > 100000) {
    return {
      isValid: false,
      error: `本文は100,000文字以内で入力してください（現在${content.length}文字）`,
    };
  }

  return { isValid: true };
};

/**
 * TextItem全体のバリデーション
 */
export const validateTextItem = (title: string, content: string): ValidationResult => {
  const titleResult = validateTitle(title);
  if (!titleResult.isValid) {
    return titleResult;
  }

  const contentResult = validateContent(content);
  if (!contentResult.isValid) {
    return contentResult;
  }

  return { isValid: true };
};

/**
 * リファラルコードのバリデーション（8桁英数字）
 */
export const validateReferralCode = (code: string): ValidationResult => {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: 'リファラルコードを入力してください',
    };
  }

  if (!/^[a-z0-9]{8}$/i.test(code)) {
    return {
      isValid: false,
      error: 'リファラルコードは8桁の英数字で入力してください',
    };
  }

  return { isValid: true };
};
