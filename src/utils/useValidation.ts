import { ref, computed } from 'vue'
import type { Account, FieldValidation, AccountValidation } from '../types/account'
import { AccountType } from '../types/account'
import { VALIDATION_RULES } from '../types/constants'

export const useValidation = () => {
  const validationState = ref<Map<string, AccountValidation>>(new Map())

  const validateField = (value: string, rules: {
    required?: boolean
    maxLength?: number
    minLength?: number
  }): FieldValidation => {
    const result: FieldValidation = {
      isValid: true,
      errorMessage: undefined
    }

    if (rules.required && (!value || value.trim().length === 0)) {
      result.isValid = false
      result.errorMessage = 'Поле обязательно для заполнения'
      return result
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      result.isValid = false
      result.errorMessage = `Максимальная длина: ${rules.maxLength} символов`
      return result
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      result.isValid = false
      result.errorMessage = `Минимальная длина: ${rules.minLength} символов`
      return result
    }

    return result
  }

  const validateLabels = (labels: string): FieldValidation => {
    return validateField(labels, {
      required: false,
      maxLength: VALIDATION_RULES.maxLabelsLength
    })
  }

  const validateLogin = (login: string): FieldValidation => {
    return validateField(login, {
      required: true,
      maxLength: VALIDATION_RULES.maxLoginLength
    })
  }

  const validatePassword = (password: string, accountType: AccountType): FieldValidation => {
    if (accountType === AccountType.LDAP) {
      return { isValid: true }
    }

    return validateField(password, {
      required: true,
      maxLength: VALIDATION_RULES.maxPasswordLength
    })
  }

  const validateAccountType = (type: AccountType | null): FieldValidation => {
    if (!type) {
      return {
        isValid: false,
        errorMessage: 'Тип записи обязателен для заполнения'
      }
    }

    return { isValid: true }
  }

  const validateAccount = (account: {
    labels?: string
    type: AccountType
    login: string
    password: string
  }): AccountValidation => {
    const labelsValidation = validateLabels(account.labels || '')
    const typeValidation = validateAccountType(account.type)
    const loginValidation = validateLogin(account.login)
    const passwordValidation = validatePassword(account.password, account.type)

    return {
      labels: labelsValidation,
      type: typeValidation,
      login: loginValidation,
      password: passwordValidation
    }
  }

  const isAccountValid = (validation: AccountValidation): boolean => {
    return validation.labels.isValid &&
           validation.type.isValid &&
           validation.login.isValid &&
           validation.password.isValid
  }

  const setAccountValidation = (accountId: string, validation: AccountValidation): void => {
    validationState.value.set(accountId, validation)
  }

  const getAccountValidation = (accountId: string): AccountValidation | undefined => {
    return validationState.value.get(accountId)
  }

  const removeAccountValidation = (accountId: string): void => {
    validationState.value.delete(accountId)
  }

  const clearValidationStates = (): void => {
    validationState.value.clear()
  }

  const getValidationClass = (fieldValidation: FieldValidation): string => {
    return fieldValidation.isValid ? '' : 'validation-error'
  }

  const allValidationStates = computed(() => {
    return Object.fromEntries(validationState.value)
  })

  return {
    validationState: validationState,
    allValidationStates,

    // Field validation methods
    validateField,
    validateLabels,
    validateLogin,
    validatePassword,
    validateAccountType,

    // Account validation methods
    validateAccount,
    isAccountValid,

    // State management methods
    setAccountValidation,
    getAccountValidation,
    removeAccountValidation,
    clearValidationStates,

    // Utility methods
    getValidationClass
  }
}
