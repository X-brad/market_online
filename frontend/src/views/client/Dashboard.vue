<template>
  <div class="dashboard">

    <!-- PROGRESSION -->
    <div class="progression-bar" v-if="etape > 0">
      <div class="container">
        <div class="steps-prog">
          <div
            v-for="(e, i) in etapes"
            :key="e.label"
            class="step-prog"
            :class="{ done: etape > i + 1, active: etape === i + 1 }"
          >
            <div class="step-prog-dot">
              <span v-if="etape > i + 1">✓</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span class="step-prog-label">{{ e.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container">

      <!-- HEADER -->
      <div class="dash-header">
        <div class="dash-header-left">
          <div class="avatar-big">{{ initiales }}</div>
          <div>
            <h1>Bonjour, {{ authStore.user?.prenom }} 👋</h1>
            <p>📍 {{ authStore.user?.commune }} · Client MamiMarché</p>
          </div>
        </div>
        <div class="dash-header-stats">
          <div class="hstat" v-for="s in headerStats" :key="s.label">
            <span class="hstat-val">{{ s.val }}</span>
            <span class="hstat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- PAGE D'ACCUEIL DASHBOARD (étape 0) -->
      <div v-if="etape === 0" class="accueil-dash">

        <!-- CARD NOUVELLE COMMANDE -->
        <div class="card nouvelle-commande-card" @click="etape = 1">
          <div class="nc-left">
            <span class="nc-icon">🛒</span>
            <div>
              <h2>Passer une commande</h2>
              <p>Trouvez une coursière et recevez votre marché à domicile</p>
            </div>
          </div>
          <span class="nc-arrow">→</span>
        </div>

        <!-- STATS RAPIDES -->
        <div class="stats-rapides">
          <div class="stat-rapide" v-for="s in statsRapides" :key="s.label">
            <span class="sr-icon">{{ s.icon }}</span>
            <p class="sr-val">{{ s.val }}</p>
            <p class="sr-label">{{ s.label }}</p>
          </div>
        </div>

        <!-- MARCHÉS RAPIDES -->
        <div class="card">
          <h3>🏪 Marchés disponibles</h3>
          <div class="marches-rapides">
            <div
              v-for="m in marches"
              :key="m.nom"
              class="marche-rapide"
              @click="lancerCommande(m.nom)"
            >
              <span>{{ m.icon }}</span>
              <p>{{ m.nom }}</p>
              <span class="marche-commune-badge">{{ m.commune }}</span>
            </div>
          </div>
        </div>

        <!-- HISTORIQUE RÉCENT -->
        <div class="card">
          <div class="card-header-row">
            <h3>📋 Historique récent</h3>
            <RouterLink to="/profil" class="voir-tout">Voir tout →</RouterLink>
          </div>
          <div class="empty-histo" v-if="historiqueCommandes.length === 0">
  <span>🛒</span>
  <p>Aucune commande pour l'instant</p>
  <button class="btn-commander" @click="etape = 1">Passer ma première commande →</button>
</div>
<div class="histo-list" v-else>
  <div class="histo-item" v-for="h in historiqueCommandes.slice(0, 5)" :key="h._id">
    <div class="histo-left">
      <div class="histo-dot" :class="h.statut === 'livree' ? 'complete' : 'encours'"></div>
      <div>
        <p>{{ h.marche }}</p>
        <span>{{ new Date(h.createdAt).toLocaleDateString('fr-FR') }}</span>
      </div>
    </div>
    <div class="histo-right">
      <strong>{{ h.totalPaye || '—' }} F</strong>
      <span :class="h.statut === 'livree' ? 'complete' : 'encours'">
        {{ h.statut === 'livree' ? '✓ Livré' : h.statut === 'en_cours' ? '⏳ En cours' : '📋 En attente' }}
      </span>
    </div>
  </div>
</div>
        </div>

      </div>

      <!-- ÉTAPE 1 : LISTE + MARCHÉ -->
      <div v-if="etape === 1">
        <div class="section-title">
          <span class="step-tag">Étape 1</span>
          <h2>Votre liste de courses</h2>
          <p>Décrivez ce dont vous avez besoin et choisissez votre marché</p>
        </div>
        <div class="two-col">
          <div class="card liste-card">
            <h3>📝 Ma liste</h3>
            <textarea
              v-model="liste"
              placeholder="Ex : 1 kg de tomates, 2 ignames, poisson maquereau 500g, gombos, oignons..."
              rows="6"
            ></textarea>
            <div class="liste-tips">
              <span>💡 Soyez précis sur les quantités pour un meilleur service</span>
            </div>
          </div>
          <div class="card marche-card-dash">
            <h3>🏪 Choisir le marché</h3>
            <div class="marches-list">
              <div
                v-for="m in marches"
                :key="m.nom"
                class="marche-item"
                :class="{ active: marcheChoisi === m.nom }"
                @click="marcheChoisi = m.nom"
              >
                <span class="marche-item-icon">{{ m.icon }}</span>
                <div>
                  <p class="marche-item-nom">{{ m.nom }}</p>
                  <p class="marche-item-commune">📍 {{ m.commune }}</p>
                </div>
                <span class="marche-check" v-if="marcheChoisi === m.nom">✓</span>
              </div>
            </div>
          </div>
        </div>
        <div class="action-row">
         <button class="btn-next" :disabled="!liste.trim() || !marcheChoisi" @click="etape = 2; chargerCoursieres()">
            Rechercher une coursière →
      </button>
        </div>
      </div>

 <!-- ÉTAPE 2 : CHOISIR UNE COURSIÈRE -->
<div v-if="etape === 2">
  <div class="section-title">
    <span class="step-tag">Étape 2</span>
    <h2>Choisissez votre coursière</h2>
    <p>Coursières disponibles au <strong>{{ marcheChoisi }}</strong></p>
  </div>

  <!-- CHARGEMENT -->
  <div class="chargement" v-if="chargementCoursieres">
    <div class="spinner"></div>
    <p>Recherche de coursières disponibles...</p>
  </div>

  <!-- AUCUNE COURSIÈRE -->
  <div class="empty-coursieres" v-else-if="coursieres.length === 0">
    <span>👩🏾</span>
    <p>Aucune coursière disponible pour l'instant</p>
    <button class="btn-back" @click="etape = 1">← Retour</button>
  </div>

  <!-- LISTE COURSIÈRES -->
  <div v-else>
    <div class="coursieres-grid">
      <div
        v-for="c in coursieres"
        :key="c._id"
        class="coursiere-card"
        :class="{ selected: coursiereChos?._id === c._id, occupee: c.statut === 'occupee' }"
        @click="c.statut !== 'occupee' && (coursiereChos = c)"
      >
        <div class="coursiere-top">
          <div class="coursiere-avatar">{{ c.initiales }}</div>
          <div class="coursiere-info">
            <p class="coursiere-nom">{{ c.nom }}</p>
            <p class="coursiere-detail">{{ c.marche }} · {{ c.type }}</p>
          </div>
          <span class="statut-badge" :class="c.statut">
            {{ c.statut === 'disponible' ? 'Dispo' : 'Occupée' }}
          </span>
        </div>
        <div class="coursiere-stats">
          <span>⭐ {{ c.note }}</span>
          <span>🛒 {{ c.courses }} courses</span>
          <span>📍 {{ c.distance }}</span>
        </div>
        <div class="coursiere-footer" v-if="coursiereChos?._id === c._id">
          <span class="selected-label">✓ Sélectionnée</span>
        </div>
      </div>
    </div>
    <div class="action-row">
      <button class="btn-back" @click="etape = 1">← Retour</button>
      <button class="btn-next" :disabled="!coursiereChos" @click="ouvrirTchat">
        Contacter {{ coursiereChos?.nom?.split(' ')[0] }} →
      </button>
    </div>
  </div>
</div>

      <!-- ÉTAPE 3 : TCHAT -->
      <div v-if="etape === 3" class="tchat-page">
        <div class="section-title">
          <span class="step-tag">Étape 3</span>
          <h2>Discussion avec {{ coursiereChos?.nom }}</h2>
          <p>Partagez votre liste, convenez des frais avant de payer</p>
        </div>
        <div class="tchat-layout">
          <div class="tchat-main">
            <div class="card tchat-card">
              <div class="tchat-header">
                <div class="coursiere-avatar sm">{{ coursiereChos?.initiales }}</div>
                <div class="tchat-header-info">
                  <p class="tchat-nom">{{ coursiereChos?.nom }}</p>
                  <p class="tchat-statut"><span class="dot-green"></span> En ligne · {{ coursiereChos?.marche }}</p>
                </div>
                <div class="tchat-header-right">
                  <span class="tchat-note">⭐ {{ coursiereChos?.note }}</span>
                  <span class="tchat-type-badge" :class="coursiereChos?.type?.toLowerCase()">{{ coursiereChos?.type }}</span>
                </div>
              </div>
              <div class="quick-actions">
                <button class="quick-btn" @click="envoyerListe">📋 Envoyer ma liste</button>
                <button class="quick-btn" @click="demanderDevis">💰 Demander un devis</button>
                <button class="quick-btn" @click="confirmerAccord" v-if="devisRecu">✅ Confirmer l'accord</button>
              </div>
              <div class="tchat-messages" ref="messagesEl">
                <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.from">
                  <div v-if="msg.type === 'liste'" class="bubble liste-bubble">
                    <div class="liste-bubble-header">📋 Liste de courses</div>
                    <div class="liste-bubble-content">{{ msg.text }}</div>
                    <div class="liste-bubble-footer">{{ msg.marche }}</div>
                  </div>
                  <div v-else-if="msg.type === 'devis'" class="bubble devis-bubble">
                    <div class="devis-bubble-header">💰 Proposition de devis</div>
                    <div class="devis-line"><span>Frais prestation</span><strong>{{ msg.devis.prestation }} F</strong></div>
                    <div class="devis-line"><span>Frais livraison</span><strong>{{ msg.devis.livraison }} F</strong></div>
                    <div class="devis-total"><span>Total frais</span><strong>{{ msg.devis.prestation + msg.devis.livraison }} F</strong></div>
                    <div class="devis-actions" v-if="msg.from === 'coursiere' && !devisAccepte">
                      <button class="btn-refuser-devis" @click="refuserDevis">Refuser</button>
                      <button class="btn-accepter-devis" @click="accepterDevis(msg.devis)">Accepter ✓</button>
                    </div>
                    <div class="devis-accepte" v-if="devisAccepte && msg.from === 'coursiere'">✓ Devis accepté</div>
                  </div>
                  <div v-else class="bubble">{{ msg.text }}</div>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
                <div class="message coursiere typing-indicator" v-if="enTrainDEcrire">
                  <div class="bubble typing"><span></span><span></span><span></span></div>
                </div>
              </div>
              <div class="tchat-input">
                <input v-model="nouveauMsg" placeholder="Écrire un message..." @keyup.enter="envoyerMessage" :disabled="devisAccepte" />
                <button class="btn-send" @click="envoyerMessage" :disabled="!nouveauMsg.trim() || devisAccepte"><span>➤</span></button>
              </div>
              <div class="tchat-locked" v-if="devisAccepte">✅ Accord confirmé — vous pouvez procéder au paiement</div>
            </div>
          </div>
          <div class="tchat-sidebar">
            <div class="card recap-card">
              <h3>📋 Récapitulatif</h3>
              <div class="recap-section">
                <div class="recap-item"><span>Marché</span><strong>{{ marcheChoisi }}</strong></div>
                <div class="recap-item"><span>Coursière</span><strong>{{ coursiereChos?.nom }}</strong></div>
              </div>
              <div class="recap-divider"></div>
              <div class="recap-section">
                <p class="recap-section-title">Montants convenus</p>
                <div class="recap-item"><span>Budget courses</span><strong :class="{ 'val-pending': !budgetCourses }">{{ budgetCourses ? budgetCourses + ' F' : 'À définir' }}</strong></div>
                <div class="recap-item"><span>Frais prestation</span><strong :class="{ 'val-pending': !fraisPrestation }">{{ fraisPrestation ? fraisPrestation + ' F' : 'En discussion' }}</strong></div>
                <div class="recap-item"><span>Frais livraison</span><strong :class="{ 'val-pending': !fraisLivraison }">{{ fraisLivraison ? fraisLivraison + ' F' : 'En discussion' }}</strong></div>
                <div class="recap-item"><span>Frais service</span><strong class="val-fixed">200 F</strong></div>
              </div>
              <div class="recap-divider"></div>
              <div class="recap-total"><span>Total estimé</span><strong>{{ totalEstime }} F CFA</strong></div>
              <div class="budget-section" v-if="!devisAccepte">
                <p class="recap-section-title">Votre budget courses</p>
                <input v-model.number="budgetCourses" type="number" placeholder="Montant en F CFA" class="budget-input" />
              </div>
              <button class="btn-next" style="width:100%;margin-top:16px" :disabled="!devisAccepte || !budgetCourses" @click="etape = 4">
                {{ devisAccepte ? 'Procéder au paiement →' : 'En attente d\'accord...' }}
              </button>
            </div>
          </div>
        </div>
        <div class="action-row">
          <button class="btn-back" @click="etape = 2">← Changer de coursière</button>
        </div>
      </div>

      <!-- ÉTAPE 4 : PAIEMENT -->
      <div v-if="etape === 4">
        <div class="section-title">
          <span class="step-tag">Étape 4</span>
          <h2>Paiement de la commande</h2>
          <p>Envoyez le montant via Wave — vos fonds sont sécurisés</p>
        </div>
        <div class="paiement-wrap">
          <div class="card paiement-card">
            <div class="paiement-icon">💳</div>
            <h3>Récapitulatif de paiement</h3>
            <div class="paiement-details">
              <div class="recap-item"><span>Budget courses</span><strong>{{ budgetCourses }} F CFA</strong></div>
              <div class="recap-item"><span>Frais prestation coursière</span><strong>{{ fraisPrestation }} F CFA</strong></div>
              <div class="recap-item"><span>Frais de livraison</span><strong>{{ fraisLivraison }} F CFA</strong></div>
              <div class="recap-item"><span>Frais de service MamiMarché</span><strong>200 F CFA</strong></div>
              <div class="recap-divider"></div>
              <div class="recap-total big"><span>Total à payer</span><strong>{{ totalEstime }} F CFA</strong></div>
            </div>
            <div class="paiement-info">
              <span>🔒</span>
              <p>Votre paiement transite par la plateforme MamiMarché. Les fonds sont reversés à la coursière après confirmation de votre livraison.</p>
            </div>
            <button class="btn-wave" @click="payerWave">🌊 Payer {{ totalEstime }} F via Wave</button>
            <button class="btn-back" style="width:100%;margin-top:10px" @click="etape = 3">← Retour au tchat</button>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 5 : CONFIRMATION -->
      <div v-if="etape === 5" class="confirmation">
        <div class="confirm-icon">🎉</div>
        <h2>Commande confirmée !</h2>
        <p>Votre paiement a été reçu. <strong>{{ coursiereChos?.nom }}</strong> a été notifiée et va effectuer vos courses au <strong>{{ marcheChoisi }}</strong>.</p>
        <div class="confirm-steps">
          <div class="confirm-step done">✓ Paiement reçu</div>
          <div class="confirm-step done">✓ Coursière notifiée</div>
          <div class="confirm-step pending">⏳ Courses en cours...</div>
          <div class="confirm-step pending">🏠 Livraison à domicile</div>
        </div>
        <button class="btn-next" @click="nouvelleCommande">Passer une nouvelle commande</button>
      </div>

    </div>
  </div>
</template>
<script setup>
import api from '../../api/axios.js'
import socket from '../../api/socket.js'
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'

const authStore = useAuthStore()
const toast = useToastStore()
const etape = ref(0)
const liste = ref('')
const marcheChoisi = ref('')
const coursiereChos = ref(null)
const nouveauMsg = ref('')
const messagesEl = ref(null)
const budgetCourses = ref(null)
const fraisPrestation = ref(null)
const fraisLivraison = ref(null)
const enTrainDEcrire = ref(false)
const devisRecu = ref(false)
const devisAccepte = ref(false)
const courseId = ref(null)
const historiqueCommandes = ref([])

async function chargerHistorique() {
  try {
    const res = await api.get('/courses/mes-courses')
    historiqueCommandes.value = res.data.courses
    headerStats.value[0].val = String(res.data.courses.length)
    headerStats.value[1].val = String(res.data.courses.filter(c => c.statut === 'en_cours').length)
  } catch (err) {
    console.error('Erreur historique:', err)
  }
}

onMounted(() => {
  chargerHistorique()
})

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')
})

