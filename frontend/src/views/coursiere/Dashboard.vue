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
      <div class="nouvelle-course" v-if="nouvelleCourseData">
        <div class="course-header">
          <span class="course-ping"></span>
          <h3>Nouvelle course disponible !</h3>
          <span class="course-timer">⏱ {{ timer }}s</span>
        </div>
        <div class="course-details two">
          <div class="course-detail">
            <span>🏪</span>
            <div>
              <p>{{ nouvelleCourseData.marche }}</p>
              <p>{{ nouvelleCourseData.commune }}</p>
            </div>
          </div>
          <div class="course-detail">
            <span>📋</span>
            <div>
              <p>{{ (nouvelleCourseData.liste || '').slice(0, 36) }}{{ (nouvelleCourseData.liste || '').length > 36 ? '…' : '' }}</p>
              <p>Liste de courses</p>
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
            <p>{{ courseEnCours.marche }} · Client : {{ clientNom }}</p>
          </div>
          <span class="encours-badge" v-if="!paiementRecu">En cours</span>
          <span class="encours-badge paye" v-else>✅ Payé</span>
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
                <div class="histo-note">{{ h.note ? `⭐ ${h.note}` : '—' }}</div>
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
              <span class="profil-badge" :class="typeProfile.toLowerCase()">{{ typeProfile }}</span>
            </div>
            <div class="profil-item">
              <span>Note moyenne</span>
              <span>⭐ {{ noteMoyenne }}</span>
            </div>
            <div class="profil-item">
              <span>Courses totales</span>
              <span>{{ historique.length }}</span>
            </div>
            <div class="profil-item">
              <span>Statut validation</span>
              <span class="profil-badge" :class="estValidee ? 'standard' : 'pending'">{{ estValidee ? '✓ Validée' : 'En attente' }}</span>
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

    <!-- MODALE TCHAT -->
    <div class="modal-overlay" v-if="showTchat && courseEnCours" @click.self="showTchat = false">
      <div class="modal tchat-modal">
        <button class="modal-close" @click="showTchat = false">✕</button>
        <div class="tchat-card">
          <div class="tchat-header">
            <div class="coursiere-avatar sm">{{ clientInitiales }}</div>
            <div class="tchat-header-info">
              <p class="tchat-nom">{{ clientNom }}</p>
              <p class="tchat-statut"><span class="dot-green"></span> {{ courseEnCours.marche }}</p>
            </div>
            <span class="paiement-badge" v-if="paiementRecu">✅ Payé</span>
          </div>
          <div class="quick-actions">
            <button class="quick-btn" @click="showDevisForm = !showDevisForm">💰 Proposer un devis</button>
          </div>
          <div class="devis-form" v-if="showDevisForm">
            <input v-model.number="devisForm.budgetCourses" type="number" placeholder="Budget courses estimé (F CFA)" />
            <input v-model.number="devisForm.fraisLivraison" type="number" placeholder="Frais de livraison (F CFA)" />
            <button class="btn-envoyer-devis" :disabled="!devisForm.budgetCourses || !devisForm.fraisLivraison" @click="envoyerDevis">Envoyer le devis</button>
          </div>
          <div class="tchat-messages" ref="messagesEl">
            <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.from">
              <div v-if="msg.type === 'liste'" class="bubble liste-bubble">
                <div class="liste-bubble-header">📋 Liste de courses</div>
                <div class="liste-bubble-content">{{ msg.text }}</div>
              </div>
              <div v-else-if="msg.type === 'devis'" class="bubble devis-bubble">
                <div class="devis-bubble-header">💰 Devis envoyé</div>
                <div class="devis-line"><span>Frais prestation</span><strong>{{ msg.devis.prestation }} F</strong></div>
                <div class="devis-line"><span>Frais livraison</span><strong>{{ msg.devis.livraison }} F</strong></div>
                <div class="devis-total"><span>Total frais</span><strong>{{ msg.devis.prestation + msg.devis.livraison }} F</strong></div>
              </div>
              <div v-else class="bubble">{{ msg.text }}</div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>
          <div class="tchat-input">
            <input v-model="nouveauMsg" placeholder="Écrire un message..." @keyup.enter="envoyerMessage" />
            <button class="btn-send" @click="envoyerMessage" :disabled="!nouveauMsg.trim()"><span>➤</span></button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import api from '../../api/axios.js'
