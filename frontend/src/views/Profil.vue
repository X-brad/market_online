 <template>
  <div class="profil-page">
    <div class="container">

      <!-- RETOUR -->
      <RouterLink :to="authStore.getDashboardRoute()" class="lien-retour">← Retour au dashboard</RouterLink>

      <!-- HEADER -->
      <div class="profil-header">
        <div class="profil-avatar-big">{{ initiales }}</div>
        <div class="profil-header-info">
          <h1>{{ authStore.user?.prenom }} {{ authStore.user?.nom }}</h1>
          <p>📍 {{ authStore.user?.commune }} · <span class="role-badge" :class="authStore.user?.role">{{ roleLabel }}</span></p>
          <p class="profil-pseudo" v-if="authStore.user?.pseudo">@{{ authStore.user?.pseudo }}</p>
        </div>
        <button class="btn-edit" @click="modeEdit = !modeEdit">
          {{ modeEdit ? '✕ Annuler' : '✏️ Modifier' }}
        </button>
      </div>

      <div class="profil-grid">

        <!-- INFOS PERSONNELLES -->
        <div class="card">
          <h3>👤 Informations personnelles</h3>

          <div v-if="!modeEdit" class="info-list">
            <div class="info-item">
              <span>Nom complet</span>
              <strong>{{ authStore.user?.prenom }} {{ authStore.user?.nom }}</strong>
            </div>
            <div class="info-item">
              <span>Pseudo</span>
              <strong>{{ authStore.user?.pseudo || '—' }}</strong>
            </div>
            <div class="info-item">
              <span>Téléphone</span>
              <strong>{{ authStore.user?.telephone }}</strong>
            </div>
            <div class="info-item">
              <span>Commune</span>
              <strong>{{ authStore.user?.commune }}</strong>
            </div>
            <div class="info-item">
              <span>Rôle</span>
              <strong>{{ roleLabel }}</strong>
            </div>
          </div>

          <div v-else class="edit-form">
            <div class="form-group">
              <label>Prénom</label>
              <input v-model="form.prenom" type="text" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input v-model="form.nom" type="text" />
            </div>
            <div class="form-group">
              <label>Pseudo</label>
              <input v-model="form.pseudo" type="text" placeholder="ex: amara_cocody" />
            </div>
            <div class="form-group">
              <label>Commune</label>
              <select v-model="form.commune">
                <option v-for="c in communes" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <button class="btn-save" @click="sauvegarder">💾 Sauvegarder</button>
          </div>
        </div>

        <!-- SÉCURITÉ -->
        <div class="card">
          <h3>🔒 Sécurité</h3>
          <div v-if="!modePassword" class="info-list">
            <div class="info-item">
              <span>Mot de passe</span>
              <strong>••••••••</strong>
            </div>
            <button class="btn-secondary" @click="modePassword = true">Changer le mot de passe</button>
          </div>
          <div v-else class="edit-form">
            <div class="form-group">
              <label>Ancien mot de passe</label>
              <input v-model="passwordForm.ancien" type="password" placeholder="••••••••" />
            </div>
            <div class="form-group">
              <label>Nouveau mot de passe</label>
              <input v-model="passwordForm.nouveau" type="password" placeholder="••••••••" />
            </div>
            <div class="form-group">
              <label>Confirmer</label>
              <input v-model="passwordForm.confirmer" type="password" placeholder="••••••••" />
            </div>
            <div class="form-btns">
              <button class="btn-secondary" @click="modePassword = false">Annuler</button>
              <button class="btn-save" @click="changerPassword">💾 Confirmer</button>
            </div>
          </div>
        </div>

        <!-- STATS CLIENT -->
        <div class="card" v-if="authStore.estClient">
          <h3>🛒 Mes statistiques</h3>
          <div class="stats-profil">
            <div class="stat-profil" v-for="s in statsClient" :key="s.label">
              <span class="stat-profil-icon">{{ s.icon }}</span>
              <p class="stat-profil-val">{{ s.val }}</p>
              <p class="stat-profil-label">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <!-- STATS COURSIÈRE -->
        <div class="card" v-if="authStore.estCoursiere">
          <h3>📦 Mon activité coursière</h3>
          <div class="stats-profil">
            <div class="stat-profil" v-for="s in statsCoursiere" :key="s.label">
              <span class="stat-profil-icon">{{ s.icon }}</span>
              <p class="stat-profil-val">{{ s.val }}</p>
              <p class="stat-profil-label">{{ s.label }}</p>
            </div>
          </div>
          <div class="coursiere-profil-info">
            <div class="info-item">
              <span>Type de profil</span>
              <span class="type-badge" :class="authStore.user?.coursiere?.typeProfile === 'premium' ? 'premium' : 'standard'">
                {{ authStore.user?.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard' }}
              </span>
            </div>
            <div class="info-item">
              <span>Statut validation</span>
              <span class="valid-badge" :class="authStore.user?.coursiere?.valide ? 'validee' : 'pending'">
                {{ authStore.user?.coursiere?.valide ? '✓ Validée' : 'En attente' }}
              </span>
            </div>
            <div class="info-item">
              <span>Commune</span>
              <strong>{{ authStore.user?.commune || '—' }}</strong>
            </div>
          </div>
        </div>

        <!-- HISTORIQUE -->
        <div class="card historique-card">
          <h3>📋 Historique des commandes</h3>
          <div class="empty-histo" v-if="historique.length === 0">
            <span>🛒</span>
            <p>Aucune commande pour l'instant</p>
            <RouterLink to="/client/dashboard" class="btn-secondary" v-if="authStore.estClient">
              Passer une commande →
            </RouterLink>
          </div>
          <div class="histo-list" v-else>
            <div class="histo-item" v-for="h in historique" :key="h.id">
              <div class="histo-left">
                <div class="histo-dot" :class="h.statut"></div>
                <div>
                  <p>{{ h.marche }}</p>
                  <span>{{ h.date }}</span>
                </div>
              </div>
              <div class="histo-right">
                <strong>{{ h.montant }} F</strong>
                <span :class="h.statut">{{ h.statut === 'complete' ? '✓ Livré' : '⏳ En cours' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DANGER ZONE -->
        <div class="card danger-card">
          <h3>⚠️ Zone de danger</h3>
          <p>Ces actions sont irréversibles. Soyez prudent.</p>
          <div class="danger-btns">
            <button class="btn-danger-outline" @click="deconnecter">🚪 Se déconnecter</button>
            <button class="btn-danger" @click="confirmerSuppression = true">🗑️ Supprimer mon compte</button>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL SUPPRESSION -->
    <div class="modal-overlay" v-if="confirmerSuppression" @click.self="confirmerSuppression = false">
      <div class="modal-danger">
        <div class="modal-danger-icon">⚠️</div>
        <h3>Supprimer votre compte ?</h3>
        <p>Cette action est irréversible. Toutes vos données seront perdues.</p>
        <div class="modal-danger-btns">
          <button class="btn-secondary" @click="confirmerSuppression = false">Annuler</button>
          <button class="btn-danger" @click="supprimerCompte">Oui, supprimer</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import api from '../api/axios.js'

const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const modeEdit = ref(false)
const modePassword = ref(false)
const confirmerSuppression = ref(false)

const form = ref({
  prenom: authStore.user?.prenom || '',
  nom: authStore.user?.nom || '',
  pseudo: authStore.user?.pseudo || '',
  commune: authStore.user?.commune || ''
})

const passwordForm = ref({ ancien: '', nouveau: '', confirmer: '' })

const communes = ['Cocody', 'Adjamé', 'Treichville', 'Koumassi', 'Bingerville', 'Plateau', 'Marcory', 'Yopougon', 'Abobo']

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')
})

const roleLabel = computed(() => {
  const r = authStore.user?.role
  if (r === 'client') return 'Client'
  if (r === 'coursiere') return 'Coursière'
  if (r === 'admin') return 'Administrateur'
  return ''
})

const statsClient = [
  { icon: '🛒', val: '0', label: 'Commandes' },
  { icon: '✅', val: '0', label: 'Livrées' },
  { icon: '⭐', val: '—', label: 'Note donnée' },
  { icon: '💰', val: '0 F', label: 'Total dépensé' }
]

const statsCoursiere = ref([
  { icon: '📦', val: '0', label: 'Courses' },
  { icon: '💰', val: '0 F', label: 'Revenus' },
  { icon: '⭐', val: '—', label: 'Note moyenne' },
  { icon: '✅', val: '0', label: 'Taux succès' }
])

async function chargerStatsCoursiere() {
  try {
    const res = await api.get('/courses/mes-courses')
    const courses = res.data.courses
    const livrees = courses.filter(c => c.statut === 'livree')
    const revenus = livrees.reduce((acc, c) => acc + (c.fraisPrestation || 0), 0)
    const c = authStore.user?.coursiere
    const note = c?.nombreAvis > 0 ? Math.round(c.note / c.nombreAvis * 10) / 10 : '—'
    const taux = courses.length > 0 ? Math.round((livrees.length / courses.length) * 100) : 0

    statsCoursiere.value = [
      { icon: '📦', val: String(livrees.length), label: 'Courses' },
      { icon: '💰', val: `${revenus} F`, label: 'Revenus' },
      { icon: '⭐', val: String(note), label: 'Note moyenne' },
      { icon: '✅', val: `${taux}%`, label: 'Taux succès' }
    ]

    historique.value = courses.slice(0, 10).map(cc => ({
      id: cc._id,
      marche: cc.marche,
      date: new Date(cc.createdAt).toLocaleDateString('fr-FR'),
      montant: cc.fraisPrestation || 0,
      statut: cc.statut === 'livree' ? 'complete' : 'encours'
    }))
  } catch (err) {
    console.error('Erreur stats coursière:', err)
  }
}

onMounted(() => {
  if (authStore.estCoursiere) chargerStatsCoursiere()
})

const historique = ref([])

function sauvegarder() {
  authStore.user.prenom = form.value.prenom
  authStore.user.nom = form.value.nom
  authStore.user.pseudo = form.value.pseudo
  authStore.user.commune = form.value.commune
  localStorage.setItem('user', JSON.stringify(authStore.user))
  modeEdit.value = false
  toast.success('Profil mis à jour avec succès !')
}

function changerPassword() {
  if (passwordForm.value.nouveau !== passwordForm.value.confirmer) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  if (passwordForm.value.nouveau.length < 6) {
    toast.error('Le mot de passe doit contenir au moins 6 caractères')
    return
  }
  modePassword.value = false
  passwordForm.value = { ancien: '', nouveau: '', confirmer: '' }
  toast.success('Mot de passe mis à jour !')
}

function deconnecter() {
  authStore.deconnecter()
  router.push('/')
  toast.info('Vous êtes déconnecté')
}

function supprimerCompte() {
  confirmerSuppression.value = false
  authStore.deconnecter()
  router.push('/')
  toast.success('Compte supprimé')
}
</script>

<style scoped>
.profil-page { padding: 40px 0 60px; background: var(--fond); min-height: 100vh; }
.lien-retour {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--texte-sec);
  text-decoration: none;
  margin-bottom: 16px;
  transition: color 0.2s;
}
.lien-retour:hover { color: var(--vert-dark); }

/* HEADER */
.profil-header {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, var(--vert-dark), var(--vert));
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 28px;
  color: white;
  flex-wrap: wrap;
}
.profil-avatar-big {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.3);
}
.profil-header-info { flex: 1; }
.profil-header-info h1 { font-size: 24px; font-weight: 800; margin: 0 0 6px; }
.profil-header-info p { font-size: 14px; opacity: 0.85; margin: 0 0 4px; display: flex; align-items: center; gap: 8px; }
.profil-pseudo { font-size: 13px !important; opacity: 0.7 !important; }
.role-badge { padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.role-badge.client { background: rgba(255,255,255,0.2); color: white; }
.role-badge.coursiere { background: #fef3c7; color: #92400e; }
.btn-edit {
  padding: 10px 20px;
  border-radius: var(--radius);
  border: 1.5px solid rgba(255,255,255,0.4);
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-edit:hover { background: rgba(255,255,255,0.1); }

/* GRID */
.profil-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .profil-grid { grid-template-columns: 1fr; } }
.card { background: white; border-radius: 16px; padding: 24px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.card h3 { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 20px; }
.historique-card { grid-column: span 2; }
.danger-card { grid-column: span 2; }
@media (max-width: 768px) { .historique-card, .danger-card { grid-column: span 1; } }

/* INFO LIST */
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 0.5px solid var(--bordure); font-size: 13px; }
.info-item:last-child { border-bottom: none; }
.info-item span:first-child { color: var(--texte-sec); }
.info-item strong { color: var(--texte); font-weight: 600; }

/* EDIT FORM */
.edit-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: var(--texte-sec); }
.form-group input, .form-group select {
  padding: 10px 12px;
  border: 1px solid var(--bordure);
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--texte);
  background: white;
  transition: border 0.2s;
}
.form-group input:focus, .form-group select:focus { border-color: var(--vert); outline: none; }
.btn-save {
  background: var(--vert);
  color: white;
  padding: 12px;
  border-radius: var(--radius);
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.btn-save:hover { background: var(--vert-dark); }
.btn-secondary {
  background: var(--fond);
  color: var(--texte-sec);
  padding: 10px 16px;
  border-radius: var(--radius);
  border: 1px solid var(--bordure);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}
.btn-secondary:hover { border-color: var(--vert); color: var(--vert); }
.form-btns { display: flex; gap: 10px; }

/* STATS PROFIL */
.stats-profil { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-profil { background: var(--fond); border-radius: 10px; padding: 14px; text-align: center; }
.stat-profil-icon { font-size: 24px; display: block; margin-bottom: 6px; }
.stat-profil-val { font-size: 20px; font-weight: 800; color: var(--vert-dark); margin: 0 0 4px; }
.stat-profil-label { font-size: 11px; color: var(--texte-sec); margin: 0; }

/* COURSIÈRE PROFIL */
.coursiere-profil-info { display: flex; flex-direction: column; gap: 0; margin-top: 12px; padding-top: 12px; border-top: 0.5px solid var(--bordure); }
.type-badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.type-badge.standard { background: var(--vert-light); color: var(--vert-dark); }
.type-badge.premium { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }
.valid-badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.valid-badge.pending { background: #fef3c7; color: #92400e; }
.valid-badge.validee { background: #dcfce7; color: #166534; }

/* HISTORIQUE */
.empty-histo { text-align: center; padding: 32px 20px; }
.empty-histo span { font-size: 40px; display: block; margin-bottom: 10px; }
.empty-histo p { font-size: 14px; color: var(--texte-sec); margin-bottom: 16px; }
.histo-list { display: flex; flex-direction: column; gap: 0; }
.histo-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 0.5px solid var(--bordure); }
.histo-left { display: flex; align-items: center; gap: 12px; }
.histo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.histo-dot.complete { background: var(--vert); }
.histo-dot.encours { background: #f59e0b; }
.histo-left p { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.histo-left span { font-size: 11px; color: var(--texte-sec); }
.histo-right { text-align: right; }
.histo-right strong { display: block; font-size: 14px; color: var(--texte); margin-bottom: 2px; }
.histo-right span { font-size: 11px; font-weight: 600; }
.histo-right span.complete { color: var(--vert); }
.histo-right span.encours { color: #f59e0b; }

/* DANGER ZONE */
.danger-card h3 { color: #dc2626; }
.danger-card p { font-size: 13px; color: var(--texte-sec); margin-bottom: 16px; }
.danger-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-danger-outline {
  padding: 10px 20px;
  border-radius: var(--radius);
  border: 1.5px solid #dc2626;
  background: transparent;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger-outline:hover { background: #fef2f2; }
.btn-danger {
  padding: 10px 20px;
  border-radius: var(--radius);
  border: none;
  background: #dc2626;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover { background: #b91c1c; }

/* MODAL DANGER */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
  backdrop-filter: blur(4px);
}
.modal-danger {
  background: white;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.25s ease;
  border-top: 4px solid #dc2626;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-danger-icon { font-size: 48px; margin-bottom: 16px; display: block; }
.modal-danger h3 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: var(--texte); }
.modal-danger p { font-size: 14px; color: var(--texte-sec); margin-bottom: 28px; }
.modal-danger-btns { display: flex; gap: 12px; justify-content: center; }
</style>
