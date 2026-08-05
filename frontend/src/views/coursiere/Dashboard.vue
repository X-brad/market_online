<template>
  <div class="dashboard-coursiere">

    <!-- HEADER -->
    <div class="dash-top">
      <div class="container">
        <div class="dash-header">
          <div class="dash-left">
            <div class="avatar-big">
              <img v-if="photoUrl" :src="photoUrl" alt="Photo de profil" />
              <span v-else>{{ initiales }}</span>
            </div>
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
                @click="(e) => { ripple(e); toggleStatut() }"
              >
                <span class="toggle-dot"></span>
                {{ statut === 'disponible' ? 'Disponible' : 'Hors ligne' }}
              </button>
            </div>
          </div>
        </div>

        <!-- VALIDATION EN ATTENTE -->
        <Transition name="alerte-pop">
          <div class="unites-bar validation-attente" v-if="!estValidee">
            <span class="validation-shine"></span>
            <div class="unites-left">
              <span class="unites-icon icon-sablier">⏳</span>
              <div>
                <p class="unites-title">Compte en attente de validation</p>
                <p class="unites-sub">Un administrateur doit valider votre compte avant que vous puissiez recevoir des courses.</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- UNITÉS -->
        <div class="unites-bar" :class="{ active: unitesActives }">
          <div class="unites-left">
            <span class="unites-icon">{{ unitesActives ? '✅' : '⚠️' }}</span>
            <div>
              <p class="unites-title">{{ unitesActives ? 'Unités actives aujourd\'hui' : 'Aucune unité active' }}</p>
              <p class="unites-sub">{{ unitesActives ? `Quota : ${coursesAujourdhuiCalcule}/${quotaJournalier} courses` : 'Achetez des unités pour recevoir des courses' }}</p>
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
        <div
          class="stat-card"
          :class="{ visible: statsVisibles }"
          v-for="(s, i) in stats"
          :key="s.label"
          :style="{ transitionDelay: (i * 80) + 'ms' }"
        >
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
          <button class="btn-refuser" @click="(e) => { ripple(e); refuserCourse() }">Refuser</button>
          <button class="btn-accepter" @click="(e) => { ripple(e); accepterCourse() }">Accepter la course ✓</button>
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
          <button class="btn-terminer" :disabled="livraisonData?.statut !== 'commandee'" @click="(e) => { ripple(e); terminerCourse() }">Livraison effectuée ✓</button>
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
            <div class="profil-avatar-wrap" @click="declencherChoixPhoto">
              <div class="profil-avatar">
                <img v-if="photoUrl" :src="photoUrl" alt="Photo de profil" />
                <span v-else>{{ initiales }}</span>
              </div>
              <div class="profil-avatar-overlay">
                <span v-if="uploadingPhoto" class="avatar-spinner"></span>
                <span v-else>📷</span>
              </div>
              <span class="avatar-edit-badge" v-if="!uploadingPhoto">📷</span>
              <input ref="photoInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden @change="onPhotoChoisie" />
            </div>
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

      <!-- TARIFS -->
      <div class="card tarifs-dash-card">
        <h3 class="card-title">💰 Tarifs & abonnement</h3>
        <div class="tarifs-toggle">
          <button type="button" :class="{ active: profilAffiche === 'standard' }" @click="profilAffiche = 'standard'">⭐ Standard</button>
          <button type="button" :class="{ active: profilAffiche === 'premium' }" @click="profilAffiche = 'premium'">💎 Premium</button>
          <span class="toggle-thumb" :class="profilAffiche"></span>
        </div>
        <Transition name="tarif-swap" mode="out-in">
          <div class="tarif-contenu" :key="profilAffiche">
            <p class="tarif-prix">
              {{ profilAffiche === 'standard' ? parametresTarifs.unitePrixStandardVendeuse : parametresTarifs.unitePrixPremiumVendeuse }} F CFA
              <span>/ jour</span>
            </p>
            <ul class="tarif-features">
              <li>✓ {{ profilAffiche === 'standard' ? parametresTarifs.quotaStandard : parametresTarifs.quotaPremium }} courses par jour</li>
              <li>✓ {{ profilAffiche === 'standard' ? 'Visibilité normale' : 'Visibilité prioritaire' }}</li>
              <li>✓ {{ profilAffiche === 'standard' ? 'Marché le plus proche' : 'Tout marché au choix' }}</li>
              <li>✓ {{ profilAffiche === 'standard' ? 'Tchat intégré' : 'Tchat + appel intégré' }}</li>
            </ul>
          </div>
        </Transition>
        <button class="tarif-cta" @click="(e) => { ripple(e); choisirTarifEtAcheter() }">
          Choisir {{ profilAffiche === 'standard' ? 'Standard' : 'Premium' }} →
        </button>
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
          <div class="quick-actions" v-if="paiementRecu">
            <button
              class="quick-btn"
              v-if="(!livraisonData || livraisonData.statut === 'non_demandee') && !showRechercheForm"
              @click="showRechercheForm = true"
            >🔍 Rechercher un livreur Yango</button>
            <span class="livraison-etat" v-else-if="livraisonData?.statut === 'proposee'">⏳ En attente de la réponse du client...</span>
            <button class="quick-btn" v-else-if="livraisonData?.statut === 'acceptee'" @click="commanderLivraison">✅ Confirmer la réservation</button>
            <span class="livraison-etat" v-else-if="livraisonData?.statut === 'commandee'">🛵 Livreur commandé</span>
          </div>

          <div class="yango-recherche" v-if="showRechercheForm">
            <div class="yango-form" v-if="!candidatsLivreurs.length && !rechercheEnCours">
              <input v-model="adresseRecherche" type="text" placeholder="Adresse de livraison (indiquée par le client)" />
              <button class="btn-envoyer-devis" :disabled="!adresseRecherche.trim()" @click="rechercherLivreurs">🔍 Lancer la recherche</button>
              <button class="btn-fermer-recherche" @click="showRechercheForm = false">Annuler</button>
            </div>

            <div class="recherche-chargement" v-if="rechercheEnCours">
              <div class="spinner-sm"></div>
              <p>Recherche de livreurs disponibles...</p>
            </div>

            <div class="candidats-livreurs" v-if="candidatsLivreurs.length && !rechercheEnCours">
              <div class="candidat-livreur" v-for="(c, i) in candidatsLivreurs" :key="i">
                <div class="candidat-info">
                  <p class="candidat-nom">{{ c.livreurNom }} <span class="candidat-note">⭐ {{ c.note }}</span></p>
                  <p class="candidat-detail">{{ c.dureeRecuperation }} récup. · {{ c.dureeLivraison }} livraison</p>
                </div>
                <div class="candidat-prix">
                  <strong>{{ c.prix }} F</strong>
                  <button class="btn-choisir-livreur" @click="choisirLivreur(c)">Choisir</button>
                </div>
              </div>
              <button class="btn-relancer-recherche" @click="candidatsLivreurs = []">🔄 Relancer la recherche</button>
            </div>
          </div>
          <div class="tchat-messages" ref="messagesEl">
            <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.from">
              <div v-if="msg.type === 'liste'" class="bubble liste-bubble">
                <div class="liste-bubble-header">📋 Liste de courses</div>
                <div class="liste-bubble-content">{{ msg.text }}</div>
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