const totalEstime = computed(() => {
  return (budgetCourses.value || 0) + (fraisPrestation.value || 0) + (fraisLivraison.value || 0) + 200
})

const headerStats = ref([
  { val: '0', label: 'Commandes' },
  { val: '0', label: 'En cours' },
  { val: '—', label: 'Note donnée' }
])

const statsRapides = [
  { icon: '🛒', val: '0', label: 'Commandes passées' },
  { icon: '✅', val: '0', label: 'Livrées' },
  { icon: '⭐', val: '—', label: 'Note moyenne' },
  { icon: '💰', val: '0 F', label: 'Total dépensé' }
]

const etapes = [
  { label: 'Ma liste' },
  { label: 'Coursière' },
  { label: 'Tchat' },
  { label: 'Paiement' }
]

const marches = [
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🏪' },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🛒' },
  { nom: "Marché d'Adjamé", commune: 'Adjamé', icon: '🏪' },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒' },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪' },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒' }
]

const coursieres = ref([])
const chargementCoursieres = ref(false)
async function chargerCoursieres() {
  if (chargementCoursieres.value) return
  coursieres.value = []
  chargementCoursieres.value = true
  try {
    const res = await api.get('/coursiere/disponibles')
    coursieres.value = res.data.coursieres
    if (coursieres.value.length === 0) {
      toast.warning('Aucune coursière disponible pour l\'instant')
    } else {
      toast.info(`${coursieres.value.length} coursière(s) disponible(s)`)
    }
  } catch (err) {
    toast.error('Erreur lors du chargement des coursières')
  } finally {
    chargementCoursieres.value = false
  }
}
const messages = ref([])

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function simulerReponse(text, delay = 1500, type = 'normal', extra = {}) {
  enTrainDEcrire.value = true
  setTimeout(() => {
    enTrainDEcrire.value = false
    messages.value.push({ from: 'coursiere', text, time: getTime(), type, ...extra })
    scrollBottom()
  }, delay)
}

