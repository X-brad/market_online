<template>
  <div class="dashboard-coursiere">

    <!-- HEADER -->
    <div class="dash-top">
      <div class="container">
        <div class="dash-header">
          <div class="dash-left">
            <div class="avatar-big">{{ initiales }}</div>
            <div>
              <h1>Bonjour, {{ authStore.user?.prenom }} 👋</h1>
              <p>📍 {{ authStore.user?.commune }} · Coursière MamiMarché</p>
            </div>
          </div>
          <div class="dash-right">
            <div class="statut-toggle">
              <span>Statut :</span>
              <button
                class="toggle-btn"
                :class="statut"
                @click="toggleStatut"
              >
                <span class="toggle-dot"></span>
                {{ statut === 'disponible' ? 'Disponible' : 'Hors ligne' }}
              </button>
            </div>
          </div>
        </div>

        <!-- UNITÉS -->
        <div class="unites-bar" :class="{ active: unitesActives }">
          <div class="unites-left">
            <span class="unites-icon">{{ unitesActives ? '✅' : '⚠️' }}</span>
            <div>
              <p class="unites-title">{{ unitesActives ? 'Unités actives aujourd\'hui' : 'Aucune unité active' }}</p>
              <p class="unites-sub">{{ unitesActives ? `Quota : ${coursesAujourdhui}/${quotaJournalier} courses` : 'Achetez des unités pour recevoir des courses' }}</p>
            </div>
          </div>
          <button class="btn-unites" @click="showUnites = true">
            {{ unitesActives ? 'Renouveler' : 'Acheter des unités' }}
          </button>
        </div>
      </div>
    </div>

    <div class="container dash-body">

      <!-- STATS -->
      <div class="stats-grid">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <span class="stat-icon">{{ s.icon }}</span>
          <p class="stat-val">{{ s.val }}</p>
          <p class="stat-label">{{ s.label }}</p>
        </div>
      </div>

      <!-- NOTIFICATION NOUVELLE COURSE -->
      <div class="nouvelle-course" v-if="nouvelleCourse">
        <div class="course-header">
          <span class="course-ping"></span>
          <h3>Nouvelle course disponible !</h3>
          <span class="course-timer">⏱ {{ timer }}s</span>
        </div>
        <div class="course-details">
          <div class="course-detail">
            <span>🏪</span>
            <div>
              <p>{{ nouvelleCourse.marche }}</p>
              <p>{{ nouvelleCourse.commune }}</p>
            </div>
          </div>
          <div class="course-detail">
            <span>📍</span>
            <div>
              <p>{{ nouvelleCourse.distance }}</p>
              <p>Distance</p>
            </div>
          </div>
          <div class="course-detail">
            <span>💰</span>
            <div>
              <p>{{ nouvelleCourse.gain }} F CFA</p>
              <p>Gain estimé</p>
            </div>
          </div>
        </div>
        <div class="course-actions">
          <button class="btn-refuser" @click="refuserCourse">Refuser</button>
          <button class="btn-accepter" @click="accepterCourse">Accepter la course ✓</button>
        </div>
      </div>

      <!-- COURSE EN COURS -->
      <div class="course-encours" v-if="courseEnCours">
        <div class="encours-header">
          <span>🛒</span>
          <div>
            <h3>Course en cours</h3>
            <p>{{ courseEnCours.marche }} · Client : {{ courseEnCours.client }}</p>
          </div>
          <span class="encours-badge">En cours</span>
        </div>
        <div class="liste-courses">
          <p class="liste-title">📋 Liste du client :</p>
          <p class="liste-content">{{ courseEnCours.liste }}</p>
        </div>
        <div class="encours-actions">
          <button class="btn-tchat" @click="showTchat = true">💬 Contacter le client</button>
          <button class="btn-terminer" @click="terminerCourse">Livraison effectuée ✓</button>
        </div>
      </div>

      <!-- DEUX COLONNES -->
      <div class="two-col">

        <!-- HISTORIQUE -->
        <div class="card">
          <h3 class="card-title">📦 Dernières courses</h3>
          <div class="historique">
            <div class="histo-item" v-for="h in historique" :key="h.id">
              <div class="histo-left">
                <div class="histo-icon">✓</div>
                <div>
                  <p class="histo-marche">{{ h.marche }}</p>
                  <p class="histo-date">{{ h.date }}</p>
                </div>
              </div>
              <div class="histo-right">
                <p class="histo-gain">+{{ h.gain }} F</p>
                <div class="histo-note">⭐ {{ h.note }}</div>
              </div>
            </div>
            <p class="empty" v-if="historique.length === 0">Aucune course pour l'instant</p>
          </div>
        </div>

        <!-- PROFIL -->
        <div class="card">
          <h3 class="card-title">👩🏾 Mon profil</h3>
          <div class="profil-info">
            <div class="profil-avatar">{{ initiales }}</div>
            <div class="profil-details">
              <p class="profil-nom">{{ authStore.user?.prenom }} {{ authStore.user?.nom }}</p>
              <p class="profil-commune">📍 {{ authStore.user?.commune }}</p>
            </div>
          </div>
          <div class="profil-items">
            <div class="profil-item">
              <span>Type de profil</span>
              <span class="profil-badge standard">Standard</span>
            </div>
            <div class="profil-item">
              <span>Note moyenne</span>
              <span>⭐ 0.0</span>
            </div>
            <div class="profil-item">
              <span>Courses totales</span>
              <span>0</span>
            </div>
            <div class="profil-item">
              <span>Statut validation</span>
              <span class="profil-badge pending">En attente</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODALE UNITÉS -->
    <div class="modal-overlay" v-if="showUnites" @click.self="showUnites = false">
      <div class="modal">
        <button class="modal-close" @click="showUnites = false">✕</button>
        <div class="modal-icon">💰</div>
        <h3>Acheter des unités journalières</h3>
        <p>Choisissez votre profil pour aujourd'hui</p>
        <div class="unites-options">
          <div
            class="unite-option"
            v-for="u in unitesOptions"
            :key="u.type"
            :class="{ selected: uniteChoisie === u.type }"
            @click="uniteChoisie = u.type"
          >
            <span class="unite-icon">{{ u.icon }}</span>
            <div>
              <p class="unite-type">{{ u.type }}</p>
              <p class="unite-prix">{{ u.prix }} F CFA / jour</p>
              <p class="unite-quota">{{ u.quota }} courses max</p>
            </div>
          </div>
        </div>
        <button class="btn-payer-unite" @click="acheterUnites">
          🌊 Payer via Wave
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const statut = ref('hors_ligne')
const unitesActives = ref(false)
const coursesAujourdhui = ref(0)
const quotaJournalier = ref(10)
const showUnites = ref(false)
const showTchat = ref(false)
const uniteChoisie = ref('Standard')
const timer = ref(25)
const nouvelleCourse = ref(null)
const courseEnCours = ref(null)
let timerInterval = null

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')


})

