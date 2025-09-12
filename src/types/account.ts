export const AccountType = {
  LDAP: 'LDAP',
  LOCAL: 'LOCAL'
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export interface Label {
  text: string;
}

export interface Account {
  id: string;
  labels: Label[];
  type: AccountType;
  login: string;
  password: string | null;
}

export interface CreateAccountDto {
  labels?: string;
  type: AccountType;
  login: string;
  password?: string;
}

export interface FieldValidation {
  isValid: boolean;
  errorMessage?: string;
}

export interface AccountValidation {
  labels: FieldValidation;
  type: FieldValidation;
  login: FieldValidation;
  password: FieldValidation;
}

export interface ValidationRules {
  maxLabelsLength: number;
  maxLoginLength: number;
  maxPasswordLength: number;
}
