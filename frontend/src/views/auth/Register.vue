<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">🛍️ MamiMarché</div>
      <h1>Inscription</h1>
      <p class="auth-sub">Rejoignez MamiMarché dès aujourd'hui</p>
      <div v-if="erreur" class="erreur-msg">{{ erreur }}</div>
      <form @submit.prevent="sInscrire">
        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="form.nom" type="text" placeholder="Konan" maxlength="50" required />
          </div>
          <div class="form-group">
            <label>Prénom</label>
            <input v-model="form.prenom" type="text" placeholder="Amara" maxlength="50" required />
          </div>
        </div>
        <div class="form-group">
          <label>Pseudo</label>
          <input v-model="form.pseudo" type="text" placeholder="ex: amara_cocody" maxlength="30" />
        </div>
        <div class="form-group">
          <label>Email <span class="optionnel">(optionnel)</span></label>
          <input v-model="form.email" type="email" placeholder="amara@exemple.com" maxlength="254" />
        </div>
        <div class="form-group">
          <label>Numéro de téléphone</label>
          <input v-model="form.telephone" type="tel" placeholder="0701020304" maxlength="10" required />
        </div>
        <div class="form-group">
          <label>Commune</label>
          <select v-model="form.commune" required>
            <option value="">Choisir une commune</option>
            <option v-for="c in communes" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Je suis</label>
          <div class="role-select">
            <button type="button" :class="['role-btn', form.role === 'client' ? 'active' : '']" @click="form.role = 'client'">👤 Client</button>
            <button type="button" :class="['role-btn', form.role === 'coursiere' ? 'active' : '']" @click="form.role = 'coursiere'">👩🏾 Coursière</button>
          </div>
        </div>
        <div class="form-group">
          <label>Mot de passe</label>
          <input v-model="form.motDePasse" type="password" placeholder="••••••••" maxlength="72" required />
        </div>
        <button type="submit" class="btn-primary w-full" :disabled="chargement">
          {{ chargement ? 'Inscription...' : "S'inscrire" }}
        </button>
      </form>
      <p class="auth-link">
        Déjà un compte ?
        <RouterLink to="/connexion">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import api from '../../api/axios.js'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const communes = ['Cocody', 'Adjamé', 'Treichville', 'Koumassi', 'Bingerville', 'Plateau', 'Marcory', 'Yopougon', 'Abobo']
const form = ref({ nom: '', prenom: '', pseudo: '', email: '', telephone: '', commune: '', role: 'client', motDePasse: '' })
const erreur = ref('')
const chargement = ref(false)

const REGEX_TELEPHONE = /^0[0-9]{9}$/
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_PSEUDO = /^[a-zA-Z0-9_]+$/

function validerFormulaire() {
  if (!REGEX_TELEPHONE.test(form.value.telephone)) {
    return 'Le numéro de téléphone doit contenir 10 chiffres et commencer par 0'
  }
  if (form.value.pseudo && (form.value.pseudo.length < 3 || !REGEX_PSEUDO.test(form.value.pseudo))) {
    return 'Le pseudo doit contenir au moins 3 caractères (lettres, chiffres, underscores)'
  }
  if (form.value.email && !REGEX_EMAIL.test(form.value.email)) {
    return 'Adresse email invalide'
  }
  if (form.value.motDePasse.length < 6) {
    return 'Le mot de passe doit contenir au moins 6 caractères'
  }
  return null
}

async function sInscrire() {
  erreur.value = ''
  const messageValidation = validerFormulaire()
  if (messageValidation) {
    erreur.value = messageValidation
    toast.error(messageValidation)
    return
  }
  chargement.value = true
  try {
    const res = await api.post('/auth/inscription', {
      nom: form.value.nom,
      prenom: form.value.prenom,
      pseudo: form.value.pseudo,
      email: form.value.email,
      telephone: form.value.telephone,
      commune: form.value.commune,
      role: form.value.role,
      motDePasse: form.value.motDePasse
    })
    authStore.connecter(res.data.token, res.data.user)
    toast.success(`Bienvenue ${res.data.user.prenom} ! 🎉`)
    if (res.data.user.role === 'coursiere') {
      router.push('/coursiere/onboarding')
    } else {
      router.push(authStore.getDashboardRoute())
    }
  } catch (e) {
    erreur.value = e.response?.data?.message || "Erreur lors de l'inscription"
    toast.error(erreur.value)
  } finally {
    chargement.value = false
  }
}
</script>

<style scoped>
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
.auth-card {
  width: 100%;
  max-width: 480px;
  text-align: center;
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.97);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow:
    0 0 0 1px rgba(29,158,117,0.2),
    0 8px 32px rgba(8,80,65,0.25),
    0 32px 64px rgba(8,80,65,0.15);
}
.auth-logo { font-size: 22px; font-weight: 700; color: var(--vert-dark); margin-bottom: 24px; }
h1 { font-size: 26px; font-weight: 700; margin-bottom: 6px; color: var(--texte); }
.auth-sub { color: var(--texte-sec); font-size: 14px; margin-bottom: 28px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { text-align: left; margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: var(--texte); }
.optionnel { font-weight: 400; color: var(--texte-sec); }
.form-group input,
.form-group select {
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
.form-group input:focus,
.form-group select:focus { border-color: var(--vert); outline: none; }
.role-select { display: flex; gap: 10px; }
.role-btn {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius);
  font-size: 14px;
  border: 1.5px solid var(--bordure);
  background: white;
  color: var(--texte-sec);
  transition: all 0.2s;
  cursor: pointer;
}
.role-btn.active { border-color: var(--vert); background: var(--vert-light); color: var(--vert-dark); font-weight: 500; }
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
</style>