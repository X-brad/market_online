<template>
  <nav class="navbar" v-if="authStore.user?.role !== 'admin'">
    <div class="container nav-inner">

      <!-- LOGO -->
      <RouterLink to="/" class="logo">
        <span class="logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 9h16l-1.5 9a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            <path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="logo-word">Achèt<span class="logo-accent">là</span></span>
      </RouterLink>

      <!-- NON CONNECTÉ -->
      <div class="nav-links" v-if="!authStore.estConnecte">
        <RouterLink to="/connexion" class="btn-outline">Connexion</RouterLink>
        <RouterLink to="/inscription" class="btn-primary">S'inscrire</RouterLink>
      </div>

      <!-- CLIENT CONNECTÉ -->
      <div class="nav-links" v-else-if="authStore.estClient">
        <RouterLink to="/client/dashboard" class="nav-link">
          🛒 Mes courses
        </RouterLink>
        <div class="nav-avatar-wrap" @click="toggleMenu" ref="menuRef">
          <div class="nav-avatar">{{ initiales }}</div>
          <span class="nav-prenom">{{ authStore.user?.prenom }}</span>
          <span class="nav-chevron" :class="{ open: menuOpen }">▾</span>
          <div class="dropdown" v-if="menuOpen">
            <RouterLink to="/client/dashboard" class="dropdown-item" @click="menuOpen = false">
              🏠 Dashboard
            </RouterLink>
            <RouterLink to="/profil" class="dropdown-item" @click="menuOpen = false">
              👤 Mon profil
            </RouterLink>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="deconnecter">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      <!-- COURSIÈRE CONNECTÉE -->
      <div class="nav-links" v-else-if="authStore.estCoursiere">
        <div class="statut-toggle" @click="toggleStatut">
          <span class="statut-dot" :class="statutCoursiere"></span>
          <span class="statut-label">{{ statutCoursiere === 'disponible' ? 'Disponible' : 'Hors ligne' }}</span>
        </div>
        <RouterLink to="/coursiere/dashboard" class="nav-link">
          📦 Mes courses
        </RouterLink>
        <div class="nav-avatar-wrap" @click="toggleMenu" ref="menuRef">
          <div class="nav-avatar green">{{ initiales }}</div>
          <span class="nav-prenom">{{ authStore.user?.prenom }}</span>
          <span class="nav-chevron" :class="{ open: menuOpen }">▾</span>
          <div class="dropdown" v-if="menuOpen">
            <RouterLink to="/coursiere/dashboard" class="dropdown-item" @click="menuOpen = false">
              🏠 Dashboard
            </RouterLink>
            <RouterLink to="/profil" class="dropdown-item" @click="menuOpen = false">
              👤 Mon profil
            </RouterLink>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="deconnecter">
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)
const menuRef = ref(null)
const statutCoursiere = ref('hors_ligne')

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function toggleStatut() {
  statutCoursiere.value = statutCoursiere.value === 'disponible' ? 'hors_ligne' : 'disponible'
}

function deconnecter() {
  menuOpen.value = false
  authStore.deconnecter()
  router.push('/')
}

function handleClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.navbar {
  background: white;
  border-bottom: 0.5px solid var(--bordure);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 12px rgba(0,0,0,0.06);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--vert-dark), var(--vert));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(8,80,65,0.25);
  flex-shrink: 0;
}
.logo-word {
  font-size: 19px;
  font-weight: 800;
  color: var(--vert-dark);
  letter-spacing: -0.2px;
}
.logo-accent { color: var(--dore); }
.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-link {
  font-size: 14px;
  font-weight: 600;
  color: var(--texte-sec);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: var(--radius);
  transition: all 0.2s;
}
.nav-link:hover {
  background: var(--vert-light);
  color: var(--vert-dark);
}

/* AVATAR MENU */
.nav-avatar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--bordure);
  transition: all 0.2s;
  position: relative;
  user-select: none;
}
.nav-avatar-wrap:hover { border-color: var(--vert); background: var(--vert-light); }
.nav-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--vert);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.nav-avatar.green { background: var(--vert-dark); }
.nav-prenom { font-size: 13px; font-weight: 600; color: var(--texte); }
.nav-chevron { font-size: 11px; color: var(--texte-sec); transition: transform 0.2s; }
.nav-chevron.open { transform: rotate(180deg); }

/* DROPDOWN */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 0.5px solid var(--bordure);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  min-width: 180px;
  overflow: hidden;
  animation: dropIn 0.15s ease;
  z-index: 200;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--texte);
  text-decoration: none;
  transition: background 0.15s;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
}
.dropdown-item:hover { background: var(--fond); }
.dropdown-item.danger { color: #dc2626; }
.dropdown-item.danger:hover { background: #fef2f2; }
.dropdown-divider { height: 0.5px; background: var(--bordure); margin: 4px 0; }

/* STATUT COURSIÈRE */
.statut-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--bordure);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--texte);
  transition: all 0.2s;
}
.statut-toggle:hover { border-color: var(--vert); }
.statut-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s;
}
.statut-dot.disponible { background: #4ade80; }
.statut-dot.hors_ligne { background: #9ca3af; }
.statut-label { font-size: 12px; }

/* MOBILE */
@media (max-width: 640px) {
  .nav-inner { flex-wrap: wrap; row-gap: 8px; }
  .logo-mark { width: 28px; height: 28px; }
  .logo-word { font-size: 16px; }
  .nav-links { gap: 6px; }
  .nav-link { padding: 8px 10px; font-size: 13px; white-space: nowrap; }
  .nav-prenom { display: none; }
  .nav-avatar-wrap { padding: 6px 8px; }
  .statut-toggle { padding: 6px 8px; }
  .statut-label { display: none; }
}
</style>