function lancerCommande(nomMarche) {
  marcheChoisi.value = nomMarche
  etape.value = 1
}

async function ouvrirTchat() {
  try {
    const res = await api.post('/courses', {
      marche: marcheChoisi.value,
      commune: authStore.user?.commune,
      liste: liste.value,
      mode: 'standard'
    })
    courseId.value = res.data.course._id

    socket.connect()
    socket.emit('rejoindre_course', courseId.value)
    socket.on('nouveau_message', (msg) => {
      messages.value.push(msg)
      scrollBottom()
    })

    etape.value = 3
    messages.value = []
    devisRecu.value = false
    devisAccepte.value = false

    setTimeout(() => {
      messages.value.push({
        from: 'coursiere',
        text: `Bonjour ! Je suis ${coursiereChos.value?.nom}, coursière au ${coursiereChos.value?.marche} 😊 Je suis disponible pour vos courses. Envoyez-moi votre liste !`,
        time: getTime(),
        type: 'normal'
      })
      scrollBottom()
    }, 500)

    toast.success('Coursière contactée avec succès !')
  } catch (err) {
    toast.error('Erreur lors de la création de la course')
    console.error(err)
  }
}

function envoyerMessage() {
  if (!nouveauMsg.value.trim() || devisAccepte.value) return
  messages.value.push({ from: 'client', text: nouveauMsg.value, time: getTime(), type: 'normal' })
  const msg = nouveauMsg.value.toLowerCase()
  nouveauMsg.value = ''
  scrollBottom()
  if (msg.includes('merci') || msg.includes('ok') || msg.includes('d\'accord')) {
    simulerReponse('Parfait ! N\'hésitez pas à m\'envoyer votre liste de courses 📋', 1200)
  } else if (msg.includes('bonjour') || msg.includes('bonsoir') || msg.includes('salut')) {
    simulerReponse('Bonjour ! Comment puis-je vous aider aujourd\'hui ? 😊', 1000)
  } else {
    simulerReponse('D\'accord, je prends note. Avez-vous d\'autres précisions à ajouter ?', 1800)
  }
}

