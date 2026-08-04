import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const MAX_VISIBLES = 2

  function add(message, type = 'success', duration = 3500) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
    const id = Date.now()
    toasts.value.push({ id, message, type, icon: icons[type] })
    if (toasts.value.length > MAX_VISIBLES) toasts.value.shift()
    setTimeout(() => remove(id), duration)
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(msg) { add(msg, 'success') }
  function error(msg) { add(msg, 'error') }
  function warning(msg) { add(msg, 'warning') }
  function info(msg) { add(msg, 'info') }

  return { toasts, add, remove, success, error, warning, info }
})