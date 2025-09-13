<template>
  <div class="accounts-manager">
    <div class="accounts-manager__header">
      <h2 class="accounts-manager__title">Управление учетными записями</h2>
      <el-button
        type="primary"
        :icon="Plus"
        size="large"
        @click="handleAddAccount"
        class="accounts-manager__add-btn"
      >
        Добавить учетную запись
      </el-button>
    </div>

    <div class="accounts-manager__list">
      <div
        v-for="account in accountStore.accounts"
        :key="account.id"
        class="account-item"
      >
        <el-card class="account-item__card">
          <div class="account-item__content">
            
            <div class="account-item__field">
              <label class="account-item__label">Метки:</label>
              <el-input
                v-model="account.labelsString"
                placeholder="Введите метки через ;"
                maxlength="50"
                show-word-limit
                :class="getValidationClass('labels', account.id)"
                @blur="() => handleFieldBlur('labels', account.id, account.labelsString || '')"
                @input="(value: string) => handleLabelsInput(account.id, value)"
                class="account-item__input"
              />
              <div 
                v-if="getFieldValidation('labels', account.id)?.errorMessage"
                class="account-item__error"
              >
                {{ getFieldValidation('labels', account.id)?.errorMessage }}
              </div>
            </div>

            <div class="account-item__field">
              <label class="account-item__label">Тип записи:</label>
              <el-select
                v-model="account.type"
                placeholder="Выберите тип записи"
                :class="getValidationClass('type', account.id)"
                @change="(value: AccountType) => handleTypeChange(account.id, value)"
                class="account-item__select"
              >
                <el-option
                  :value="AccountType.LOCAL"
                  label="Локальная"
                />
                <el-option
                  :value="AccountType.LDAP"
                  label="LDAP"
                />
              </el-select>
              <div 
                v-if="getFieldValidation('type', account.id)?.errorMessage"
                class="account-item__error"
              >
                {{ getFieldValidation('type', account.id)?.errorMessage }}
              </div>
            </div>

            <div class="account-item__field">
              <label class="account-item__label">Логин:</label>
              <el-input
                v-model="account.login"
                placeholder="Введите логин"
                maxlength="100"
                show-word-limit
                :class="getValidationClass('login', account.id)"
                @blur="() => handleFieldBlur('login', account.id, account.login)"
                @input="(value: string) => handleLoginInput(account.id, value)"
                class="account-item__input"
              />
              <div 
                v-if="getFieldValidation('login', account.id)?.errorMessage"
                class="account-item__error"
              >
                {{ getFieldValidation('login', account.id)?.errorMessage }}
              </div>
            </div>

            <div 
              v-if="account.type === AccountType.LOCAL"
              class="account-item__field"
            >
              <label class="account-item__label">Пароль:</label>
              <el-input
                v-model="account.password"
                type="password"
                placeholder="Введите пароль"
                maxlength="100"
                show-word-limit
                show-password
                :class="getValidationClass('password', account.id)"
                @blur="() => handleFieldBlur('password', account.id, account.password || '')"
                @input="(value: string) => handlePasswordInput(account.id, value)"
                class="account-item__input"
              />
              <div 
                v-if="getFieldValidation('password', account.id)?.errorMessage"
                class="account-item__error"
              >
                {{ getFieldValidation('password', account.id)?.errorMessage }}
              </div>
            </div>

            <div class="account-item__actions">
              <el-button
                type="danger"
                :icon="Delete"
                size="small"
                @click="handleDeleteAccount(account.id)"
                class="account-item__delete-btn"
              >
                Удалить запись
              </el-button>
            </div>

          </div>
        </el-card>
      </div>

      <div v-if="!accountStore.hasAccounts" class="accounts-manager__empty">
        <h2>Добавьте учетную запись</h2>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useAccountStore } from '../stores/accountStore'
import { useValidation } from '../utils/useValidation'
import { AccountType } from '../types/account'
import type { Account } from '../types/account'

interface AccountForm extends Omit<Account, 'labels'> {
  labelsString?: string
}

const accountStore = useAccountStore()
const validation = useValidation()