function envoyerListe() {
  if (!liste.value.trim()) return
  messages.value.push({ from: 'client', text: liste.value, time: getTime(), type: 'liste', marche: marcheChoisi.value })
  scrollBottom()
  simulerReponse('J\'ai bien reçu votre liste 👍 Je vais vérifier la disponibilité des produits et vous proposer un devis rapidement.', 2000)
  setTimeout(() => {
    simulerReponse('', 4000, 'devis', { devis: { prestation: 1000, livraison: 800 } })
    devisRecu.value = true
  }, 2000)
}

function demanderDevis() {
  messages.value.push({ from: 'client', text: 'Pouvez-vous me proposer un devis pour vos frais ?', time: getTime(), type: 'normal' })
  scrollBottom()
  simulerReponse('Bien sûr ! Voici ma proposition :', 1500)
  setTimeout(() => {
    simulerReponse('', 3000, 'devis', { devis: { prestation: 1000, livraison: 800 } })
    devisRecu.value = true
  }, 1500)
}

function accepterDevis(devis) {
  fraisPrestation.value = devis.prestation
  fraisLivraison.value = devis.livraison
  devisAccepte.value = true
  messages.value.push({ from: 'client', text: '✅ J\'accepte votre devis. Je vais procéder au paiement.', time: getTime(), type: 'normal' })
  scrollBottom()
  simulerReponse('Parfait ! Merci pour votre confiance 🙏 Je serai prête dès réception de votre paiement.', 1500)
  toast.success('Devis accepté ! Procédez au paiement.')
}