import socket from '../../api/socket.js'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'

const authStore = useAuthStore()
const toast = useToastStore()

const statut = ref(authStore.user?.coursiere?.statut || 'hors_ligne')
const unitesActives = ref(authStore.user?.coursiere?.unitesActives || false)
const coursesAujourdhui = ref(authStore.user?.coursiere?.coursesAujourdhui || 0)
const quotaJournalier = ref(authStore.user?.coursiere?.quotaJournalier || 10)
const showUnites = ref(false)
const showTchat = ref(false)
const uniteChoisie = ref('Standard')
const timer = ref(25)
const nouvelleCourseData = ref(null)
const courseEnCours = ref(null)
let timerInterval = null

const typeProfile = computed(() => authStore.user?.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard')
const estValidee = computed(() => !!authStore.user?.coursiere?.valide)
const noteMoyenne = computed(() => {
  const c = authStore.user?.coursiere
  return c?.nombreAvis > 0 ? Math.round(c.note / c.nombreAvis * 10) / 10 : '—'
})

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')
})

const clientNom = computed(() => courseEnCours.value?.client ? `${courseEnCours.value.client.prenom} ${courseEnCours.value.client.nom}` : '')
const clientInitiales = computed(() => {
  const c = courseEnCours.value?.client
  if (!c) return '?'
  return (c.prenom?.[0] || '') + (c.nom?.[0] || '')
})

const stats = ref([
  { icon: '🛒', val: '0', label: 'Courses aujourd\'hui' },
  { icon: '💰', val: '0 F', label: 'Revenus du jour' },
  { icon: '⭐', val: '—', label: 'Note moyenne' },
  { icon: '📊', val: '0', label: 'Courses ce mois' }
])

const historique = ref([])
const mesCoursesRaw = ref([])

const unitesOptions = [
  { type: 'Standard', icon: '⭐', prix: 500, quota: 10 },
  { type: 'Premium', icon: '💎', prix: 1000, quota: 15 }
]

async function chargerProfil() {
  try {
    const res = await api.get('/auth/moi')
    authStore.mettreAJourUser({ coursiere: res.data.user.coursiere, actif: res.data.user.actif })
    statut.value = authStore.user.coursiere?.statut || 'hors_ligne'
    unitesActives.value = authStore.user.coursiere?.unitesActives || false
    coursesAujourdhui.value = authStore.user.coursiere?.coursesAujourdhui || 0
    quotaJournalier.value = authStore.user.coursiere?.quotaJournalier || 10
  } catch (err) {
    console.error('Erreur profil:', err)
  }
}

function recalculerStats() {
  const aujourdhui = new Date().toDateString()
  const debutMois = new Date()
  debutMois.setDate(1)
  debutMois.setHours(0, 0, 0, 0)

  const livrees = mesCoursesRaw.value.filter(c => c.statut === 'livree')
  const gain = (c) => (c.fraisPrestation || 0) + (c.fraisLivraison || 0)

  const livreesAujourdhui = livrees.filter(c => new Date(c.createdAt).toDateString() === aujourdhui)
  const livreesMois = livrees.filter(c => new Date(c.createdAt) >= debutMois)
  const revenusJour = livreesAujourdhui.reduce((acc, c) => acc + gain(c), 0)

  stats.value[0].val = String(livreesAujourdhui.length)
  stats.value[1].val = `${revenusJour} F`
  stats.value[2].val = String(noteMoyenne.value)
  stats.value[3].val = String(livreesMois.length)

  historique.value = livrees
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(c => ({
      id: c._id,
      marche: c.marche,
      date: new Date(c.createdAt).toLocaleDateString('fr-FR'),
      gain: gain(c),
      note: c.noteClient || null
    }))
}

async function chargerHistorique() {
  try {
    const res = await api.get('/courses/mes-courses')
    mesCoursesRaw.value = res.data.courses
    recalculerStats()
  } catch (err) {
    console.error('Erreur historique:', err)
  }
}

onMounted(async () => {
  await chargerProfil()
  await chargerHistorique()

  socket.connect()
  socket.on('nouvelle_course', (course) => {
    if (nouvelleCourseData.value || courseEnCours.value) return
    if (statut.value !== 'disponible' || !unitesActives.value) return
    if (coursesAujourdhui.value >= quotaJournalier.value) return
    nouvelleCourseData.value = course
    startTimer()
  })
})

