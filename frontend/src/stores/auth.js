import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const estConnecte = computed(() => !!token.value)
  const estClient = computed(() => user.value?.role === 'client')
  const estCoursiere = computed(() => user.value?.role === 'coursiere')
  const estAdmin = computed(() => user.value?.role === 'admin')

  function connecter(tokenRecu, userRecu) {
    token.value = tokenRecu
    user.value = userRecu
    localStorage.setItem('token', tokenRecu)
    localStorage.setItem('user', JSON.stringify(userRecu))
  }

  function deconnecter() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function mettreAJourUser(champs) {
    user.value = { ...user.value, ...champs }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function getDashboardRoute() {
    const role = user.value?.role
    if (role === 'client') return '/client/dashboard'
    if (role === 'coursiere') return '/coursiere/dashboard'
    if (role === 'admin') return '/admin/dashboard'
    return '/'
  }

  return { token, user, estConnecte, estClient, estCoursiere, estAdmin, connecter, deconnecter, mettreAJourUser, getDashboardRoute }
})