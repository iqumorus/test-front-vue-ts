import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account, CreateAccountDto, Label } from '../types/account'
import { AccountType } from '../types/account'
import { STORAGE_KEY } from '../types/constants'

export const useAccountStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  const accountsCount = computed(() => accounts.value.length)
  const hasAccounts = computed(() => accounts.value.length > 0)

  const generateId = (): string => {
    return `accountid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const parseLabels = (labelsString: string): Label[] => {
    if (!labelsString.trim()) {
      return []
    }
    
    return labelsString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }

  const addAccount = (): Account => {
    const newAccount: Account = {
      id: generateId(),
      labels: [],
      type: AccountType.LOCAL,
      login: '',
      password: ''
    }
    
    accounts.value.push(newAccount)
    saveToStorage()
    return newAccount
  }

  const updateAccount = (accountId: string, updateData: Partial<CreateAccountDto>): void => {
    const accountIndex = accounts.value.findIndex(acc => acc.id === accountId)
    
    if (accountIndex === -1) {
      console.error(`this account is not found`)
      return
    }

    const account = accounts.value[accountIndex]
    
    if (updateData.labels !== undefined) {
      account.labels = parseLabels(updateData.labels)
    }
    
    if (updateData.type !== undefined) {
      account.type = updateData.type
      if (updateData.type === AccountType.LDAP) {
        account.password = null
      }
    }
    
    if (updateData.login !== undefined) {
      account.login = updateData.login
    }
    
    if (updateData.password !== undefined && account.type === AccountType.LOCAL) {
      account.password = updateData.password
    }

    saveToStorage()
  }

  const deleteAccount = (accountId: string): void => {
    const accountIndex = accounts.value.findIndex(acc => acc.id === accountId)
    
    if (accountIndex !== -1) {
      accounts.value.splice(accountIndex, 1)
      saveToStorage()
    }
  }

  const saveToStorage = (): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.value))
    } catch (error) {
      console.error('failed to save accounts in localstorage')
    }
  }

  const loadFromStorage = (): void => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedAccounts = JSON.parse(storedData) as Account[]
        accounts.value = parsedAccounts
      }
    } catch (error) {
      console.error('failed to load accounts from localStorage')
      accounts.value = []
    }
  }

  const getAccountById = (accountId: string): Account | undefined => {
    return accounts.value.find(acc => acc.id === accountId)
  }

  const clearAllAccounts = (): void => {
    accounts.value = []
    saveToStorage()
  }

  return {
    // State
    accounts: accounts,
    
    // Getters
    accountsCount,
    hasAccounts,
    
    // Actions
    addAccount,
    updateAccount,
    deleteAccount,
    saveToStorage,
    loadFromStorage,
    getAccountById,
    clearAllAccounts,
    
    // Utilities
    parseLabels
  }
})
