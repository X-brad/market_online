<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🛍️ Achètlà</div>
      <h1>Connexion</h1>
      <p class="auth-sub">Bon retour parmi nous 👋</p>

      <div v-if="erreur" class="erreur-msg">{{ erreur }}</div>

      <form @submit.prevent="seConnecter">
        <div class="form-group">
          <label>Téléphone ou pseudo</label>
          <input v-model="form.identifiant" type="text" placeholder="0701020304 ou amara_cocody" required />
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="form.motDePasse" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="chargement">
          {{ chargement ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-link">
        Pas encore de compte ?
        <RouterLink to="/inscription">S'inscrire</RouterLink>
      </p>

      <div class="admin-link" @click="showAdminModal = true">
        Accès administration
      </div>
    </div>

    <!-- MODAL ADMIN -->
    <div class="modal-overlay" v-if="showAdminModal" @click.self="showAdminModal = false">
      <div class="modal-admin">
        <button class="modal-close" @click="showAdminModal = false">✕</button>
        <div class="modal-admin-icon">🛠️</div>
        <h3>Espace Administrateur</h3>
        <p>Accès réservé à l'équipe Achètlà</p>

        <div v-if="erreurAdmin" class="erreur-msg">{{ erreurAdmin }}</div>

        <form @submit.prevent="seConnecterAdmin">
          <div class="form-group">
            <label>Identifiant admin</label>
            <input v-model="adminForm.identifiant" type="text" placeholder="Identifiant" required />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="adminForm.motDePasse" type="password" placeholder="••••••••" required />
          </div>
          <div class="form-group">
            <label>Code d'accès</label>
            <input
              v-model="adminForm.code"
              type="password"
              placeholder="Code secret"
              autocomplete="new-password"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              required
            />
          </div>
          <button type="submit" class="btn-admin" :disabled="chargementAdmin">
            {{ chargementAdmin ? 'Vérification...' : 'Accéder au back-office' }}
          </button>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios.js'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ identifiant: '', motDePasse: '' })
const adminForm = ref({ identifiant: '', motDePasse: '', code: '' })
const erreur = ref('')
const erreurAdmin = ref('')
const chargement = ref(false)
const chargementAdmin = ref(false)
const showAdminModal = ref(false)

const ADMIN_CODE = 'MAMI2026'

async function seConnecter() {
  erreur.value = ''
  chargement.value = true
  try {
    const res = await api.post('/auth/connexion', {
      identifiant: form.value.identifiant,
      motDePasse: form.value.motDePasse
    })
    authStore.connecter(res.data.token, res.data.user)
    router.push(authStore.getDashboardRoute())
  } catch (e) {
    erreur.value = e.response?.data?.message || 'Erreur de connexion'
  } finally {
    chargement.value = false
  }
}

async function seConnecterAdmin() {
  erreurAdmin.value = ''
  if (adminForm.value.code.trim() !== ADMIN_CODE) {
    erreurAdmin.value = 'Code d\'accès incorrect'
    return
  }
  chargementAdmin.value = true
  try {
    const res = await api.post('/auth/connexion', {
      identifiant: adminForm.value.identifiant,
      motDePasse: adminForm.value.motDePasse
    })
    if (res.data.user.role !== 'admin') {
      erreurAdmin.value = 'Ce compte n\'a pas les droits administrateur'
      return
    }
    authStore.connecter(res.data.token, res.data.user)
    showAdminModal.value = false
    router.push('/admin/dashboard')
  } catch (e) {
    erreurAdmin.value = e.response?.data?.message || 'Identifiants incorrects'
  } finally {
    chargementAdmin.value = false
  }
}
</script>

<style scoped>
/* ── BACKGROUND HERO ── */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, var(--vert-dark) 0%, var(--vert) 100%);
  position: relative;
  overflow: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  top: -100px;
  right: -100px;
  pointer-events: none;
}

.auth-page::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -60px;
  left: -60px;
  pointer-events: none;
}

/* ── CARD ── */
.auth-card {
  width: 100%;
  max-width: 420px;
  text-align: center;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow:
    0 0 0 1px rgba(29, 158, 117, 0.2),
    0 8px 32px rgba(8, 80, 65, 0.25),
    0 32px 64px rgba(8, 80, 65, 0.15);
}

.auth-logo {
  font-size: 22px;
  font-weight: 700;
  color: var(--vert-dark);
  margin-bottom: 24px;
}

h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; color: var(--texte); }
.auth-sub { color: var(--texte-sec); font-size: 14px; margin-bottom: 28px; }

/* ── FORM ── */
.form-group { text-align: left; margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--texte); }
.form-group input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--bordure);
  border-radius: var(--radius);
  font-size: 14px;
  background: white;
  transition: border 0.2s;
  color: var(--texte);
  box-sizing: border-box;
}
.form-group input:focus { border-color: var(--vert); outline: none; }

.w-full { width: 100%; margin-top: 8px; padding: 13px; font-size: 15px; }

.erreur-msg {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: left;
}

.auth-link { margin-top: 20px; font-size: 13px; color: var(--texte-sec); }
.auth-link a { color: var(--vert); font-weight: 500; }

/* ── ADMIN LINK ── */
.admin-link {
  margin-top: 28px;
  font-size: 11px;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.2s;
  user-select: none;
}
.admin-link:hover { color: var(--texte-sec); }

/* ── MODAL ADMIN ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
  backdrop-filter: blur(6px);
}
.modal-admin {
  background: white;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 24px 60px rgba(0,0,0,0.25);
  animation: modalIn 0.25s ease;
  border-top: 4px solid var(--vert-dark);
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--fond);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  color: var(--texte-sec);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-admin-icon { font-size: 40px; margin-bottom: 14px; display: block; }
.modal-admin h3 { font-size: 20px; font-weight: 800; color: var(--vert-dark); margin-bottom: 6px; }
.modal-admin p { font-size: 13px; color: var(--texte-sec); margin-bottom: 24px; }
.btn-admin {
  width: 100%;
  padding: 14px;
  background: var(--vert-dark);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.2s;
}
.btn-admin:hover:not(:disabled) { background: #043528; transform: translateY(-1px); }
.btn-admin:disabled { opacity: 0.5; cursor: not-allowed; }
</style>