const stats = ref([
  { icon: '🛒', val: '0', label: 'Courses aujourd\'hui' },
  { icon: '💰', val: '0 F', label: 'Revenus du jour' },
  { icon: '⭐', val: '—', label: 'Note moyenne' },
  { icon: '📊', val: '0', label: 'Courses ce mois' }
])

const historique = ref([])

const unitesOptions = [
  { type: 'Standard', icon: '⭐', prix: 500, quota: 10 },
  { type: 'Premium', icon: '💎', prix: 1000, quota: 15 }
]

function toggleStatut() {
  if (!unitesActives.value) {
    showUnites.value = true
    return
  }
  statut.value = statut.value === 'disponible' ? 'hors_ligne' : 'disponible'
}

function acheterUnites() {
  unitesActives.value = true
  quotaJournalier.value = uniteChoisie.value === 'Premium' ? 15 : 10
  statut.value = 'disponible'
  showUnites.value = false

  // Simuler une nouvelle course après 3 secondes
  setTimeout(() => {
    if (statut.value === 'disponible') {
      nouvelleCourse.value = {
        marche: 'Marché Adjamé',
        commune: 'Adjamé',
        distance: '1.2 km',
        gain: 1200
      }
      startTimer()
    }
  }, 3000)
}

function startTimer() {
  timer.value = 25
  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(timerInterval)
      nouvelleCourse.value = null
    }
  }, 1000)
}