onUnmounted(() => {
  clearInterval(timerInterval)
  socket.off('nouvelle_course')
  socket.off('nouveau_message')
  socket.off('devis_propose')
  socket.off('statut_change')
  if (socket.connected) socket.disconnect()
})

async function toggleStatut() {
  if (!unitesActives.value) {
    showUnites.value = true
    return
  }
  const nouveauStatut = statut.value === 'disponible' ? 'hors_ligne' : 'disponible'
  try {
    await api.put('/coursiere/statut', { statut: nouveauStatut })
    statut.value = nouveauStatut
  } catch (err) {
    toast.error('Erreur lors du changement de statut')
  }
}

async function acheterUnites() {
  try {
    const res = await api.put('/coursiere/unites', { type: uniteChoisie.value })
    unitesActives.value = true
    quotaJournalier.value = res.data.quota || (uniteChoisie.value === 'Premium' ? 15 : 10)
    statut.value = 'disponible'
    showUnites.value = false
    toast.success('Unités activées, vous êtes maintenant disponible !')
    chargerProfil()
  } catch (err) {
    toast.error('Erreur lors de l\'achat des unités')
  }
}

function startTimer() {
  timer.value = 25
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(timerInterval)
      nouvelleCourseData.value = null
    }
  }, 1000)
}

async function accepterCourse() {
  clearInterval(timerInterval)
  const course = nouvelleCourseData.value
  nouvelleCourseData.value = null
  try {
    const res = await api.put(`/courses/${course._id}/accepter`)
    courseEnCours.value = res.data.course
    coursesAujourdhui.value++
    paiementRecu.value = false
    messages.value = []
    devisForm.value = { budgetCourses: null, fraisLivraison: null }
    showDevisForm.value = false

    socket.emit('rejoindre_course', courseEnCours.value._id)
    socket.off('nouveau_message')
    socket.off('devis_propose')
    socket.off('statut_change')

    socket.on('nouveau_message', (msg) => {
      messages.value.push(formaterMessage(msg))
      scrollBottom()
    })

    socket.on('devis_propose', ({ course }) => {
      messages.value.push({
        from: 'coursiere',
        type: 'devis',
        devis: { prestation: course.fraisPrestation, livraison: course.fraisLivraison },
        time: getTime()
      })
      scrollBottom()
    })

    socket.on('statut_change', ({ course }) => {
      if (course.paiementEffectue) paiementRecu.value = true
    })

    toast.success('Course acceptée ! Vous pouvez contacter le client.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Cette course n\'est plus disponible')
  }
}

function refuserCourse() {
  clearInterval(timerInterval)
  nouvelleCourseData.value = null
}

const messages = ref([])
const messagesEl = ref(null)
const nouveauMsg = ref('')
const paiementRecu = ref(false)
const devisForm = ref({ budgetCourses: null, fraisLivraison: null })
const showDevisForm = ref(false)