function refuserDevis() {
  messages.value.push({ from: 'client', text: 'Je souhaite négocier les frais, pouvez-vous revoir votre proposition ?', time: getTime(), type: 'normal' })
  scrollBottom()
  simulerReponse('Je comprends. Quel montant vous conviendrait mieux ?', 1500)
}

function confirmerAccord() {
  etape.value = 4
}

async function payerWave() {
  try {
    await api.post('/transactions', {
      courseId: courseId.value,
      methodePaiement: 'wave',
      montantTotal: totalEstime.value
    })
    etape.value = 5
    headerStats.value[0].val = String(parseInt(headerStats.value[0].val) + 1)
    toast.success('Paiement effectué avec succès ! 🎉')
    socket.disconnect()
  } catch (err) {
    toast.error('Erreur lors du paiement')
    console.error(err)
  }
}
function nouvelleCommande() {
  etape.value = 0
  liste.value = ''
  marcheChoisi.value = ''
  coursiereChos.value = null
  budgetCourses.value = null
  fraisPrestation.value = null
  fraisLivraison.value = null
  messages.value = []
  devisRecu.value = false
  devisAccepte.value = false
  courseId.value = null
}
</script>

<style scoped>

/* CHARGEMENT */
.chargement { text-align: center; padding: 48px; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--bordure); border-top-color: var(--vert); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.chargement p { font-size: 14px; color: var(--texte-sec); }
.empty-coursieres { text-align: center; padding: 48px; }
.empty-coursieres span { font-size: 48px; display: block; margin-bottom: 12px; }
.empty-coursieres p { font-size: 15px; color: var(--texte-sec); margin-bottom: 20px; }


.dashboard { padding: 0 0 60px; background: var(--fond); min-height: 100vh; }

