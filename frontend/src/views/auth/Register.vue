<template>
  <div class="auth-page">
    <div class="auth-split">

      <!-- GAUCHE : PRÉSENTATION -->
      <div class="auth-left">
        <div class="auth-left-bg"></div>
        <div class="auth-left-overlay"></div>
        <div class="auth-left-content">
          <div class="auth-badge">🇨🇮 Abidjan · Côte d'Ivoire</div>
          <h1>Faites vos courses autrement, <span>depuis votre marché jusqu'à votre porte</span></h1>
          <p class="auth-left-sub">Créez votre compte Achètlà et déléguez vos achats à une coursière locale de confiance.</p>

          <div class="auth-features">
            <div class="auth-feature">
              <span class="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 3-7 7-7 11a6 6 0 0 0 6 6c4 0 8-3 9-9 .6-3.4-1-6.5-4-8-1.3.8-2.7 1.8-4 2Z"/><path d="M8 20c2-4 5-8 9-11"/></svg>
              </span>
              <div><p>Produits frais</p><span>Sélectionnés directement dans les marchés d'Abidjan</span></div>
            </div>
            <div class="auth-feature">
              <span class="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.4"/></svg>
              </span>
              <div><p>Coursières locales</p><span>Une coursière proche de vous s'occupe de vos achats</span></div>
            </div>
            <div class="auth-feature">
              <span class="auth-feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 5 6v6c0 4.6 3 7.9 7 9 4-1.1 7-4.4 7-9V6l-7-2.8Z"/><path d="m9.2 12.3 2 2 3.6-4"/></svg>
              </span>
              <div><p>Paiement sécurisé</p><span>Mobile Money, simple et en toute sécurité</span></div>
            </div>
          </div>

          <div class="auth-visual-card">
            <div class="avc-header">
              <span class="avc-dot"></span>
              <span>Coursière disponible</span>
            </div>
            <div class="avc-body">
              <div class="avc-avatar">MS</div>
              <div class="avc-info">
                <p class="avc-nom">Mariam Sita</p>
                <p class="avc-sub">Marché de Treichville · ⭐ 4.8</p>
              </div>
              <span class="avc-badge">Disponible</span>
            </div>
            <div class="avc-footer">
              <span>📍 Marché de Treichville</span>
              <span>~1.6 km</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DROITE : FORMULAIRE -->
      <div class="auth-right">
        <div class="auth-card">
          <h2>Créer votre compte</h2>
          <p class="auth-sub">Bienvenue sur Achètlà 👋</p>
          <p class="auth-intro">Créez votre compte pour commencer à faire vos courses au marché sans vous déplacer.</p>

          <div v-if="erreur" class="erreur-msg">{{ erreur }}</div>

          <form @submit.prevent="sInscrire">
            <p class="form-section-label">Vos informations</p>
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
              <label>Pseudo <span class="optionnel">(optionnel)</span></label>
              <input v-model="form.pseudo" type="text" placeholder="ex: amara_cocody" maxlength="30" />
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

            <p class="form-section-label">Sécurisez votre compte</p>
            <div class="form-group">
              <label>Mot de passe</label>
              <div class="password-field">
                <span class="password-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                </span>
                <input v-model="form.motDePasse" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" maxlength="72" required />
                <button type="button" class="password-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'">
                  <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.24 4.24"/><path d="M9.5 4.6A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-3.1 3.9M6.1 6.1A13.6 13.6 0 0 0 2 11s3.5 7 10 7c1.1 0 2.1-.2 3-.5"/></svg>
                </button>
              </div>
              <p class="password-hint" :class="{ valide: motDePasseValide }" v-if="form.motDePasse">
                <span v-if="motDePasseValide">✓ Mot de passe valide</span>
                <span v-else>Au moins 6 caractères</span>
              </p>
            </div>

            <button type="submit" class="btn-primary w-full" :disabled="chargement">
              {{ chargement ? 'Création du compte...' : "Créer mon compte →" }}
            </button>
          </form>

          <p class="auth-link">
            Déjà un compte ?
            <RouterLink to="/connexion">Se connecter</RouterLink>
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import api from '../../api/axios.js'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const communes = ['Cocody', 'Adjamé', 'Treichville', 'Koumassi', 'Bingerville', 'Plateau', 'Marcory', 'Yopougon', 'Abobo']
const form = ref({ nom: '', prenom: '', pseudo: '', telephone: '', commune: '', motDePasse: '' })
const erreur = ref('')
const chargement = ref(false)
const showPassword = ref(false)

const motDePasseValide = computed(() => form.value.motDePasse.length >= 6)

const REGEX_TELEPHONE = /^0[0-9]{9}$/
const REGEX_PSEUDO = /^[a-zA-Z0-9_]+$/