function getTime(date) {
  return new Date(date || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function formaterMessage(msg) {
  return {
    from: msg.expediteur === authStore.user?.id ? 'coursiere' : 'client',
    text: msg.texte,
    type: msg.type,
    devis: msg.devis,
    time: getTime(msg.createdAt)
  }
}

async function envoyerMessage() {
  if (!nouveauMsg.value.trim()) return
  const texte = nouveauMsg.value
  nouveauMsg.value = ''
  try {
    await api.post('/messages', {
      course: courseEnCours.value._id,
      texte,
      type: 'normal'
    })
  } catch (err) {
    toast.error('Erreur lors de l\'envoi du message')
  }
}

async function envoyerDevis() {
  try {
    const res = await api.put(`/courses/${courseEnCours.value._id}/devis`, {
      budgetCourses: devisForm.value.budgetCourses,
      fraisLivraison: devisForm.value.fraisLivraison
    })
    showDevisForm.value = false
    toast.success(`Devis envoyé : ${res.data.fraisPrestation} F de frais de prestation`)
  } catch (err) {
    toast.error('Erreur lors de l\'envoi du devis')
  }
}

async function terminerCourse() {
  try {
    await api.put(`/courses/${courseEnCours.value._id}/statut`, { statut: 'livree' })
    toast.success('Livraison marquée comme terminée !')
    showTchat.value = false
    courseEnCours.value = null
    socket.off('nouveau_message')
    socket.off('devis_propose')
    socket.off('statut_change')
    chargerHistorique()
  } catch (err) {
    toast.error('Erreur lors de la validation de la livraison')
  }
}
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
.course-details.two { grid-template-columns: repeat(2, 1fr); }
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
.encours-badge.paye { background: #dcfce7; color: #166534; }
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
.profil-badge.premium { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }
.profil-badge.pending { background: #fef3c7; color: #92400e; }

/* MODALE */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 24px; backdrop-filter: blur(4px); }
.modal { background: white; border-radius: 20px; padding: 36px; max-width: 420px; width: 100%; text-align: center; position: relative; box-shadow: 0 24px 60px rgba(0,0,0,0.2); animation: modalIn 0.25s ease; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.modal-close { position: absolute; top: 16px; right: 16px; background: var(--fond); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 14px; color: var(--texte-sec); z-index: 1; }
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

/* TCHAT MODAL */
.tchat-modal { max-width: 480px; text-align: left; padding: 0; overflow: hidden; }
.tchat-card { display: flex; flex-direction: column; height: 620px; }
.tchat-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 0.5px solid var(--bordure); background: white; }
.coursiere-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.coursiere-avatar.sm { width: 36px; height: 36px; font-size: 13px; }
.tchat-header-info { flex: 1; }
.tchat-nom { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.tchat-statut { font-size: 12px; color: var(--texte-sec); margin: 0; display: flex; align-items: center; gap: 5px; }
.dot-green { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; }
.paiement-badge { background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.quick-actions { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 0.5px solid var(--bordure); flex-wrap: wrap; background: var(--fond); }
.quick-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--bordure); background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--texte); transition: all 0.2s; }
.quick-btn:hover { border-color: var(--vert); color: var(--vert); background: var(--vert-light); }
.devis-form { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 0.5px solid var(--bordure); flex-wrap: wrap; background: var(--vert-light); }
.devis-form input { flex: 1; min-width: 140px; padding: 8px 12px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 13px; }
.btn-envoyer-devis { background: var(--vert); color: white; border: none; padding: 8px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-envoyer-devis:disabled { opacity: 0.5; cursor: not-allowed; }
.tchat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8faf9; }
.message { display: flex; flex-direction: column; }
.message.coursiere { align-items: flex-end; }
.message.client { align-items: flex-start; }
.bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
.message.coursiere .bubble { background: var(--vert); color: white; border-bottom-right-radius: 4px; }
.message.client .bubble { background: white; color: var(--texte); border: 0.5px solid var(--bordure); border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.msg-time { font-size: 10px; color: var(--texte-sec); margin-top: 4px; padding: 0 4px; }
.liste-bubble { background: white !important; border: 1.5px solid var(--vert) !important; padding: 0 !important; overflow: hidden; min-width: 220px; }
.liste-bubble-header { background: var(--vert); color: white; padding: 8px 14px; font-size: 12px; font-weight: 700; }
.liste-bubble-content { padding: 10px 14px; font-size: 13px; color: var(--texte); white-space: pre-wrap; line-height: 1.6; }
.devis-bubble { background: white !important; border: 1.5px solid #f59e0b !important; padding: 0 !important; overflow: hidden; min-width: 220px; }
.devis-bubble-header { background: #f59e0b; color: white; padding: 8px 14px; font-size: 12px; font-weight: 700; }
.devis-line { display: flex; justify-content: space-between; padding: 8px 14px 0; font-size: 13px; color: var(--texte-sec); }
.devis-line strong { color: var(--texte); }
.devis-total { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 14px; font-weight: 700; color: var(--texte); border-top: 0.5px solid var(--bordure); margin-top: 6px; }
.tchat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 0.5px solid var(--bordure); align-items: center; background: white; }
.tchat-input input { flex: 1; padding: 10px 16px; border: 1px solid var(--bordure); border-radius: 24px; font-size: 13px; background: var(--fond); color: var(--texte); }
.tchat-input input:focus { border-color: var(--vert); outline: none; }
.btn-send { background: var(--vert); color: white; border: none; border-radius: 50%; width: 38px; height: 38px; font-size: 15px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