/* PROGRESSION */
.progression-bar { background: white; border-bottom: 0.5px solid var(--bordure); padding: 16px 0; }
.steps-prog { display: flex; align-items: center; }
.step-prog { display: flex; align-items: center; gap: 8px; flex: 1; position: relative; }
.step-prog:not(:last-child)::after { content: ''; flex: 1; height: 2px; background: var(--bordure); margin: 0 8px; }
.step-prog.done::after { background: var(--vert); }
.step-prog-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--bordure); color: var(--texte-sec); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: all 0.3s; }
.step-prog.done .step-prog-dot { background: var(--vert); color: white; }
.step-prog.active .step-prog-dot { background: var(--vert-dark); color: white; box-shadow: 0 0 0 3px rgba(29,158,117,0.2); }
.step-prog-label { font-size: 12px; color: var(--texte-sec); white-space: nowrap; }
.step-prog.active .step-prog-label { color: var(--vert-dark); font-weight: 600; }
.step-prog.done .step-prog-label { color: var(--vert); }

/* HEADER */
.dash-header { display: flex; align-items: center; justify-content: space-between; padding: 32px 0 24px; flex-wrap: wrap; gap: 20px; }
.dash-header-left { display: flex; align-items: center; gap: 16px; }
.avatar-big { width: 52px; height: 52px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
.dash-header-left h1 { font-size: 22px; font-weight: 800; color: var(--texte); margin: 0 0 4px; }
.dash-header-left p { font-size: 13px; color: var(--texte-sec); margin: 0; }
.dash-header-stats { display: flex; gap: 24px; }
.hstat { display: flex; flex-direction: column; align-items: center; }
.hstat-val { font-size: 20px; font-weight: 800; color: var(--vert-dark); }
.hstat-label { font-size: 11px; color: var(--texte-sec); }

/* ACCUEIL DASHBOARD */
.accueil-dash { display: flex; flex-direction: column; gap: 20px; }
.nouvelle-commande-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px;
  background: linear-gradient(135deg, var(--vert-dark), var(--vert));
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}
.nouvelle-commande-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(29,158,117,0.3); }
.nc-left { display: flex; align-items: center; gap: 16px; }
.nc-icon { font-size: 40px; }
.nc-left h2 { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
.nc-left p { font-size: 14px; opacity: 0.85; margin: 0; }
.nc-arrow { font-size: 28px; opacity: 0.8; }

/* STATS RAPIDES */
.stats-rapides { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; }
.stat-rapide { background: white; border-radius: 14px; padding: 20px; text-align: center; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.sr-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.sr-val { font-size: 22px; font-weight: 800; color: var(--vert-dark); margin: 0 0 4px; }
.sr-label { font-size: 12px; color: var(--texte-sec); margin: 0; }

/* MARCHÉS RAPIDES */
.card h3 { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 16px; }
.card { background: white; border-radius: 14px; padding: 20px; border: 0.5px solid var(--bordure); box-shadow: var(--shadow); }
.marches-rapides { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.marche-rapide {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px;
  border-radius: 10px;
  border: 1.5px solid var(--bordure);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.marche-rapide:hover { border-color: var(--vert); background: var(--vert-light); transform: translateY(-2px); }
.marche-rapide span:first-child { font-size: 24px; }
.marche-rapide p { font-size: 12px; font-weight: 600; color: var(--texte); margin: 0; }
.marche-commune-badge { font-size: 11px; color: var(--texte-sec); }

/* CARD HEADER ROW */
.card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header-row h3 { margin: 0; }
.voir-tout { font-size: 13px; color: var(--vert); font-weight: 600; text-decoration: none; }

/* EMPTY HISTO */
.empty-histo { text-align: center; padding: 24px; }
.empty-histo span { font-size: 36px; display: block; margin-bottom: 8px; }
.empty-histo p { font-size: 14px; color: var(--texte-sec); margin-bottom: 16px; }
.btn-commander { background: var(--vert); color: white; padding: 10px 20px; border-radius: var(--radius); border: none; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-commander:hover { background: var(--vert-dark); }

/* SECTION TITLE */
.section-title { margin-bottom: 24px; padding-top: 28px; }
.step-tag { display: inline-block; background: var(--vert-light); color: var(--vert-dark); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.section-title h2 { font-size: 22px; font-weight: 800; color: var(--texte); margin: 0 0 4px; }
.section-title p { font-size: 14px; color: var(--texte-sec); margin: 0; }

/* TWO COL */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }

/* LISTE */
.liste-card h3, .marche-card-dash h3 { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 14px; }
.liste-card textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--bordure); border-radius: var(--radius); padding: 12px; font-size: 14px; font-family: inherit; resize: none; transition: border 0.2s; color: var(--texte); }
.liste-card textarea:focus { border-color: var(--vert); outline: none; }
.liste-tips { margin-top: 10px; background: var(--vert-light); border-radius: 8px; padding: 10px 12px; font-size: 12px; color: var(--vert-dark); }

/* MARCHÉS */
.marches-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
.marche-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.5px solid var(--bordure); cursor: pointer; transition: all 0.2s; background: var(--fond); }
.marche-item:hover { border-color: var(--vert); }
.marche-item.active { border-color: var(--vert); background: var(--vert-light); }
.marche-item-icon { font-size: 20px; }
.marche-item-nom { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.marche-item-commune { font-size: 11px; color: var(--texte-sec); margin: 0; }
.marche-check { margin-left: auto; color: var(--vert); font-weight: 700; font-size: 16px; }

/* COURSIÈRES */
.coursieres-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 20px; }
.coursiere-card { background: white; border-radius: 14px; padding: 18px; border: 1.5px solid var(--bordure); cursor: pointer; transition: all 0.2s; }
.coursiere-card:hover:not(.occupee) { border-color: var(--vert); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(29,158,117,0.1); }
.coursiere-card.selected { border-color: var(--vert); background: var(--vert-light); }
.coursiere-card.occupee { opacity: 0.5; cursor: not-allowed; }
.coursiere-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.coursiere-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.coursiere-avatar.sm { width: 36px; height: 36px; font-size: 13px; }
.coursiere-nom { font-size: 14px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.coursiere-detail { font-size: 12px; color: var(--texte-sec); margin: 0; }
.statut-badge { margin-left: auto; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.statut-badge.disponible { background: #dcfce7; color: #166534; }
.statut-badge.occupee { background: #fef2f2; color: #dc2626; }
.coursiere-stats { display: flex; gap: 10px; font-size: 12px; color: var(--texte-sec); flex-wrap: wrap; }
.coursiere-footer { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--bordure); }
.selected-label { font-size: 13px; font-weight: 700; color: var(--vert); }

/* TCHAT LAYOUT */
.tchat-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 16px; }
@media (max-width: 900px) { .tchat-layout { grid-template-columns: 1fr; } }
.tchat-card { display: flex; flex-direction: column; height: 560px; padding: 0; overflow: hidden; border-radius: 16px; }
.tchat-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 0.5px solid var(--bordure); background: white; }
.tchat-header-info { flex: 1; }
.tchat-nom { font-size: 15px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.tchat-statut { font-size: 12px; color: var(--texte-sec); margin: 0; display: flex; align-items: center; gap: 5px; }
.dot-green { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; display: inline-block; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.5} }
.tchat-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.tchat-note { font-size: 13px; font-weight: 600; color: var(--texte); }
.tchat-type-badge { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.tchat-type-badge.premium { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }
.tchat-type-badge.standard { background: var(--vert-light); color: var(--vert-dark); }
.quick-actions { display: flex; gap: 8px; padding: 10px 16px; border-bottom: 0.5px solid var(--bordure); flex-wrap: wrap; background: var(--fond); }
.quick-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--bordure); background: white; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--texte); transition: all 0.2s; }
.quick-btn:hover { border-color: var(--vert); color: var(--vert); background: var(--vert-light); }
.tchat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; background: #f8faf9; }
.message { display: flex; flex-direction: column; }
.message.client { align-items: flex-end; }
.message.coursiere { align-items: flex-start; }
.bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
.message.client .bubble { background: var(--vert); color: white; border-bottom-right-radius: 4px; }
.message.coursiere .bubble { background: white; color: var(--texte); border: 0.5px solid var(--bordure); border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.msg-time { font-size: 10px; color: var(--texte-sec); margin-top: 4px; padding: 0 4px; }
.liste-bubble { background: white !important; border: 1.5px solid var(--vert) !important; padding: 0 !important; overflow: hidden; min-width: 220px; }
.liste-bubble-header { background: var(--vert); color: white; padding: 8px 14px; font-size: 12px; font-weight: 700; }
.liste-bubble-content { padding: 10px 14px; font-size: 13px; color: var(--texte); white-space: pre-wrap; line-height: 1.6; }
.liste-bubble-footer { padding: 6px 14px 10px; font-size: 11px; color: var(--texte-sec); }
.devis-bubble { background: white !important; border: 1.5px solid #f59e0b !important; padding: 0 !important; overflow: hidden; min-width: 240px; }
.devis-bubble-header { background: #f59e0b; color: white; padding: 8px 14px; font-size: 12px; font-weight: 700; }
.devis-line { display: flex; justify-content: space-between; padding: 8px 14px 0; font-size: 13px; color: var(--texte-sec); }
.devis-line strong { color: var(--texte); }
.devis-total { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 14px; font-weight: 700; color: var(--texte); border-top: 0.5px solid var(--bordure); margin-top: 6px; }
.devis-actions { display: flex; gap: 8px; padding: 10px 14px; border-top: 0.5px solid var(--bordure); }
.btn-refuser-devis { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--bordure); background: white; font-size: 12px; cursor: pointer; color: var(--texte-sec); }
.btn-accepter-devis { flex: 2; padding: 8px; border-radius: 8px; border: none; background: var(--vert); color: white; font-size: 12px; font-weight: 700; cursor: pointer; }
.devis-accepte { padding: 8px 14px 10px; font-size: 12px; color: var(--vert); font-weight: 600; }
.typing { display: flex; gap: 4px; align-items: center; padding: 12px 16px !important; }
.typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--texte-sec); animation: typing 1.2s infinite; display: inline-block; }
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-6px);opacity:1} }
.tchat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 0.5px solid var(--bordure); align-items: center; background: white; }
.tchat-input input { flex: 1; padding: 10px 16px; border: 1px solid var(--bordure); border-radius: 24px; font-size: 13px; background: var(--fond); color: var(--texte); transition: border 0.2s; }
.tchat-input input:focus { border-color: var(--vert); outline: none; }
.tchat-input input:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-send { background: var(--vert); color: white; border: none; border-radius: 50%; width: 38px; height: 38px; font-size: 15px; cursor: pointer; flex-shrink: 0; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
.btn-send:hover:not(:disabled) { background: var(--vert-dark); }
.btn-send:disabled { opacity: 0.4; cursor: not-allowed; }
.tchat-locked { padding: 10px 16px; text-align: center; font-size: 13px; color: var(--vert); font-weight: 600; background: var(--vert-light); }
.tchat-sidebar { }
.recap-card { height: fit-content; position: sticky; top: 80px; }
.recap-card h3 { font-size: 15px; font-weight: 700; color: var(--texte); margin: 0 0 16px; }
.recap-section { display: flex; flex-direction: column; gap: 0; }
.recap-section-title { font-size: 11px; font-weight: 700; color: var(--texte-sec); text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 8px; }
.recap-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid var(--bordure); font-size: 13px; }
.recap-item span { color: var(--texte-sec); }
.recap-item strong { color: var(--texte); font-size: 13px; }
.val-pending { color: var(--texte-sec) !important; font-style: italic; }
.val-fixed { color: var(--vert-dark) !important; }
.recap-divider { height: 1px; background: var(--bordure); margin: 8px 0; }
.recap-total { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 14px; font-weight: 700; }
.recap-total strong { color: var(--vert-dark); font-size: 18px; }
.budget-section { margin-top: 8px; }
.budget-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 13px; margin-top: 6px; color: var(--texte); }
.budget-input:focus { border-color: var(--vert); outline: none; }