const apiOrigin = api.defaults.baseURL.replace(/\/api\/?$/, '')
const photoUrl = computed(() => authStore.user?.photoUrl ? apiOrigin + authStore.user.photoUrl : null)
const photoInput = ref(null)
const uploadingPhoto = ref(false)

function ripple(e) {
  const btn = e.currentTarget
  if (!btn || btn.disabled) return
  const rect = btn.getBoundingClientRect()
  const taille = Math.max(rect.width, rect.height) * 1.6
  const span = document.createElement('span')
  span.className = 'ripple-effect'
  span.style.width = span.style.height = `${taille}px`
  span.style.left = `${(e.clientX ?? rect.left + rect.width / 2) - rect.left - taille / 2}px`
  span.style.top = `${(e.clientY ?? rect.top + rect.height / 2) - rect.top - taille / 2}px`
  const style = getComputedStyle(btn)
  if (style.position === 'static') btn.style.position = 'relative'
  btn.style.overflow = 'hidden'
  btn.appendChild(span)
  span.addEventListener('animationend', () => span.remove())
}

function declencherChoixPhoto() {
  if (uploadingPhoto.value) return
  photoInput.value?.click()
}

async function onPhotoChoisie(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingPhoto.value = true
  const formData = new FormData()
  formData.append('photo', file)
  try {
    const res = await api.post('/coursiere/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    authStore.mettreAJourUser({ photoUrl: res.data.photoUrl })
    toast.success('Photo de profil mise à jour 📸')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de la photo')
  } finally {
    uploadingPhoto.value = false
    e.target.value = ''
  }
}

const statut = ref(authStore.user?.coursiere?.statut || 'hors_ligne')
const unitesActives = ref(authStore.user?.coursiere?.unitesActives || false)
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

const coursesAujourdhuiCalcule = computed(() => {
  const aujourdhui = new Date().toDateString()
  return mesCoursesRaw.value.filter(c => new Date(c.createdAt).toDateString() === aujourdhui).length
})

const parametresTarifs = ref({
  unitePrixStandardVendeuse: 500,
  unitePrixPremiumVendeuse: 1000,
  quotaStandard: 10,
  quotaPremium: 15
})
const profilAffiche = ref('standard')

const unitesOptions = computed(() => [
  { type: 'Standard', icon: '⭐', prix: parametresTarifs.value.unitePrixStandardVendeuse, quota: parametresTarifs.value.quotaStandard },
  { type: 'Premium', icon: '💎', prix: parametresTarifs.value.unitePrixPremiumVendeuse, quota: parametresTarifs.value.quotaPremium }
])

function choisirTarifEtAcheter() {
  uniteChoisie.value = profilAffiche.value === 'standard' ? 'Standard' : 'Premium'
  showUnites.value = true
}

async function chargerProfil() {
  try {
    const res = await api.get('/auth/moi')
    authStore.mettreAJourUser({ coursiere: res.data.user.coursiere, actif: res.data.user.actif })
    statut.value = authStore.user.coursiere?.statut || 'hors_ligne'
    unitesActives.value = authStore.user.coursiere?.unitesActives || false
    quotaJournalier.value = authStore.user.coursiere?.quotaJournalier || 10
  } catch (err) {
    console.error('Erreur profil:', err)
  }
}

async function chargerTarifs() {
  try {
    const res = await api.get('/parametres')
    parametresTarifs.value = res.data
  } catch (err) {
    console.error('Erreur tarifs:', err)
  }
}

function animerValeurStat(index, nouvelleValeurBrute) {
  const ancienneChaine = stats.value[index].val
  const matchAncien = ancienneChaine.match(/-?\d+(\.\d+)?/)
  const matchNouveau = String(nouvelleValeurBrute).match(/-?\d+(\.\d+)?/)
  if (!matchAncien || !matchNouveau) {
    stats.value[index].val = String(nouvelleValeurBrute)
    return
  }
  const debut = parseFloat(matchAncien[0])
  const fin = parseFloat(matchNouveau[0])
  if (debut === fin) { stats.value[index].val = String(nouvelleValeurBrute); return }

  const suffixe = String(nouvelleValeurBrute).slice(matchNouveau[0].length)
  const decimales = matchNouveau[0].includes('.') ? 1 : 0
  const duree = 650
  const debutTemps = performance.now()

  function tick(maintenant) {
    const t = Math.min(1, (maintenant - debutTemps) / duree)
    const ease = 1 - Math.pow(1 - t, 3)
    const valeurActuelle = debut + (fin - debut) * ease
    stats.value[index].val = valeurActuelle.toFixed(decimales) + suffixe
    if (t < 1) requestAnimationFrame(tick)
    else stats.value[index].val = String(nouvelleValeurBrute)
  }
  requestAnimationFrame(tick)
}

function recalculerStats() {
  const aujourdhui = new Date().toDateString()
  const debutMois = new Date()
  debutMois.setDate(1)
  debutMois.setHours(0, 0, 0, 0)

  const livrees = mesCoursesRaw.value.filter(c => c.statut === 'livree')
  const gain = (c) => c.fraisPrestation || 0

  const livreesAujourdhui = livrees.filter(c => new Date(c.createdAt).toDateString() === aujourdhui)
  const livreesMois = livrees.filter(c => new Date(c.createdAt) >= debutMois)
  const revenusJour = livreesAujourdhui.reduce((acc, c) => acc + gain(c), 0)

  animerValeurStat(0, String(livreesAujourdhui.length))
  animerValeurStat(1, `${revenusJour} F`)
  animerValeurStat(2, String(noteMoyenne.value))
  animerValeurStat(3, String(livreesMois.length))

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

let watchIdPosition = null
let dernierEnvoiPosition = 0

function demarrerSuiviPosition() {
  if (!navigator.geolocation || watchIdPosition !== null) return
  watchIdPosition = navigator.geolocation.watchPosition(
    (pos) => {
      const maintenant = Date.now()
      if (maintenant - dernierEnvoiPosition < 15000) return
      dernierEnvoiPosition = maintenant
      api.put('/coursiere/position', {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }).catch(() => {})
    },
    () => {},
    { enableHighAccuracy: true, maximumAge: 10000 }
  )
}

function arreterSuiviPosition() {
  if (watchIdPosition !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchIdPosition)
    watchIdPosition = null
  }
}

const statsVisibles = ref(false)

onMounted(async () => {
  await chargerProfil()
  await chargerHistorique()
  chargerTarifs()
  requestAnimationFrame(() => { statsVisibles.value = true })

  socket.connect()
  socket.emit('rejoindre_coursiere', authStore.user?.id)
  socket.on('nouvelle_course', ({ course, expirationOffre }) => {
    if (nouvelleCourseData.value || courseEnCours.value) return
    if (statut.value !== 'disponible') return
    nouvelleCourseData.value = course
    startTimer(expirationOffre)
  })

  if (statut.value === 'disponible') demarrerSuiviPosition()
})

onUnmounted(() => {
  clearInterval(timerInterval)
  arreterSuiviPosition()
  socket.off('nouvelle_course')
  socket.off('nouveau_message')
  socket.off('livraison_maj')
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
    if (nouveauStatut === 'disponible') demarrerSuiviPosition()
    else arreterSuiviPosition()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors du changement de statut')
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
    demarrerSuiviPosition()
    chargerProfil()
  } catch (err) {
    toast.error('Erreur lors de l\'achat des unités')
  }
}

function startTimer(expirationOffre) {
  clearInterval(timerInterval)
  const tick = () => {
    const restant = Math.max(0, Math.ceil((expirationOffre - Date.now()) / 1000))
    timer.value = restant
    if (restant <= 0) {
      clearInterval(timerInterval)
      nouvelleCourseData.value = null
    }
  }
  tick()
  timerInterval = setInterval(tick, 1000)
}

async function accepterCourse() {
  clearInterval(timerInterval)
  const course = nouvelleCourseData.value
  nouvelleCourseData.value = null
  try {
    const res = await api.put(`/courses/${course._id}/accepter`)
    courseEnCours.value = res.data.course
    chargerHistorique()
    paiementRecu.value = false
    messages.value = []
    livraisonData.value = null
    showRechercheForm.value = false
    adresseRecherche.value = ''
    rechercheEnCours.value = false
    candidatsLivreurs.value = []

    socket.emit('rejoindre_course', courseEnCours.value._id)
    socket.off('nouveau_message')
    socket.off('livraison_maj')
    socket.off('statut_change')

    socket.on('nouveau_message', (msg) => {
      messages.value.push(formaterMessage(msg))
      scrollBottom()
    })

    socket.on('livraison_maj', ({ course }) => {
      livraisonData.value = course.livraison
      if (course.livraison.statut === 'acceptee') toast.success('Le client a accepté la livraison !')
      if (course.livraison.statut === 'non_demandee') toast.info('Le client souhaite un autre livreur.')
    })

    socket.on('statut_change', ({ course }) => {
      if (course.paiementEffectue) paiementRecu.value = true
    })

    toast.success('Course acceptée ! Vous pouvez contacter le client.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Cette course n\'est plus disponible')
  }
}

async function refuserCourse() {
  clearInterval(timerInterval)
  const course = nouvelleCourseData.value
  nouvelleCourseData.value = null
  if (!course) return
  try {
    await api.put(`/courses/${course._id}/refuser`)
  } catch (err) {
    // la course a peut-être déjà expiré ou été prise, rien à faire
  }
}

const messages = ref([])
const messagesEl = ref(null)
const nouveauMsg = ref('')
const paiementRecu = ref(false)
const livraisonData = ref(null)
const showRechercheForm = ref(false)
const adresseRecherche = ref('')
const rechercheEnCours = ref(false)
const candidatsLivreurs = ref([])

const PRENOMS_LIVREURS = ['Ibrahim', 'Moussa', 'Kader', 'Salif', 'Aboubakar', 'Issa', 'Drissa', 'Lassina']
const NOMS_LIVREURS = ['Traoré', 'Diabaté', 'Koné', 'Ouattara', 'Bamba', 'Coulibaly', 'Sanogo']

function genererLivreur() {
  const prenom = PRENOMS_LIVREURS[Math.floor(Math.random() * PRENOMS_LIVREURS.length)]
  const nom = NOMS_LIVREURS[Math.floor(Math.random() * NOMS_LIVREURS.length)]
  return {
    livreurNom: `${prenom} ${nom}`,
    livreurTelephone: '07' + Math.floor(10000000 + Math.random() * 89999999),
    dureeRecuperation: `${5 + Math.floor(Math.random() * 10)} min`,
    dureeLivraison: `${15 + Math.floor(Math.random() * 20)} min`,
    prix: 500 + Math.floor(Math.random() * 10) * 100,
    note: (4 + Math.random() * 0.9).toFixed(1)
  }
}

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

let rechercheJeton = 0

function rechercherLivreurs() {
  if (!adresseRecherche.value.trim()) return
  rechercheEnCours.value = true
  candidatsLivreurs.value = []
  const jeton = ++rechercheJeton
  setTimeout(() => {
    if (jeton !== rechercheJeton) return
    candidatsLivreurs.value = [genererLivreur(), genererLivreur(), genererLivreur()]
    rechercheEnCours.value = false
  }, 1200)
}

async function choisirLivreur(candidat) {
  try {
    await api.put(`/courses/${courseEnCours.value._id}/livraison`, {
      action: 'proposer',
      ...candidat,
      adresseLivraison: adresseRecherche.value
    })
    showRechercheForm.value = false
    candidatsLivreurs.value = []
    adresseRecherche.value = ''
    toast.success('Livreur proposé au client !')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la proposition du livreur')
  }
}

async function commanderLivraison() {
  try {
    await api.put(`/courses/${courseEnCours.value._id}/livraison`, { action: 'commander' })
    toast.success('Livreur commandé !')
  } catch (err) {
    toast.error('Erreur lors de la commande du livreur')
  }
}

async function terminerCourse() {
  if (livraisonData.value?.statut !== 'commandee') {
    toast.warning('Le livreur doit d\'abord être réservé')
    return
  }
  try {
    await api.put(`/courses/${courseEnCours.value._id}/statut`, { statut: 'livree' })
    toast.success('Livraison marquée comme terminée !')
    showTchat.value = false
    courseEnCours.value = null
    socket.off('nouveau_message')
    socket.off('livraison_maj')
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
.avatar-big { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.avatar-big img { width: 100%; height: 100%; object-fit: cover; }
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
.unites-bar.validation-attente {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff7e0, #fde9b8);
  border: 1px solid #fde68a;
  color: #92400e;
  box-shadow: 0 0 0 0 rgba(217,119,6,0.35);
  animation: pulseGlow 2.6s ease-in-out infinite;
}
.unites-bar.validation-attente .unites-sub { color: #92400e; opacity: 0.85; }
.icon-sablier { display: inline-block; animation: sablierTourne 2.4s ease-in-out infinite; }
.validation-shine {
  position: absolute;
  top: 0; left: -60%;
  width: 45%; height: 100%;
  background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
  animation: shineSweep 3.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.25); }
  50% { box-shadow: 0 0 0 6px rgba(217,119,6,0); }
}
@keyframes sablierTourne {
  0%, 15% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  85%, 100% { transform: rotate(180deg); }
}
@keyframes shineSweep {
  0% { left: -60%; }
  60%, 100% { left: 130%; }
}

.alerte-pop-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.alerte-pop-enter-from { opacity: 0; transform: translateY(-12px) scale(0.96); }
.alerte-pop-leave-active { transition: all 0.3s ease; }
.alerte-pop-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
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
.stat-card {
  background: white; border-radius: 14px; padding: 20px; text-align: center;
  border: 0.5px solid var(--bordure); box-shadow: var(--shadow);
  opacity: 0; transform: translateY(14px) scale(0.97);
  transition: opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}
.stat-card.visible { opacity: 1; transform: translateY(0) scale(1); }
.stat-card:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.08); transform: translateY(-3px); }
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
.btn-terminer:disabled { opacity: 0.4; cursor: not-allowed; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 24px; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
.card { background: white; border-radius: 14px; padding: 20px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.card-title { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 16px; }

/* TARIFS */
.tarifs-dash-card { margin-top: 20px; max-width: 420px; }
.tarifs-toggle {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--fond);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}
.tarifs-toggle button {
  position: relative;
  z-index: 1;
  background: none;
  border: none;
  padding: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--texte-sec);
  cursor: pointer;
  border-radius: 9px;
  transition: color 0.25s ease;
}
.tarifs-toggle button.active { color: var(--vert-dark); }
.toggle-thumb {
  position: absolute;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px);
  background: white;
  border-radius: 9px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toggle-thumb.premium { transform: translateX(100%); }
.tarif-prix { font-size: 26px; font-weight: 800; color: var(--vert-dark); margin: 0 0 16px; }
.tarif-prix span { font-size: 13px; font-weight: 600; color: var(--texte-sec); }
.tarif-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.tarif-features li { font-size: 13px; color: var(--texte); display: flex; align-items: center; gap: 8px; }
.tarif-swap-enter-active, .tarif-swap-leave-active { transition: all 0.25s ease; }
.tarif-swap-enter-from { opacity: 0; transform: translateX(8px); }
.tarif-swap-leave-to { opacity: 0; transform: translateX(-8px); }
.tarif-cta {
  position: relative; overflow: hidden;
  width: 100%; margin-top: 18px; padding: 12px;
  background: var(--vert); color: white; border: none;
  border-radius: var(--radius); font-size: 14px; font-weight: 700; cursor: pointer;
  transition: background 0.2s ease;
}
.tarif-cta:hover { background: var(--vert-dark); }

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
.profil-avatar-wrap { position: relative; width: 52px; height: 52px; border-radius: 50%; cursor: pointer; flex-shrink: 0; transition: transform 0.2s ease; }
.profil-avatar-wrap:hover { transform: scale(1.05); }
.profil-avatar-wrap:hover .profil-avatar-overlay { opacity: 1; }
.profil-avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; overflow: hidden; }
.profil-avatar img { width: 100%; height: 100%; object-fit: cover; }
.profil-avatar-overlay {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(0,0,0,0.45); color: white; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s ease;
}
.avatar-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ripple-effect {
  position: absolute; border-radius: 50%; pointer-events: none;
  background: rgba(255,255,255,0.55);
  transform: scale(0); animation: rippleAnim 0.55s ease-out;
}
@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }
.avatar-edit-badge {
  position: absolute; bottom: -2px; right: -2px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--vert); border: 2px solid white;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}
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
.yango-form { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; border-bottom: 0.5px solid var(--bordure); background: var(--vert-light); }
.yango-form input { padding: 8px 12px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 13px; }
.btn-envoyer-devis { background: var(--vert); color: white; border: none; padding: 10px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-envoyer-devis:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-fermer-recherche { background: none; border: none; color: var(--texte-sec); font-size: 12px; cursor: pointer; padding: 4px; text-align: center; text-decoration: underline; }
.livraison-etat { font-size: 12px; color: var(--texte-sec); font-weight: 600; padding: 6px 4px; }
.yango-recherche { border-bottom: 0.5px solid var(--bordure); }
.recherche-chargement { text-align: center; padding: 20px 16px; }
.spinner-sm { width: 26px; height: 26px; border: 3px solid var(--bordure); border-top-color: var(--vert); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.recherche-chargement p { font-size: 12px; color: var(--texte-sec); }
.candidats-livreurs { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; background: var(--vert-light); }
.candidat-livreur { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: white; border-radius: 10px; padding: 10px 12px; border: 1px solid var(--bordure); }
.candidat-nom { font-size: 13px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.candidat-note { font-weight: 500; color: var(--texte-sec); font-size: 12px; }
.candidat-detail { font-size: 11px; color: var(--texte-sec); margin: 0; }
.candidat-prix { text-align: right; flex-shrink: 0; }
.candidat-prix strong { display: block; font-size: 13px; color: var(--vert-dark); margin-bottom: 4px; }
.btn-choisir-livreur { background: var(--vert); color: white; border: none; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; }
.btn-relancer-recherche { background: none; border: none; color: var(--vert-dark); font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px; text-align: center; }
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
.tchat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 0.5px solid var(--bordure); align-items: center; background: white; }
.tchat-input input { flex: 1; padding: 10px 16px; border: 1px solid var(--bordure); border-radius: 24px; font-size: 13px; background: var(--fond); color: var(--texte); }
.tchat-input input:focus { border-color: var(--vert); outline: none; }
.btn-send { background: var(--vert); color: white; border: none; border-radius: 50%; width: 38px; height: 38px; font-size: 15px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
