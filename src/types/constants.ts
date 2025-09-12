import type { ValidationRules } from './account';

export const VALIDATION_RULES: ValidationRules = {
  maxLabelsLength: 50,
  maxLoginLength: 100,
  maxPasswordLength: 100
};

export const STORAGE_KEY = 'accounts_data';

export const VALIDATION_MESSAGES = {
  LABELS_TOO_LONG: `Метки не должны превышать ${VALIDATION_RULES.maxLabelsLength} символов`,
  LOGIN_REQUIRED: 'Логин обязателен для заполнения',
  LOGIN_TOO_LONG: `Логин не должен превышать ${VALIDATION_RULES.maxLoginLength} символов`,
  PASSWORD_REQUIRED: 'Пароль обязателен для заполнения',
  PASSWORD_TOO_LONG: `Пароль не должен превышать ${VALIDATION_RULES.maxPasswordLength} символов`,
  TYPE_REQUIRED: 'Тип записи обязателен для заполнения'
};

