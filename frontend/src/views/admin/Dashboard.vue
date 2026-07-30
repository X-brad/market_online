<template>
  <div class="admin">

    <!-- SIDEBAR -->
    <div class="sidebar">
      <div class="sidebar-logo">🛍️ MamiMarché</div>
      <p class="sidebar-role">Back-office Admin</p>
      <nav class="sidebar-nav">
        <button
          v-for="m in menus"
          :key="m.id"
          class="nav-item"
          :class="{ active: activeMenu === m.id }"
          @click="activeMenu = m.id"
        >
          <span>{{ m.icon }}</span>
          <span>{{ m.label }}</span>
        </button>
      </nav>
      <button class="btn-deconnexion" @click="authStore.deconnecter(); router.push('/')">
        🚪 Déconnexion
      </button>
    </div>

    <!-- MAIN -->
    <div class="main">

      <!-- TOPBAR -->
      <div class="topbar">
        <div>
          <h1>{{ menuActif?.label }}</h1>
          <p>{{ menuActif?.desc }}</p>
        </div>
        <div class="topbar-right">
          <span class="admin-badge">👤 Admin</span>
          <span class="date-badge">{{ dateAujourdhui }}</span>
        </div>
      </div>

      <!-- VUE D'ENSEMBLE -->
      <div v-if="activeMenu === 'overview'" class="content">
        <div class="stats-grid">
          <div class="stat-card" v-for="s in statsGlobales" :key="s.label" :class="s.color">
            <span class="stat-icon">{{ s.icon }}</span>
            <p class="stat-val">{{ s.val }}</p>
            <p class="stat-label">{{ s.label }}</p>
            <p class="stat-trend" :class="s.trend > 0 ? 'up' : 'down'">
              {{ s.trend > 0 ? '↑' : '↓' }} {{ Math.abs(s.trend) }}% ce mois
            </p>
          </div>
        </div>

        <div class="two-col">
          <div class="card">
            <h3>📊 Activité récente</h3>
            <div class="activite-list">
              <div class="activite-item" v-for="a in activites" :key="a.id">
                <div class="activite-dot" :class="a.type"></div>
                <div class="activite-info">
                  <p>{{ a.text }}</p>
                  <span>{{ a.time }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card">
            <h3>🏪 Marchés actifs</h3>
            <div class="marche-list">
              <div class="marche-row" v-for="m in marchesStats" :key="m.nom">
                <div class="marche-row-left">
                  <span>{{ m.icon }}</span>
                  <div>
                    <p>{{ m.nom }}</p>
                    <span>{{ m.commune }}</span>
                  </div>
                </div>
                <div class="marche-row-right">
                  <span class="badge-actif">{{ m.coursieres }} coursières</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- COURSIÈRES -->
      <div v-if="activeMenu === 'coursieres'" class="content">
        <div class="toolbar">
          <input v-model="searchCoursiere" placeholder="🔍 Rechercher une coursière..." class="search-input" />
          <div class="toolbar-filters">
            <button
              v-for="f in filtresCoursiere"
              :key="f.val"
              class="filter-btn"
              :class="{ active: filtreCoursiere === f.val }"
              @click="filtreCoursiere = f.val"
            >{{ f.label }}</button>
          </div>
        </div>
        <div class="table-card card">
          <table class="table">
            <thead>
              <tr>
                <th>Coursière</th>
                <th>Marché</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Note</th>
                <th>Courses</th>
                <th>Validation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in coursieresFiltrees" :key="c.id">
                <td>
                  <div class="user-cell">
                    <div class="mini-avatar">{{ c.initiales }}</div>
                    <div>
                      <p>{{ c.nom }}</p>
                      <span>{{ c.telephone }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ c.marche }}</td>
                <td>
                  <span class="type-badge" :class="c.type.toLowerCase()">{{ c.type }}</span>
                </td>
                <td>
                  <span class="statut-dot" :class="c.statut">
                    {{ c.statut === 'disponible' ? '🟢 Dispo' : c.statut === 'occupee' ? '🟡 Occupée' : '⚫ Hors ligne' }}
                  </span>
                </td>
                <td>⭐ {{ c.note }}</td>
                <td>{{ c.courses }}</td>
                <td>
                  <span class="valid-badge" :class="c.validee ? 'validee' : 'pending'">
                    {{ c.validee ? '✓ Validée' : '⏳ En attente' }}
                  </span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-sm green" @click="validerCoursiere(c)" v-if="!c.validee">✓</button>
                    <button class="btn-sm red" @click="suspendreCoursiere(c)">🚫</button>
                    <button class="btn-sm gray" @click="voirCoursiere(c)">👁</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TARIFICATION -->
      <div v-if="activeMenu === 'tarifs'" class="content">
        <div class="two-col">
          <div class="card">
            <h3>💰 Unités journalières</h3>
            <p class="card-desc">Modifiez les tarifs d'accès à la plateforme pour les coursières</p>
            <div class="tarif-form">
              <div class="tarif-group" v-for="t in tarifs" :key="t.label">
                <label>{{ t.label }}</label>
                <div class="tarif-input-row">
                  <input v-model.number="t.valeur" type="number" class="tarif-input" />
                  <span>F CFA / jour</span>
                </div>
              </div>
              <button class="btn-save" @click="sauvegarderTarifs">💾 Sauvegarder les tarifs</button>
            </div>
          </div>
          <div class="card">
            <h3>📊 Quotas de courses</h3>
            <p class="card-desc">Définissez le nombre de courses maximum par profil</p>
            <div class="tarif-form">
              <div class="tarif-group" v-for="q in quotas" :key="q.label">
                <label>{{ q.label }}</label>
                <div class="tarif-input-row">
                  <input v-model.number="q.valeur" type="number" class="tarif-input" />
                  <span>courses / jour</span>
                </div>
              </div>
              <button class="btn-save" @click="sauvegarderQuotas">💾 Sauvegarder les quotas</button>
            </div>
          </div>
        </div>
        <div class="card">
          <h3>🔧 Frais de service</h3>
          <p class="card-desc">Frais prélevés par la plateforme sur chaque transaction</p>
          <div class="tarif-form" style="max-width: 300px;">
            <div class="tarif-group">
              <label>Frais de service par commande</label>
              <div class="tarif-input-row">
                <input v-model.number="fraisService" type="number" class="tarif-input" />
                <span>F CFA</span>
              </div>
            </div>
            <button class="btn-save" @click="sauvegarderFrais">💾 Sauvegarder</button>
          </div>
        </div>
      </div>

      <!-- TRANSACTIONS -->
      <div v-if="activeMenu === 'transactions'" class="content">
        <div class="stats-grid" style="grid-template-columns: repeat(3,1fr)">
          <div class="stat-card green">
            <span class="stat-icon">💰</span>
            <p class="stat-val">284 500 F</p>
            <p class="stat-label">Revenus totaux</p>
          </div>
          <div class="stat-card blue">
            <span class="stat-icon">🔄</span>
            <p class="stat-val">142</p>
            <p class="stat-label">Transactions ce mois</p>
          </div>
          <div class="stat-card amber">
            <span class="stat-icon">⏳</span>
            <p class="stat-val">3</p>
            <p class="stat-label">En attente</p>
          </div>
        </div>
        <div class="table-card card">
          <h3 style="margin-bottom:16px">📋 Dernières transactions</h3>
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Coursière</th>
                <th>Montant</th>
                <th>Frais service</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td><span class="tx-id">#{{ t.id }}</span></td>
                <td>{{ t.client }}</td>
                <td>{{ t.coursiere }}</td>
                <td><strong>{{ t.montant }} F</strong></td>
                <td class="frais-cell">+{{ t.frais }} F</td>
                <td>
                  <span class="tx-badge" :class="t.statut">
                    {{ t.statut === 'complete' ? '✓ Complété' : t.statut === 'pending' ? '⏳ En attente' : '✗ Échoué' }}
                  </span>
                </td>
                <td>{{ t.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- LITIGES -->
      <div v-if="activeMenu === 'litiges'" class="content">
        <div class="litiges-list">
          <div class="card litige-card" v-for="l in litiges" :key="l.id">
            <div class="litige-header">
              <span class="litige-icon">⚠️</span>
              <div>
                <p class="litige-title">{{ l.titre }}</p>
                <span class="litige-date">{{ l.date }}</span>
              </div>
              <span class="litige-badge" :class="l.statut">
                {{ l.statut === 'ouvert' ? 'Ouvert' : 'Résolu' }}
              </span>
            </div>
            <p class="litige-desc">{{ l.desc }}</p>
            <div class="litige-parties">
              <span>👤 {{ l.client }}</span>
              <span>→</span>
              <span>👩🏾 {{ l.coursiere }}</span>
            </div>
            <div class="litige-actions" v-if="l.statut === 'ouvert'">
              <button class="btn-sm green" @click="resoudreLitige(l)">✓ Marquer résolu</button>
              <button class="btn-sm gray">💬 Contacter les parties</button>
            </div>
          </div>
          <div class="empty-state" v-if="litiges.length === 0">
            <span>🎉</span>
            <p>Aucun litige en cours</p>
          </div>
        </div>
      </div>

      <!-- MARCHÉS -->
      <div v-if="activeMenu === 'marches'" class="content">
        <div class="marches-admin-grid">
          <div class="card marche-admin-card" v-for="m in marchesAdmin" :key="m.nom">
            <div class="marche-admin-header">
              <span class="marche-admin-icon">{{ m.icon }}</span>
              <div>
                <p class="marche-admin-nom">{{ m.nom }}</p>
                <span>📍 {{ m.commune }}</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="m.actif" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="marche-admin-stats">
              <div><p>{{ m.coursieres }}</p><span>Coursières</span></div>
              <div><p>{{ m.coursesJour }}</p><span>Courses/jour</span></div>
              <div><p>{{ m.note }}</p><span>Note moy.</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- TOAST -->
    <div class="toast" v-if="toastMsg" :class="toastType">{{ toastMsg }}</div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import api from '../../api/axios.js'

const router = useRouter()
const authStore = useAuthStore()
const activeMenu = ref('overview')
const searchCoursiere = ref('')
const filtreCoursiere = ref('tous')
const toastMsg = ref('')
const toastType = ref('success')

const dateAujourdhui = computed(() => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const menus = [
  { id: 'overview', icon: '📊', label: 'Vue d\'ensemble', desc: 'Statistiques globales de la plateforme' },
  { id: 'coursieres', icon: '👩🏾', label: 'Coursières', desc: 'Gestion et validation des coursières' },
  { id: 'tarifs', icon: '💰', label: 'Tarification', desc: 'Unités journalières et quotas' },
  { id: 'transactions', icon: '💳', label: 'Transactions', desc: 'Suivi des paiements et revenus' },
  { id: 'litiges', icon: '⚠️', label: 'Litiges', desc: 'Gestion des conflits et signalements' },
  { id: 'marches', icon: '🏪', label: 'Marchés', desc: 'Activation et suivi des marchés' },
]

const menuActif = computed(() => menus.find(m => m.id === activeMenu.value))

const statsGlobales = ref([
  { icon: '👩🏾', val: '24', label: 'Coursières actives', trend: 12, color: 'green' },
  { icon: '👤', val: '89', label: 'Clients inscrits', trend: 8, color: 'blue' },
  { icon: '🛒', val: '142', label: 'Courses ce mois', trend: 23, color: 'amber' },
  { icon: '💰', val: '284 500 F', label: 'Revenus totaux', trend: 18, color: 'green' },
  { icon: '⭐', val: '4.7', label: 'Note moyenne', trend: 2, color: 'blue' },
  { icon: '⚠️', val: '2', label: 'Litiges ouverts', trend: -1, color: 'red' }
])

const activites = ref([
  { id: 1, type: 'success', text: 'Nouvelle coursière inscrite — Fatou D.', time: 'Il y a 5 min' },
  { id: 2, type: 'payment', text: 'Transaction reçue — 8 500 F CFA', time: 'Il y a 12 min' },
  { id: 3, type: 'warning', text: 'Litige signalé — Commande #142', time: 'Il y a 34 min' },
  { id: 4, type: 'success', text: 'Course complétée — Marché Adjamé', time: 'Il y a 1h' },
  { id: 5, type: 'payment', text: 'Transaction reçue — 12 200 F CFA', time: 'Il y a 2h' }
])

const marchesStats = ref([
  { nom: 'Marché d\'Adjamé', commune: 'Adjamé', icon: '🏪', coursieres: 8 },
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🛒', coursieres: 6 },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🏪', coursieres: 4 },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒', coursieres: 3 },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪', coursieres: 2 },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒', coursieres: 1 }
])

const coursieres = ref([
  { id: 1, nom: 'Amara Koné', initiales: 'AK', telephone: '07 01 02 03', marche: 'Adjamé', type: 'Premium', statut: 'disponible', note: 4.9, courses: 127, validee: true },
  { id: 2, nom: 'Fatou Diallo', initiales: 'FD', telephone: '05 04 05 06', marche: 'Cocody', type: 'Standard', statut: 'disponible', note: 4.7, courses: 89, validee: true },
  { id: 3, nom: 'Binta Ouédraogo', initiales: 'BO', telephone: '07 07 08 09', marche: 'Adjamé', type: 'Premium', statut: 'occupee', note: 4.8, courses: 203, validee: true },
  { id: 4, nom: 'Mariama Traoré', initiales: 'MT', telephone: '01 10 11 12', marche: 'Koumassi', type: 'Standard', statut: 'hors_ligne', note: 4.6, courses: 54, validee: false },
  { id: 5, nom: 'Awa Coulibaly', initiales: 'AC', telephone: '05 13 14 15', marche: 'Treichville', type: 'Standard', statut: 'hors_ligne', note: 0, courses: 0, validee: false }
])


const filtresCoursiere = [
  { val: 'tous', label: 'Toutes' },
  { val: 'disponible', label: 'Disponibles' },
  { val: 'pending', label: 'En attente' },
  { val: 'premium', label: 'Premium' }
]

const coursieresFiltrees = computed(() => {
  return coursieres.value.filter(c => {
    const matchSearch = c.nom.toLowerCase().includes(searchCoursiere.value.toLowerCase())
    const matchFiltre = filtreCoursiere.value === 'tous' ||
      (filtreCoursiere.value === 'disponible' && c.statut === 'disponible') ||
      (filtreCoursiere.value === 'pending' && !c.validee) ||
      (filtreCoursiere.value === 'premium' && c.type === 'Premium')
    return matchSearch && matchFiltre
  })
})

const tarifs = ref([
  { label: 'Standard — Vendeuse', valeur: 500 },
  { label: 'Standard — Non-vendeuse', valeur: 600 },
  { label: 'Premium — Vendeuse', valeur: 1000 },
  { label: 'Premium — Non-vendeuse', valeur: 600 }
])

const quotas = ref([
  { label: 'Coursière Standard', valeur: 10 },
  { label: 'Coursière Premium', valeur: 15 }
])

const fraisService = ref(200)

const transactions = ref([
  { id: '001', client: 'Konan A.', coursiere: 'Amara K.', montant: 8500, frais: 200, statut: 'complete', date: '07/07/2026' },
  { id: '002', client: 'Diaby M.', coursiere: 'Fatou D.', montant: 12200, frais: 200, statut: 'complete', date: '07/07/2026' },
  { id: '003', client: 'Yao K.', coursiere: 'Binta O.', montant: 6800, frais: 200, statut: 'pending', date: '07/07/2026' },
  { id: '004', client: 'Touré S.', coursiere: 'Amara K.', montant: 9400, frais: 200, statut: 'complete', date: '06/07/2026' },
  { id: '005', client: 'N\'Guessan P.', coursiere: 'Mariama T.', montant: 5200, frais: 200, statut: 'failed', date: '06/07/2026' }
])

const litiges = ref([
  { id: 1, titre: 'Produit manquant dans la livraison', date: '07/07/2026', statut: 'ouvert', desc: 'Le client signale que le poisson commandé n\'était pas dans la livraison.', client: 'Konan A.', coursiere: 'Amara K.' },
  { id: 2, titre: 'Retard de livraison excessif', date: '06/07/2026', statut: 'ouvert', desc: 'Livraison reçue 3h après l\'heure prévue sans notification.', client: 'Yao K.', coursiere: 'Fatou D.' }
])

const marchesAdmin = ref([
  { nom: 'Marché d\'Adjamé', commune: 'Adjamé', icon: '🏪', actif: true, coursieres: 8, coursesJour: 24, note: '4.8' },
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🛒', actif: true, coursieres: 6, coursesJour: 18, note: '4.7' },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🏪', actif: true, coursieres: 4, coursesJour: 12, note: '4.6' },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒', actif: true, coursieres: 3, coursesJour: 9, note: '4.5' },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪', actif: true, coursieres: 2, coursesJour: 6, note: '4.4' },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒', actif: false, coursieres: 0, coursesJour: 0, note: '—' }
])