/* PAIEMENT */
.paiement-wrap { max-width: 480px; margin: 0 auto; }
.paiement-card { text-align: center; }
.paiement-icon { font-size: 48px; margin-bottom: 16px; display: block; }
.paiement-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 20px; }
.paiement-details { text-align: left; margin-bottom: 20px; }
.paiement-info { display: flex; gap: 10px; background: var(--vert-light); border-radius: 10px; padding: 12px; margin-bottom: 20px; text-align: left; }
.paiement-info p { font-size: 12px; color: var(--vert-dark); margin: 0; line-height: 1.5; }
.btn-wave { width: 100%; padding: 16px; background: #1d4ed8; color: white; border: none; border-radius: var(--radius); font-size: 16px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
.btn-wave:hover { background: #1e40af; transform: translateY(-1px); }

/* CONFIRMATION */
.confirmation { text-align: center; padding: 60px 20px; }
.confirm-icon { font-size: 64px; margin-bottom: 20px; display: block; animation: bounce 0.6s ease; }
@keyframes bounce { 0%{transform:scale(0)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
.confirmation h2 { font-size: 28px; font-weight: 800; color: var(--vert-dark); margin-bottom: 12px; }
.confirmation p { font-size: 16px; color: var(--texte-sec); margin-bottom: 32px; max-width: 480px; margin-left: auto; margin-right: auto; }
.confirm-steps { display: flex; flex-direction: column; gap: 10px; max-width: 320px; margin: 0 auto 32px; }
.confirm-step { padding: 12px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; }
.confirm-step.done { background: var(--vert-light); color: var(--vert-dark); }
.confirm-step.pending { background: var(--fond); color: var(--texte-sec); border: 0.5px solid var(--bordure); }

/* ACTIONS */
.action-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-bottom: 20px; }
.btn-next { background: var(--vert); color: white; padding: 14px 28px; border-radius: var(--radius); font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
.btn-next:hover:not(:disabled) { background: var(--vert-dark); transform: translateY(-1px); }
.btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-back { background: white; color: var(--texte-sec); padding: 14px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 600; border: 1px solid var(--bordure); cursor: pointer; transition: all 0.2s; }
.btn-back:hover { border-color: var(--vert); color: var(--vert); }
.recap-total.big { font-size: 18px; }
.recap-total.big strong { font-size: 22px; }
</style>