function validerFormulaire() {
  if (!REGEX_TELEPHONE.test(form.value.telephone)) {
    return 'Le numéro de téléphone doit contenir 10 chiffres et commencer par 0'
  }
  if (form.value.pseudo && (form.value.pseudo.length < 3 || !REGEX_PSEUDO.test(form.value.pseudo))) {
    return 'Le pseudo doit contenir au moins 3 caractères (lettres, chiffres, underscores)'
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
      telephone: form.value.telephone,
      commune: form.value.commune,
      role: 'client',
      motDePasse: form.value.motDePasse
    })
    authStore.connecter(res.data.token, res.data.user)
    toast.success(`Bienvenue ${res.data.user.prenom} ! 🎉`)
    router.push(authStore.getDashboardRoute())
  } catch (e) {
    erreur.value = e.response?.data?.message || "Erreur lors de l'inscription"
    toast.error(erreur.value)
  } finally {
    chargement.value = false
  }
}
</script>

<style scoped>
/* ── PAGE ── */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--ivoire);
}

.auth-split {
  width: 100%;
  max-width: 1080px;
  display: flex;
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(8,80,65,0.18);
  animation: authIn 0.4s ease;
}
@keyframes authIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── GAUCHE ── */
.auth-left {
  flex: 1.05;
  position: relative;
  border-radius: 28px 0 0 28px;
  padding: 56px 48px;
  color: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 700px;
}
.auth-left-bg {
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1585540083814-ea6ee8af9e4f?w=900&h=1200&fit=crop&q=75') center/cover;
}
.auth-left-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(155deg, rgba(8,80,65,0.94) 15%, rgba(8,80,65,0.86) 100%);
}
.auth-left-content { position: relative; z-index: 1; }

.auth-badge {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  margin-bottom: 22px;
}
.auth-left h1 {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.22;
  margin-bottom: 16px;
}
.auth-left h1 span { color: #9FE1CB; }
.auth-left-sub {
  font-size: 14.5px;
  line-height: 1.7;
  opacity: 0.88;
  margin-bottom: 32px;
  max-width: 420px;
}

/* FEATURES */
.auth-features { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.auth-feature { display: flex; align-items: center; gap: 12px; }
.auth-feature-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
}
.auth-feature p { font-size: 13.5px; font-weight: 700; margin: 0; }
.auth-feature span { font-size: 12px; opacity: 0.75; }

/* CARTE COURSIÈRE */
.auth-visual-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 16px;
  padding: 16px 18px;
  max-width: 320px;
  animation: cardFloat 3.5s ease-in-out infinite;
}
@keyframes cardFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.avc-header { display: flex; align-items: center; gap: 8px; font-size: 12.5px; opacity: 0.85; margin-bottom: 12px; }
.avc-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.25); flex-shrink: 0; }
.avc-body { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.avc-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.avc-nom { font-size: 13.5px; font-weight: 700; margin: 0 0 2px; }
.avc-sub { font-size: 11.5px; opacity: 0.75; margin: 0; }
.avc-badge { margin-left: auto; background: #4ade80; color: #065f46; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 700; flex-shrink: 0; }
.avc-footer { display: flex; justify-content: space-between; font-size: 11.5px; opacity: 0.7; background: rgba(255,255,255,0.08); border-radius: 8px; padding: 8px 10px; }

/* ── DROITE ── */
.auth-right {
  flex: 1;
  background: white;
  border-radius: 0 28px 28px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
}
.auth-card h2 { font-size: 25px; font-weight: 800; margin-bottom: 6px; color: var(--texte); }
.auth-sub { color: var(--texte-sec); font-size: 14px; margin-bottom: 10px; }
.auth-intro { color: var(--texte-sec); font-size: 13px; line-height: 1.6; margin-bottom: 24px; }

/* FORM */
.form-section-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--vert-dark);
  margin: 20px 0 12px;
}
.form-section-label:first-of-type { margin-top: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { text-align: left; margin-bottom: 14px; }
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

.password-field { position: relative; display: flex; align-items: center; }
.password-icon { position: absolute; left: 14px; color: var(--texte-sec); display: flex; pointer-events: none; }
.password-field input { padding-left: 40px; padding-right: 40px; }
.password-toggle {
  position: absolute; right: 10px;
  background: none; border: none; cursor: pointer;
  color: var(--texte-sec); display: flex; align-items: center; justify-content: center;
  padding: 6px; border-radius: 6px; transition: color 0.2s;
}
.password-toggle:hover { color: var(--vert-dark); }
.password-hint { font-size: 11.5px; color: var(--texte-sec); margin: 6px 0 0; }
.password-hint.valide { color: var(--vert-dark); font-weight: 600; }

.w-full { width: 100%; margin-top: 10px; padding: 13px; font-size: 15px; }

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

.auth-link { margin-top: 20px; font-size: 13px; color: var(--texte-sec); text-align: center; }
.auth-link a { color: var(--vert); font-weight: 500; }

/* ── MOBILE ── */
@media (max-width: 900px) {
  .auth-page { padding: 0; }
  .auth-split { flex-direction: column; border-radius: 0; box-shadow: none; max-width: 480px; }
  .auth-left { flex: none; border-radius: 0; padding: 40px 28px; min-height: auto; }
  .auth-left h1 { font-size: 25px; }
  .auth-features { flex-direction: row; flex-wrap: wrap; gap: 14px 20px; }
  .auth-feature { flex: 1 1 45%; }
  .auth-feature span { display: none; }
  .auth-visual-card { max-width: 100%; }
  .auth-right { flex: none; border-radius: 0; padding: 32px 24px 48px; }
}
</style>