onMounted(() => {
  accountStore.loadFromStorage()
})

const handleAddAccount = (): void => {
  const newAccount = accountStore.addAccount()
  const accountForm = newAccount as AccountForm
  accountForm.labelsString = ''
}

const handleDeleteAccount = (accountId: string): void => {
  accountStore.deleteAccount(accountId)
  validation.removeAccountValidation(accountId)
}

const handleLabelsInput = (accountId: string, value: string): void => {
  const account = accountStore.getAccountById(accountId) as AccountForm
  if (account) {
    account.labelsString = value
  }
}

const handleLoginInput = (accountId: string, value: string): void => {
  accountStore.updateAccount(accountId, { login: value })
}

const handlePasswordInput = (accountId: string, value: string): void => {
  accountStore.updateAccount(accountId, { password: value })
}

const handleTypeChange = (accountId: string, type: AccountType): void => {
  accountStore.updateAccount(accountId, { type })
  
  const typeValidation = validation.validateAccountType(type)
  const currentValidation = validation.getAccountValidation(accountId) || {
    labels: { isValid: true },
    type: { isValid: true },
    login: { isValid: true },
    password: { isValid: true }
  }
  
  currentValidation.type = typeValidation
  validation.setAccountValidation(accountId, currentValidation)
}

const handleFieldBlur = (fieldName: string, accountId: string, value: string): void => {
  const account = accountStore.getAccountById(accountId)
  if (!account) return

  let fieldValidation
  let needsUpdate = false

  switch (fieldName) {
    case 'labels':
      fieldValidation = validation.validateLabels(value)
      accountStore.updateAccount(accountId, { labels: value })
      needsUpdate = true
      break
    case 'login':
      fieldValidation = validation.validateLogin(value)
      break
    case 'password':
      fieldValidation = validation.validatePassword(value, account.type)
      break
    case 'type':
      fieldValidation = validation.validateAccountType(account.type)
      break
    default:
      return
  }

  const currentValidation = validation.getAccountValidation(accountId) || {
    labels: { isValid: true },
    type: { isValid: true },
    login: { isValid: true },
    password: { isValid: true }
  }

  currentValidation[fieldName as keyof typeof currentValidation] = fieldValidation
  validation.setAccountValidation(accountId, currentValidation)

  if (fieldValidation.isValid && validation.isAccountValid(currentValidation)) {
  }
}

const getFieldValidation = (fieldName: string, accountId: string) => {
  const accountValidation = validation.getAccountValidation(accountId)
  return accountValidation?.[fieldName as keyof typeof accountValidation]
}

const getValidationClass = (fieldName: string, accountId: string): string => {
  const fieldValidation = getFieldValidation(fieldName, accountId)
  return fieldValidation && !fieldValidation.isValid ? 'validation-error' : ''
}
</script>

<style scoped>
.accounts-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.accounts-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.accounts-manager__title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.accounts-manager__add-btn {
  height: 40px;
}

.accounts-manager__hint {
  margin-bottom: 24px;
}

.accounts-manager__hint p {
  margin: 8px 0;
  font-size: 14px;
}

.accounts-manager__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.accounts-manager__empty {
 background-color: #5c5c5c8e;
 width: 100%;
 height: 300px;
 margin-top: 150px;
 text-align: center;
 display: flex;
 justify-content: center;
 align-items: center;
 border-radius: 16px;
 /* border: 1px solid red; */
}

.account-item__card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.account-item__card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.account-item__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  align-items: start;
}

.account-item__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item__label {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.account-item__input,
.account-item__select {
  width: 100%;
}

.account-item__error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.account-item__actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
  margin-top: 8px;
}

.account-item__delete-btn {
  height: 32px;
}

:deep(.validation-error .el-input__wrapper) {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

:deep(.validation-error .el-input__wrapper:hover) {
  border-color: #f56c6c !important;
}

:deep(.validation-error .el-input__wrapper.is-focus) {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

:deep(.validation-error .el-select .el-input__wrapper) {
  border-color: #f56c6c !important;
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}
</style>