function showToast(msg, type = 'success') {
  toastMsg.value = msg
  toastType.value = type
  setTimeout(() => toastMsg.value = '', 3000)
}

function validerCoursiere(c) {
  c.validee = true
  showToast(`✓ ${c.nom} validée avec succès`)
}

function suspendreCoursiere(c) {
  c.statut = 'hors_ligne'
  showToast(`🚫 ${c.nom} suspendue`, 'warning')
}

function voirCoursiere(c) {
  showToast(`👁 Profil de ${c.nom} — à venir`)
}

function sauvegarderTarifs() {
  showToast('💾 Tarifs mis à jour avec succès')
}

function sauvegarderQuotas() {
  showToast('💾 Quotas mis à jour avec succès')
}

function sauvegarderFrais() {
  showToast('💾 Frais de service mis à jour')
}

function resoudreLitige(l) {
  l.statut = 'resolu'
  showToast('✓ Litige marqué comme résolu')
}
</script>

<style scoped>
.admin { display: flex; min-height: 100vh; background: var(--fond); }

/* SIDEBAR */
.sidebar { width: 240px; background: var(--vert-dark); color: white; display: flex; flex-direction: column; padding: 24px 16px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; }
.sidebar-logo { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
.sidebar-role { font-size: 11px; opacity: 0.6; margin-bottom: 32px; }
.sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: none; background: transparent; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; text-align: left; }
.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; font-weight: 700; }
.btn-deconnexion { padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; text-align: left; transition: all 0.2s; margin-top: 16px; }
.btn-deconnexion:hover { background: rgba(255,255,255,0.1); color: white; }