function accepterCourse() {
  clearInterval(timerInterval)
  courseEnCours.value = {
    marche: nouvelleCourse.value.marche,
    client: 'Konan A.',
    liste: '1 kg de tomates, 2 ignames, poisson maquereau 500g, gombos, oignons'
  }
  nouvelleCourse.value = null
  coursesAujourdhui.value++
  stats.value[0].val = coursesAujourdhui.value.toString()
}

function refuserCourse() {
  clearInterval(timerInterval)
  nouvelleCourse.value = null
}

function terminerCourse() {
  stats.value[1].val = (parseInt(stats.value[1].val) + 1200) + ' F'
  stats.value[3].val = (parseInt(stats.value[3].val) + 1).toString()
  historique.value.unshift({
    id: Date.now(),
    marche: courseEnCours.value.marche,
    date: 'Aujourd\'hui',
    gain: 1200,
    note: 5.0
  })
  courseEnCours.value = null
}

onUnmounted(() => clearInterval(timerInterval))

</script>

<style scoped>
.dashboard-coursiere { background: var(--fond); min-height: 100vh; padding-bottom: 60px; }

/* TOP */
.dash-top { background: linear-gradient(135deg, var(--vert-dark), var(--vert)); padding: 32px 0 24px; color: white; }
.dash-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.dash-left { display: flex; align-items: center; gap: 16px; }
.avatar-big { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
.dash-left h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
.dash-left p { font-size: 13px; opacity: 0.8; margin: 0; }
.statut-toggle { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.toggle-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
.toggle-btn.disponible { background: #4ade80; color: #065f46; }
.toggle-btn.hors_ligne { background: rgba(255,255,255,0.2); color: white; }
.toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

/* UNITÉS */
.unites-bar { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.unites-bar.active { background: rgba(74,222,128,0.15); border-color: rgba(74,222,128,0.3); }
.unites-left { display: flex; align-items: center; gap: 12px; }
.unites-icon { font-size: 22px; }
.unites-title { font-size: 14px; font-weight: 600; margin: 0 0 2px; }
.unites-sub { font-size: 12px; opacity: 0.8; margin: 0; }
.btn-unites { background: white; color: var(--vert-dark); padding: 8px 18px; border-radius: 20px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
.btn-unites:hover { transform: translateY(-1px); }

/* BODY */
.dash-body { padding-top: 28px; }

/* STATS */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: 14px; padding: 20px; text-align: center; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.stat-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.stat-val { font-size: 24px; font-weight: 800; color: var(--vert-dark); margin: 0 0 4px; }
.stat-label { font-size: 12px; color: var(--texte-sec); margin: 0; }

/* NOUVELLE COURSE */
.nouvelle-course { background: white; border-radius: 16px; border: 2px solid var(--vert); padding: 20px; margin-bottom: 24px; box-shadow: 0 0 0 4px rgba(29,158,117,0.1); animation: courseIn 0.4s ease; }
@keyframes courseIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
.course-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.course-ping { width: 10px; height: 10px; border-radius: 50%; background: var(--vert); animation: ping 1s infinite; display: inline-block; }
@keyframes ping { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
.course-header h3 { font-size: 16px; font-weight: 800; color: var(--texte); flex: 1; margin: 0; }
.course-timer { font-size: 14px; font-weight: 700; color: #dc2626; }
.course-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.course-detail { display: flex; align-items: center; gap: 8px; background: var(--fond); border-radius: 10px; padding: 10px; }
.course-detail span:first-child { font-size: 20px; }
.course-detail p:first-child { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.course-detail p:last-child { font-size: 11px; color: var(--texte-sec); margin: 0; }
.course-actions { display: flex; gap: 10px; }
.btn-refuser { padding: 12px 20px; border-radius: var(--radius); border: 1px solid var(--bordure); background: white; color: var(--texte-sec); font-size: 14px; cursor: pointer; }
.btn-accepter { flex: 1; padding: 12px; border-radius: var(--radius); background: var(--vert); color: white; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }

/* COURSE EN COURS */
.course-encours { background: white; border-radius: 16px; border: 1.5px solid #f59e0b; padding: 20px; margin-bottom: 24px; }
.encours-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.encours-header span:first-child { font-size: 28px; }
.encours-header h3 { font-size: 16px; font-weight: 700; margin: 0 0 2px; }
.encours-header p { font-size: 13px; color: var(--texte-sec); margin: 0; }
.encours-badge { margin-left: auto; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.liste-courses { background: var(--fond); border-radius: 10px; padding: 14px; margin-bottom: 16px; }
.liste-title { font-size: 13px; font-weight: 700; margin: 0 0 6px; color: var(--texte); }
.liste-content { font-size: 13px; color: var(--texte-sec); margin: 0; line-height: 1.6; }
.encours-actions { display: flex; gap: 10px; }
.btn-tchat { padding: 12px 20px; border-radius: var(--radius); border: 1.5px solid var(--vert); background: white; color: var(--vert); font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-terminer { flex: 1; padding: 12px; border-radius: var(--radius); background: var(--vert); color: white; border: none; font-size: 14px; font-weight: 700; cursor: pointer; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
.card { background: white; border-radius: 14px; padding: 20px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.card-title { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 16px; }

/* HISTORIQUE */
.historique { display: flex; flex-direction: column; gap: 10px; }
.histo-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 0.5px solid var(--bordure); }
.histo-left { display: flex; align-items: center; gap: 10px; }
.histo-icon { width: 28px; height: 28px; border-radius: 50%; background: var(--vert-light); color: var(--vert-dark); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.histo-marche { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.histo-date { font-size: 11px; color: var(--texte-sec); margin: 0; }
.histo-gain { font-size: 14px; font-weight: 700; color: var(--vert-dark); margin: 0 0 2px; text-align: right; }
.histo-note { font-size: 11px; color: var(--texte-sec); text-align: right; }
.empty { font-size: 13px; color: var(--texte-sec); text-align: center; padding: 20px 0; }

/* PROFIL */
.profil-info { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 0.5px solid var(--bordure); }
.profil-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
.profil-nom { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.profil-commune { font-size: 12px; color: var(--texte-sec); margin: 0; }
.profil-items { display: flex; flex-direction: column; gap: 10px; }
.profil-item { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--texte-sec); }
.profil-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.profil-badge.standard { background: var(--vert-light); color: var(--vert-dark); }
.profil-badge.pending { background: #fef3c7; color: #92400e; }

/* MODALE */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 24px; backdrop-filter: blur(4px); }
.modal { background: white; border-radius: 20px; padding: 36px; max-width: 420px; width: 100%; text-align: center; position: relative; box-shadow: 0 24px 60px rgba(0,0,0,0.2); animation: modalIn 0.25s ease; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-close { position: absolute; top: 16px; right: 16px; background: var(--fond); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; color: var(--texte-sec); }
.modal-icon { font-size: 44px; margin-bottom: 16px; display: block; }
.modal h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.modal p { font-size: 14px; color: var(--texte-sec); margin-bottom: 24px; }
.unites-options { display: flex; gap: 12px; margin-bottom: 20px; }
.unite-option { flex: 1; border: 1.5px solid var(--bordure); border-radius: 12px; padding: 16px 12px; cursor: pointer; transition: all 0.2s; text-align: left; }
.unite-option.selected { border-color: var(--vert); background: var(--vert-light); }
.unite-icon { font-size: 24px; display: block; margin-bottom: 8px; }
.unite-type { font-size: 14px; font-weight: 700; margin: 0 0 4px; color: var(--texte); }
.unite-prix { font-size: 13px; font-weight: 600; color: var(--vert); margin: 0 0 2px; }
.unite-quota { font-size: 11px; color: var(--texte-sec); margin: 0; }
.btn-payer-unite { width: 100%; padding: 14px; background: #1d4ed8; color: white; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-payer-unite:hover { background: #1e40af; }
</style>