/* MAIN */
.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* TOPBAR */
.topbar { background: white; border-bottom: 0.5px solid var(--bordure); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
.topbar h1 { font-size: 20px; font-weight: 800; color: var(--texte); margin: 0 0 4px; }
.topbar p { font-size: 13px; color: var(--texte-sec); margin: 0; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.admin-badge { background: var(--vert-light); color: var(--vert-dark); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.date-badge { font-size: 12px; color: var(--texte-sec); }

/* CONTENT */
.content { padding: 28px 32px; overflow-y: auto; flex: 1; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.stat-card.green { border-left: 3px solid var(--vert); }
.stat-card.blue { border-left: 3px solid #3b82f6; }
.stat-card.amber { border-left: 3px solid #f59e0b; }
.stat-card.red { border-left: 3px solid #ef4444; }
.stat-icon { font-size: 24px; display: block; margin-bottom: 10px; }
.stat-val { font-size: 22px; font-weight: 800; color: var(--texte); margin: 0 0 4px; }
.stat-label { font-size: 12px; color: var(--texte-sec); margin: 0 0 6px; }
.stat-trend { font-size: 11px; font-weight: 600; margin: 0; }
.stat-trend.up { color: var(--vert); }
.stat-trend.down { color: #ef4444; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
.card { background: white; border-radius: 14px; padding: 20px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.card h3 { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 16px; }
.card-desc { font-size: 13px; color: var(--texte-sec); margin: -10px 0 16px; }

/* ACTIVITÉ */
.activite-list { display: flex; flex-direction: column; gap: 12px; }
.activite-item { display: flex; align-items: flex-start; gap: 10px; }
.activite-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.activite-dot.success { background: var(--vert); }
.activite-dot.payment { background: #3b82f6; }
.activite-dot.warning { background: #f59e0b; }
.activite-info p { font-size: 13px; color: var(--texte); margin: 0 0 2px; }
.activite-info span { font-size: 11px; color: var(--texte-sec); }

/* MARCHÉS STATS */
.marche-list { display: flex; flex-direction: column; gap: 10px; }
.marche-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 0.5px solid var(--bordure); }
.marche-row-left { display: flex; align-items: center; gap: 10px; }
.marche-row-left span:first-child { font-size: 20px; }
.marche-row-left p { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.marche-row-left span:last-child { font-size: 11px; color: var(--texte-sec); }
.badge-actif { background: var(--vert-light); color: var(--vert-dark); padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }

/* TOOLBAR */
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.search-input { padding: 10px 16px; border: 1px solid var(--bordure); border-radius: 24px; font-size: 13px; background: white; flex: 1; min-width: 200px; color: var(--texte); }
.search-input:focus { border-color: var(--vert); outline: none; }
.toolbar-filters { display: flex; gap: 6px; }
.filter-btn { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--bordure); background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--texte-sec); transition: all 0.2s; }
.filter-btn.active { background: var(--vert); color: white; border-color: var(--vert); }

/* TABLE */
.table-card { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; color: var(--texte-sec); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--bordure); }
.table td { padding: 12px; border-bottom: 0.5px solid var(--bordure); color: var(--texte); vertical-align: middle; }
.table tr:last-child td { border-bottom: none; }
.user-cell { display: flex; align-items: center; gap: 10px; }
.mini-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.user-cell p { font-size: 13px; font-weight: 600; margin: 0 0 2px; }
.user-cell span { font-size: 11px; color: var(--texte-sec); }
.type-badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.type-badge.premium { background: #fef3c7; color: #92400e; }
.type-badge.standard { background: var(--vert-light); color: var(--vert-dark); }
.statut-dot { font-size: 12px; font-weight: 600; }
.valid-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.valid-badge.validee { background: #dcfce7; color: #166534; }
.valid-badge.pending { background: #fef3c7; color: #92400e; }
.action-btns { display: flex; gap: 4px; }
.btn-sm { width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.btn-sm.green { background: #dcfce7; }
.btn-sm.red { background: #fee2e2; }
.btn-sm.gray { background: var(--fond); }

/* TARIFS */
.tarif-form { display: flex; flex-direction: column; gap: 16px; }
.tarif-group label { display: block; font-size: 13px; font-weight: 600; color: var(--texte); margin-bottom: 8px; }
.tarif-input-row { display: flex; align-items: center; gap: 10px; }
.tarif-input { padding: 10px 14px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 14px; font-weight: 600; width: 120px; color: var(--texte); }
.tarif-input:focus { border-color: var(--vert); outline: none; }
.tarif-input-row span { font-size: 13px; color: var(--texte-sec); }
.btn-save { background: var(--vert); color: white; padding: 12px 20px; border-radius: var(--radius); border: none; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all 0.2s; }
.btn-save:hover { background: var(--vert-dark); }

/* TRANSACTIONS */
.tx-id { font-family: monospace; font-size: 12px; color: var(--texte-sec); }
.frais-cell { color: var(--vert); font-weight: 600; }
.tx-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.tx-badge.complete { background: #dcfce7; color: #166534; }
.tx-badge.pending { background: #fef3c7; color: #92400e; }
.tx-badge.failed { background: #fee2e2; color: #dc2626; }

/* LITIGES */
.litiges-list { display: flex; flex-direction: column; gap: 16px; }
.litige-card { }
.litige-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.litige-icon { font-size: 24px; }
.litige-title { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.litige-date { font-size: 12px; color: var(--texte-sec); }
.litige-badge { margin-left: auto; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.litige-badge.ouvert { background: #fee2e2; color: #dc2626; }
.litige-badge.resolu { background: #dcfce7; color: #166534; }
.litige-desc { font-size: 13px; color: var(--texte-sec); margin-bottom: 10px; line-height: 1.6; }
.litige-parties { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--texte-sec); margin-bottom: 12px; }
.litige-actions { display: flex; gap: 8px; }

/* MARCHÉS ADMIN */
.marches-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
.marche-admin-card { }
.marche-admin-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.marche-admin-icon { font-size: 28px; }
.marche-admin-nom { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.marche-admin-header span { font-size: 12px; color: var(--texte-sec); }
.marche-admin-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.marche-admin-stats div { background: var(--fond); border-radius: 8px; padding: 10px; text-align: center; }
.marche-admin-stats p { font-size: 18px; font-weight: 800; color: var(--vert-dark); margin: 0 0 2px; }
.marche-admin-stats span { font-size: 11px; color: var(--texte-sec); }

/* TOGGLE */
.toggle-switch { margin-left: auto; position: relative; width: 40px; height: 22px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: var(--bordure); border-radius: 22px; cursor: pointer; transition: 0.2s; }
.toggle-slider::before { content: ''; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: 0.2s; }
.toggle-switch input:checked + .toggle-slider { background: var(--vert); }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(18px); }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 48px; display: block; margin-bottom: 12px; }
.empty-state p { font-size: 16px; color: var(--texte-sec); }

/* TOAST */
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; z-index: 9999; animation: toastIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.toast.success { background: var(--vert); color: white; }
.toast.warning { background: #f59e0b; color: white; }
@keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>