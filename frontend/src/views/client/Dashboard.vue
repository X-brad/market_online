<template>
  <div class="dashboard">

    <!-- PROGRESSION -->
    <div class="progression-bar" v-if="etape > 0 && etape !== 0.5">
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
        <div class="card nouvelle-commande-card" @click="etape = 0.5">
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
              @click="lancerCommande(m)"
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
            <button class="btn-commander" @click="etape = 0.5">Passer ma première commande →</button>
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
                <button class="btn-signaler" v-if="h.statut === 'livree'" @click="ouvrirLitige(h)">⚠️ Signaler</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- CHOIX COMMUNE / PREMIUM -->
      <div v-if="etape === 0.5" class="choix-commune-wrap">
        <div class="section-title">
          <h2>Où voulez-vous que vos courses soient faites ?</h2>
        </div>
        <div class="card choix-commune-card" v-if="!afficherChoixAutreCommune">
          <p>Voulez-vous que votre course soit faite dans votre commune, <strong>{{ authStore.user?.commune }}</strong> ?</p>
          <div class="choix-commune-btns">
            <button class="btn-next" @click="choisirPropreCommune">Oui, ma commune</button>
            <button class="btn-back" @click="afficherChoixAutreCommune = true">Non, une autre commune</button>
          </div>
        </div>

        <div class="card choix-commune-card" v-else>
          <template v-if="authStore.user?.premium?.actif">
            <p>Choisissez la commune où vous voulez que votre course soit effectuée :</p>
            <select v-model="communeChoisie" class="commune-select">
              <option value="">Choisir une commune</option>
              <option v-for="c in communesDisponibles" :key="c" :value="c">{{ c }}</option>
            </select>
            <div class="choix-commune-btns">
              <button class="btn-back" @click="afficherChoixAutreCommune = false">← Retour</button>
              <button class="btn-next" :disabled="!communeChoisie" @click="validerCommuneChoisie">Continuer →</button>
            </div>
          </template>
          <template v-else>
            <div class="premium-upsell">
              <span class="premium-icon">✨</span>
              <h3>Fonctionnalité Premium</h3>
              <p>Abonnez-vous pour choisir la commune où vous voulez que votre course soit effectuée, ou restez dans votre commune actuelle.</p>
              <button class="btn-next" style="width:100%" @click="souscrirePremium">✨ S'abonner ({{ prixPremium }} F CFA / mois)</button>
              <button class="btn-back" style="width:100%;margin-top:10px" @click="choisirPropreCommune">Rester dans ma commune</button>
            </div>
          </template>
        </div>

        <div class="action-row">
          <button class="btn-back" @click="etape = 0; afficherChoixAutreCommune = false">← Annuler</button>
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
            <p class="marche-commune-info">📍 Marchés de {{ communeSelectionnee }}</p>
            <div class="marches-list">
              <div
                v-for="m in marchesFiltres"
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
         <button class="btn-next" :disabled="!liste.trim() || !marcheChoisi" @click="publierDemande">
            Rechercher une coursière →
      </button>
        </div>
      </div>

 <!-- ÉTAPE 2 : RECHERCHE DE COURSIÈRE -->
<div v-if="etape === 2">
  <div class="section-title">
    <span class="step-tag">Étape 2</span>
    <h2>{{ aucuneCoursiereDisponible ? 'Aucune coursière disponible' : 'Recherche de votre coursière' }}</h2>
    <p v-if="!aucuneCoursiereDisponible">Nous proposons votre demande à la coursière disponible la plus proche, une par une, jusqu'à ce que l'une l'accepte.</p>
  </div>

  <!-- RECHERCHE EN COURS -->
  <div class="recherche-card" v-if="!aucuneCoursiereDisponible">
    <div class="recherche-radar">
      <span class="radar-ring r1"></span>
      <span class="radar-ring r2"></span>
      <span class="radar-ring r3"></span>
      <span class="recherche-icon">🔍</span>
    </div>
    <h3>Recherche en cours<span class="dots"><span>.</span><span>.</span><span>.</span></span></h3>
    <Transition name="statut-swap" mode="out-in">
      <p class="recherche-statut" :key="statutRechercheIndex">{{ statutsRecherche[statutRechercheIndex] }}</p>
    </Transition>
    <p class="recherche-chrono">⏱ {{ chronoRecherche }}s</p>
    <button class="btn-back" @click="etape = 1">← Annuler</button>
  </div>

  <!-- AUCUNE COURSIÈRE -->
  <div class="recherche-card echec" v-else>
    <span class="echec-icon">😔</span>
    <h3>Aucune coursière disponible</h3>
    <p>Personne n'est disponible pour l'instant. Réessayez dans quelques instants.</p>
    <div class="action-row" style="justify-content:center">
      <button class="btn-back" @click="etape = 1">← Retour</button>
      <button class="btn-next" @click="reessayerRecherche">Réessayer</button>
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
              </div>
              <div class="tchat-messages" ref="messagesEl">
                <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.from">
                  <div v-if="msg.type === 'liste'" class="bubble liste-bubble">
                    <div class="liste-bubble-header">📋 Liste de courses</div>
                    <div class="liste-bubble-content">{{ msg.text }}</div>
                    <div class="liste-bubble-footer">{{ marcheChoisi }}</div>
                  </div>
                  <div v-else class="bubble">{{ msg.text }}</div>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
              </div>
              <div class="tchat-input">
                <input v-model="nouveauMsg" placeholder="Écrire un message..." @keyup.enter="envoyerMessage" :disabled="budgetValide" />
                <button class="btn-send" @click="envoyerMessage" :disabled="!nouveauMsg.trim() || budgetValide"><span>➤</span></button>
              </div>
              <div class="tchat-locked" v-if="budgetValide">✅ Budget validé — vous pouvez procéder au paiement</div>
            </div>
          </div>
          <div class="tchat-sidebar">
            <div class="card carte-card">
              <h3>🗺️ Suivi en direct</h3>
              <div ref="carteMapEl" class="carte-livraison"></div>
            </div>
            <div class="card recap-card">
              <h3>📋 Récapitulatif</h3>
              <div class="recap-section">
                <div class="recap-item"><span>Marché</span><strong>{{ marcheChoisi }}</strong></div>
                <div class="recap-item"><span>Coursière</span><strong>{{ coursiereChos?.nom }}</strong></div>
              </div>
              <div class="recap-divider"></div>
              <div class="recap-section">
                <p class="recap-section-title">Votre budget de courses</p>
                <div class="budget-section" v-if="!budgetValide">
                  <input v-model.number="budgetInput" type="number" placeholder="Montant en F CFA" class="budget-input" />
                  <button class="btn-valider-budget" :disabled="!budgetInput" @click="validerBudget">Valider mon budget</button>
                </div>
                <div class="recap-item" v-else><span>Budget courses</span><strong>{{ budgetCourses }} F</strong></div>
                <div class="recap-item" v-if="budgetValide"><span>Frais prestation</span><strong>{{ fraisPrestation }} F</strong></div>
                <div class="recap-item"><span>Frais service</span><strong class="val-fixed">{{ fraisService }} F</strong></div>
              </div>
              <div class="recap-divider"></div>
              <div class="recap-total"><span>Total à payer</span><strong>{{ totalEstime }} F CFA</strong></div>
              <p class="recap-note">🛵 La livraison sera organisée par votre coursière après paiement (Yango Moto) et réglée directement au livreur.</p>
              <button class="btn-next" style="width:100%;margin-top:16px" :disabled="!budgetValide" @click="etape = 4">
                {{ budgetValide ? 'Procéder au paiement →' : 'Validez votre budget pour continuer' }}
              </button>
            </div>
          </div>
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
              <div class="recap-item"><span>Frais prestation</span><strong>{{ fraisPrestation }} F CFA</strong></div>
              <div class="recap-item"><span>Frais de service MamiMarché</span><strong>{{ fraisService }} F CFA</strong></div>
              <div class="recap-divider"></div>
              <div class="recap-total big"><span>Total à payer</span><strong>{{ totalEstime }} F CFA</strong></div>
            </div>
            <div class="paiement-info">
              <span>🔒</span>
              <p>Votre paiement transite par la plateforme MamiMarché. Une fois vos courses faites, votre coursière vous proposera un livreur Yango Moto — les frais de livraison seront à régler directement à ce livreur.</p>
            </div>
            <button class="btn-wave" @click="payerWave">🌊 Payer {{ totalEstime }} F via Wave</button>
            <button class="btn-back" style="width:100%;margin-top:10px" @click="etape = 3">← Retour au tchat</button>
          </div>
        </div>
      </div>

      <!-- ÉTAPE 5 : LIVRAISON + CONFIRMATION -->
      <div v-if="etape === 5">

        <!-- EN ATTENTE D'UNE PROPOSITION DE LIVREUR -->
        <div v-if="courseStatut !== 'livree' && (!livraisonData || livraisonData.statut === 'non_demandee')" class="confirmation">
          <div class="confirm-icon">💳</div>
          <h2>Paiement reçu !</h2>
          <p><strong>{{ coursiereChos?.nom }}</strong> va effectuer vos courses au <strong>{{ marcheChoisi }}</strong>, puis vous proposera un livreur Yango Moto.</p>
          <div class="chargement">
            <div class="spinner"></div>
            <p>En attente d'une proposition de livraison...</p>
          </div>
        </div>

        <!-- REÇU YANGO PROPOSÉ -->
        <div v-else-if="livraisonData.statut === 'proposee'" class="livraison-recu-wrap">
          <div class="section-title">
            <h2>🛵 Livraison proposée</h2>
            <p>Votre coursière a trouvé un livreur Yango Moto</p>
          </div>
          <div class="card livraison-recu">
            <div class="recu-ligne"><span>Livreur</span><strong>{{ livraisonData.livreurNom }}</strong></div>
            <div class="recu-ligne"><span>Téléphone</span><strong>{{ livraisonData.livreurTelephone }}</strong></div>
            <div class="recu-ligne"><span>Adresse de livraison</span><strong>{{ livraisonData.adresseLivraison }}</strong></div>
            <div class="recu-ligne"><span>Récupération estimée</span><strong>{{ livraisonData.dureeRecuperation }}</strong></div>
            <div class="recu-ligne"><span>Livraison estimée</span><strong>{{ livraisonData.dureeLivraison }}</strong></div>
            <div class="recap-divider"></div>
            <div class="recu-ligne total"><span>Prix Yango (à régler au livreur)</span><strong>{{ livraisonData.prix }} F CFA</strong></div>
            <div class="livraison-actions">
              <button class="btn-back" @click="refuserLivraison">Chercher un autre livreur</button>
              <button class="btn-next" @click="accepterLivraison">Accepter ✓</button>
            </div>
          </div>
        </div>

        <!-- LIVREUR ACCEPTÉ / COMMANDÉ -->
        <div v-else-if="courseStatut !== 'livree'" class="confirmation">
          <div class="confirm-icon">🛵</div>
          <h2>{{ livraisonData.statut === 'commandee' ? 'Livreur commandé !' : 'Livreur accepté !' }}</h2>
          <p><strong>{{ livraisonData.livreurNom }}</strong> va récupérer et livrer vos courses. Prévoyez <strong>{{ livraisonData.prix }} F CFA</strong> à lui régler directement à la livraison.</p>
          <div class="confirm-steps">
            <div class="confirm-step done">✓ Paiement reçu</div>
            <div class="confirm-step" :class="livraisonData.statut === 'commandee' ? 'done' : 'pending'">{{ livraisonData.statut === 'commandee' ? '✓ Livreur réservé' : '⏳ En attente de réservation' }}</div>
            <div class="confirm-step pending">🏠 Livraison à domicile</div>
          </div>
        </div>

        <!-- CONFIRMATION FINALE -->
        <div v-else class="confirmation">
          <div class="confirm-icon">🎉</div>
          <h2>Commande confirmée !</h2>
          <p>Votre commande a été livrée par <strong>{{ coursiereChos?.nom }}</strong> via le livreur <strong>{{ livraisonData?.livreurNom }}</strong>. Merci d'avoir utilisé MamiMarché !</p>
          <div class="confirm-steps">
            <div class="confirm-step done">✓ Paiement reçu</div>
            <div class="confirm-step done">✓ Livreur réservé</div>
            <div class="confirm-step done">✓ Livraison effectuée</div>
          </div>
          <div class="rating-section" v-if="!noteEnvoyee">
            <p>Notez votre coursière</p>
            <div class="stars">
              <span
                v-for="n in 5"
                :key="n"
                class="star"
                :class="{ active: n <= (noteHover || 0) }"
                @mouseenter="noteHover = n"
                @mouseleave="noteHover = 0"
                @click="envoyerNote(n)"
              >★</span>
            </div>
          </div>
          <p class="rating-done" v-else>Merci pour votre note ⭐ {{ noteDonnee }}/5</p>
          <button class="btn-next" @click="nouvelleCommande">Passer une nouvelle commande</button>
        </div>
      </div>

    </div>

    <!-- MODAL LITIGE -->
    <div class="modal-overlay" v-if="litigeCourseId" @click.self="litigeCourseId = null">
      <div class="modal-litige">
        <h3>⚠️ Signaler un problème</h3>
        <input v-model="litigeTitre" placeholder="Titre du problème" class="litige-input" />
        <textarea v-model="litigeDescription" placeholder="Décrivez le problème..." rows="4" class="litige-textarea"></textarea>
        <div class="modal-litige-btns">
          <button class="btn-back" @click="litigeCourseId = null">Annuler</button>
          <button class="btn-next" :disabled="!litigeTitre.trim()" @click="envoyerLitige">Envoyer</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import api from '../../api/axios.js'
import socket from '../../api/socket.js'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

const authStore = useAuthStore()
const toast = useToastStore()
const etape = ref(0)
const liste = ref('')
const marcheChoisi = ref('')
const coursiereChos = ref(null)
const nouveauMsg = ref('')
const messagesEl = ref(null)
const budgetCourses = ref(null)
const budgetInput = ref(null)
const budgetValide = ref(false)
const fraisPrestation = ref(null)
const fraisService = ref(200)
const prixPremium = ref(2000)

const afficherChoixAutreCommune = ref(false)
const communeChoisie = ref('')
const communeSelectionnee = ref(authStore.user?.commune || '')
const aucuneCoursiereDisponible = ref(false)
const carteMapEl = ref(null)

const livraisonData = ref(null)
const courseStatut = ref('en_attente')
const enAttenteAssignation = ref(false)
const courseId = ref(null)
const historiqueCommandes = ref([])

// ── Animation de la recherche de coursière (étape 2) ──
const statutsRecherche = [
  'Localisation des coursières à proximité…',
  'Vérification de leur disponibilité…',
  'Envoi de votre demande…',
  'En attente d\'une réponse…'
]
const statutRechercheIndex = ref(0)
const chronoRecherche = ref(0)
let statutRechercheInterval = null
let chronoRechercheInterval = null

function demarrerAnimationRecherche() {
  arreterAnimationRecherche()
  statutRechercheIndex.value = 0
  chronoRecherche.value = 0
  statutRechercheInterval = setInterval(() => {
    statutRechercheIndex.value = (statutRechercheIndex.value + 1) % statutsRecherche.length
  }, 2600)
  chronoRechercheInterval = setInterval(() => {
    chronoRecherche.value++
  }, 1000)
}

function arreterAnimationRecherche() {
  clearInterval(statutRechercheInterval)
  clearInterval(chronoRechercheInterval)
  statutRechercheInterval = null
  chronoRechercheInterval = null
}

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

async function chargerMarches() {
  try {
    const res = await api.get('/marches', { params: { actif: true } })
    marches.value = res.data.marches
  } catch (err) {
    console.error('Erreur marchés:', err)
  }
}

async function chargerFraisService() {
  try {
    const res = await api.get('/parametres')
    fraisService.value = res.data.fraisService
    prixPremium.value = res.data.prixPremiumClient
  } catch (err) {
    console.error('Erreur paramètres:', err)
  }
}

function choisirPropreCommune() {
  communeSelectionnee.value = authStore.user?.commune || ''
  afficherChoixAutreCommune.value = false
  etape.value = 1
}

function validerCommuneChoisie() {
  if (!communeChoisie.value) return
  communeSelectionnee.value = communeChoisie.value
  afficherChoixAutreCommune.value = false
  etape.value = 1
}

async function souscrirePremium() {
  try {
    const res = await api.put('/client/premium')
    authStore.mettreAJourUser({ premium: res.data.premium })
    toast.success('Abonnement premium activé !')
  } catch (err) {
    toast.error('Erreur lors de la souscription')
  }
}

onMounted(() => {
  chargerHistorique()
  chargerMarches()
  chargerFraisService()
})

onUnmounted(() => {
  socket.off('nouveau_message')
  socket.off('course_assignee')
  socket.off('livraison_maj')
  socket.off('statut_change')
  socket.off('dispatching_epuise')
  socket.off('position_maj')
  if (socket.connected) socket.disconnect()
  detruireCarte()
  arreterAnimationRecherche()
})

const initiales = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return (u.prenom?.[0] || '') + (u.nom?.[0] || '')
})
const totalEstime = computed(() => {
  return (budgetCourses.value || 0) + (fraisPrestation.value || 0) + fraisService.value
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

const marches = ref([])
const marchesFiltres = computed(() => marches.value.filter(m => m.commune === communeSelectionnee.value))
const communesDisponibles = computed(() => [...new Set(marches.value.map(m => m.commune))])

const messages = ref([])

function getTime(date) {
  return new Date(date || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function scrollBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function mapCoursiereUser(u) {
  if (!u) return null
  return {
    _id: u._id,
    nom: `${u.prenom} ${u.nom}`,
    initiales: (u.prenom?.[0] || '') + (u.nom?.[0] || ''),
    marche: u.coursiere?.marches?.[0] || marcheChoisi.value,
    type: u.coursiere?.typeProfile === 'premium' ? 'Premium' : 'Standard',
    note: u.coursiere?.nombreAvis > 0
      ? Math.round(u.coursiere.note / u.coursiere.nombreAvis * 10) / 10
      : 0
  }
}

function formaterMessage(msg) {
  return {
    from: msg.expediteur === authStore.user?.id ? 'client' : 'coursiere',
    text: msg.texte,
    type: msg.type,
    devis: msg.devis,
    time: getTime(msg.createdAt)
  }
}

async function envoyerMessageApi(payload) {
  try {
    await api.post('/messages', {
      course: courseId.value,
      ...payload
    })
  } catch (err) {
    toast.error('Erreur lors de l\'envoi du message')
  }
}

function lancerCommande(marche) {
  communeSelectionnee.value = marche.commune
  marcheChoisi.value = marche.nom
  etape.value = 1
}

let carteMap = null
let markerCoursiere = null
let markerMarche = null

function initCarte() {
  if (carteMap || !carteMapEl.value) return
  const m = marches.value.find(mm => mm.nom === marcheChoisi.value)
  const centre = m?.lat != null ? [m.lat, m.lng] : [5.36, -4.0]
  carteMap = L.map(carteMapEl.value).setView(centre, 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(carteMap)
  if (m?.lat != null) {
    markerMarche = L.marker([m.lat, m.lng]).addTo(carteMap).bindPopup('🏪 ' + m.nom)
  }
}

function majPositionCoursiereCarte(lat, lng) {
  if (!carteMap || lat == null || lng == null) return
  if (!markerCoursiere) {
    markerCoursiere = L.marker([lat, lng]).addTo(carteMap).bindPopup('🛵 Votre coursière')
  } else {
    markerCoursiere.setLatLng([lat, lng])
  }
  carteMap.panTo([lat, lng])
}

function detruireCarte() {
  if (carteMap) {
    carteMap.remove()
    carteMap = null
    markerCoursiere = null
    markerMarche = null
  }
}

async function publierDemande() {
  try {
    const res = await api.post('/courses', {
      marche: marcheChoisi.value,
      commune: communeSelectionnee.value,
      liste: liste.value,
      mode: 'standard'
    })
    courseId.value = res.data.course._id
    coursiereChos.value = null
    enAttenteAssignation.value = true
    aucuneCoursiereDisponible.value = false
    demarrerAnimationRecherche()
    budgetValide.value = false
    budgetInput.value = null
    budgetCourses.value = null
    fraisPrestation.value = null
    livraisonData.value = null
    courseStatut.value = 'en_attente'
    messages.value = []
    detruireCarte()

    const histRes = await api.get(`/courses/${courseId.value}/messages`)
    messages.value = histRes.data.messages.map(formaterMessage)

    socket.connect()
    socket.emit('rejoindre_course', courseId.value)
    socket.off('nouveau_message')
    socket.off('course_assignee')
    socket.off('livraison_maj')
    socket.off('statut_change')
    socket.off('dispatching_epuise')
    socket.off('position_maj')

    socket.on('course_assignee', ({ course }) => {
      arreterAnimationRecherche()
      coursiereChos.value = mapCoursiereUser(course.coursiere)
      enAttenteAssignation.value = false
      etape.value = 3
      toast.success(`${coursiereChos.value.nom} a accepté votre commande !`)
      nextTick(() => initCarte())
    })

    socket.on('nouveau_message', (msg) => {
      messages.value.push(formaterMessage(msg))
      scrollBottom()
    })

    socket.on('livraison_maj', ({ course }) => {
      livraisonData.value = course.livraison
      if (course.livraison.statut === 'proposee') toast.info('🛵 Un livreur vous a été proposé !')
      if (course.livraison.statut === 'acceptee') toast.success('Livraison acceptée, en attente de confirmation de la coursière.')
      if (course.livraison.statut === 'commandee') toast.success('Livreur commandé !')
    })

    socket.on('statut_change', ({ course }) => {
      courseStatut.value = course.statut
      if (course.statut === 'livree') toast.success('Votre commande a été livrée ! 🎉')
    })

    socket.on('dispatching_epuise', () => {
      arreterAnimationRecherche()
      enAttenteAssignation.value = false
      aucuneCoursiereDisponible.value = true
    })

    socket.on('position_maj', ({ lat, lng }) => {
      majPositionCoursiereCarte(lat, lng)
    })

    etape.value = 2
    toast.success('Demande publiée ! En attente qu\'une coursière l\'accepte...')
  } catch (err) {
    toast.error('Erreur lors de la création de la course')
    console.error(err)
  }
}

function reessayerRecherche() {
  aucuneCoursiereDisponible.value = false
  publierDemande()
}

async function envoyerMessage() {
  if (!nouveauMsg.value.trim() || budgetValide.value) return
  const texte = nouveauMsg.value
  nouveauMsg.value = ''
  await envoyerMessageApi({ texte, type: 'normal' })
}

async function envoyerListe() {
  if (!liste.value.trim()) return
  await envoyerMessageApi({ texte: liste.value, type: 'liste' })
}

async function validerBudget() {
  if (!budgetInput.value) return
  try {
    const res = await api.put(`/courses/${courseId.value}/budget`, { budgetCourses: budgetInput.value })
    budgetCourses.value = res.data.course.budgetCourses
    fraisPrestation.value = res.data.fraisPrestation
    fraisService.value = res.data.course.fraisService
    budgetValide.value = true
    toast.success('Budget validé !')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la validation du budget')
  }
}

async function payerWave() {
  try {
    await api.post('/transactions', {
      courseId: courseId.value,
      methodePaiement: 'wave',
      montantTotal: totalEstime.value
    })
    courseStatut.value = 'en_cours'
    livraisonData.value = { statut: 'non_demandee' }
    etape.value = 5
    headerStats.value[0].val = String(parseInt(headerStats.value[0].val) + 1)
    toast.success('Paiement effectué avec succès ! 🎉')
  } catch (err) {
    toast.error('Erreur lors du paiement')
    console.error(err)
  }
}

async function accepterLivraison() {
  try {
    await api.put(`/courses/${courseId.value}/livraison`, { action: 'accepter' })
  } catch (err) {
    toast.error('Erreur lors de l\'acceptation de la livraison')
  }
}

async function refuserLivraison() {
  try {
    await api.put(`/courses/${courseId.value}/livraison`, { action: 'refuser' })
    toast.info('Votre coursière va chercher un autre livreur.')
  } catch (err) {
    toast.error('Erreur')
  }
}

const noteHover = ref(0)
const noteDonnee = ref(0)
const noteEnvoyee = ref(false)

async function envoyerNote(n) {
  try {
    await api.put(`/courses/${courseId.value}/noter`, { note: n, commentaire: '' })
    noteDonnee.value = n
    noteEnvoyee.value = true
    toast.success('Merci pour votre note !')
  } catch (err) {
    toast.error('Erreur lors de l\'envoi de la note')
  }
}

const litigeCourseId = ref(null)
const litigeTitre = ref('')
const litigeDescription = ref('')

function ouvrirLitige(h) {
  litigeCourseId.value = h._id
  litigeTitre.value = ''
  litigeDescription.value = ''
}

async function envoyerLitige() {
  if (!litigeTitre.value.trim()) return
  try {
    await api.post('/litiges', {
      courseId: litigeCourseId.value,
      titre: litigeTitre.value,
      description: litigeDescription.value
    })
    toast.success('Signalement envoyé, notre équipe va l\'examiner.')
    litigeCourseId.value = null
  } catch (err) {
    toast.error('Erreur lors de l\'envoi du signalement')
  }
}

function nouvelleCommande() {
  etape.value = 0
  liste.value = ''
  marcheChoisi.value = ''
  coursiereChos.value = null
  budgetCourses.value = null
  budgetInput.value = null
  budgetValide.value = false
  fraisPrestation.value = null
  livraisonData.value = null
  courseStatut.value = 'en_attente'
  messages.value = []
  enAttenteAssignation.value = false
  aucuneCoursiereDisponible.value = false
  afficherChoixAutreCommune.value = false
  communeChoisie.value = ''
  courseId.value = null
  noteHover.value = 0
  noteDonnee.value = 0
  noteEnvoyee.value = false
  if (socket.connected) socket.disconnect()
  detruireCarte()
  arreterAnimationRecherche()
  chargerHistorique()
}
</script>

<style scoped>

/* CHARGEMENT */
.chargement { text-align: center; padding: 48px; }
.spinner { width: 40px; height: 40px; border: 3px solid var(--bordure); border-top-color: var(--vert); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.chargement p { font-size: 14px; color: var(--texte-sec); }


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
@media (max-width: 480px) {
  .step-prog { gap: 0; }
  .step-prog-dot { width: 24px; height: 24px; font-size: 11px; }
  .step-prog-label { display: none; }
  .step-prog:not(:last-child)::after { margin: 0 4px; }
}

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

/* HISTORIQUE (accueil) */
.histo-list { display: flex; flex-direction: column; }
.histo-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 0.5px solid var(--bordure); flex-wrap: wrap; }
.histo-item:last-child { border-bottom: none; }
.histo-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.histo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.histo-dot.complete { background: var(--vert); }
.histo-dot.encours { background: #f59e0b; }
.histo-left p { font-size: 13px; font-weight: 600; margin: 0 0 2px; color: var(--texte); }
.histo-left span { font-size: 11px; color: var(--texte-sec); }
.histo-right { text-align: right; flex-shrink: 0; }
.histo-right strong { display: block; font-size: 14px; color: var(--texte); margin-bottom: 2px; }
.histo-right span { display: block; font-size: 11px; font-weight: 600; }
.histo-right span.complete { color: var(--vert); }
.histo-right span.encours { color: #f59e0b; }

/* SECTION TITLE */
.section-title { margin-bottom: 24px; padding-top: 28px; }
.step-tag { display: inline-block; background: var(--vert-light); color: var(--vert-dark); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 8px; }
.section-title h2 { font-size: 22px; font-weight: 800; color: var(--texte); margin: 0 0 4px; }
.section-title p { font-size: 14px; color: var(--texte-sec); margin: 0; }

/* CHOIX COMMUNE / PREMIUM */
.choix-commune-wrap { max-width: 520px; margin: 0 auto; }
.choix-commune-card { text-align: center; }
.choix-commune-card p { font-size: 15px; color: var(--texte); margin-bottom: 20px; line-height: 1.6; }
.choix-commune-btns { display: flex; gap: 10px; flex-wrap: wrap; }
.choix-commune-btns .btn-next, .choix-commune-btns .btn-back { flex: 1; min-width: 140px; }
.commune-select { width: 100%; box-sizing: border-box; padding: 12px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 14px; color: var(--texte); margin-bottom: 16px; }
.premium-upsell { text-align: center; }
.premium-icon { font-size: 40px; display: block; margin-bottom: 10px; }
.premium-upsell h3 { font-size: 18px; font-weight: 800; color: var(--vert-dark); margin: 0 0 8px; }
.premium-upsell p { font-size: 14px; color: var(--texte-sec); margin-bottom: 20px; }
.marche-commune-info { font-size: 12px; color: var(--texte-sec); margin: -8px 0 12px; }

/* CARTE LIVE */
.carte-card { margin-bottom: 20px; }
.carte-livraison { height: 200px; border-radius: 10px; overflow: hidden; }

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
.coursiere-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--vert); color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.coursiere-avatar.sm { width: 36px; height: 36px; font-size: 13px; }

/* RECHERCHE DE COURSIÈRE */
.recherche-card {
  max-width: 460px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: var(--shadow);
  border: 1px solid var(--bordure);
}
.recherche-radar { position: relative; width: 90px; height: 90px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
.radar-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--vert); animation: rechercheSweep 2.2s ease-out infinite; }
.radar-ring.r2 { animation-delay: 0.7s; }
.radar-ring.r3 { animation-delay: 1.4s; }
@keyframes rechercheSweep { 0% { transform: scale(0.6); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
.recherche-icon {
  position: relative; z-index: 1;
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--vert-light); color: var(--vert-dark);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  animation: rechercheBob 1.8s ease-in-out infinite;
}
@keyframes rechercheBob { 0%, 100% { transform: rotate(-8deg) scale(1); } 50% { transform: rotate(8deg) scale(1.08); } }
.recherche-card h3 { font-size: 19px; font-weight: 800; color: var(--texte); margin: 0 0 8px; display: flex; align-items: center; justify-content: center; gap: 2px; }
.recherche-card p { font-size: 14px; color: var(--texte-sec); margin: 0 0 6px; line-height: 1.6; }
.dots { display: inline-flex; }
.dots span { animation: dotFade 1.4s infinite; opacity: 0; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotFade { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
.recherche-statut { min-height: 20px; font-weight: 500; }
.statut-swap-enter-active, .statut-swap-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.statut-swap-enter-from { opacity: 0; transform: translateY(6px); }
.statut-swap-leave-to { opacity: 0; transform: translateY(-6px); }
.recherche-chrono { font-size: 12px; color: var(--texte-sec); opacity: 0.7; margin: 0 0 24px; font-variant-numeric: tabular-nums; }
.recherche-card.echec .echec-icon { font-size: 44px; display: block; margin-bottom: 12px; }

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
.recap-note { font-size: 12px; color: var(--texte-sec); background: var(--vert-light); border-radius: 8px; padding: 10px 12px; margin: 8px 0 0; line-height: 1.5; }

/* BUDGET */
.budget-section { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
.budget-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid var(--bordure); border-radius: var(--radius); font-size: 14px; color: var(--texte); }
.budget-input:focus { border-color: var(--vert); outline: none; }
.btn-valider-budget { background: var(--vert); color: white; border: none; padding: 10px; border-radius: var(--radius); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-valider-budget:hover:not(:disabled) { background: var(--vert-dark); }
.btn-valider-budget:disabled { opacity: 0.4; cursor: not-allowed; }

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

/* LIVRAISON YANGO */
.livraison-recu-wrap { max-width: 480px; margin: 0 auto; }
.livraison-recu { padding: 24px; }
.recu-ligne { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid var(--bordure); font-size: 13px; gap: 12px; }
.recu-ligne span { color: var(--texte-sec); }
.recu-ligne strong { color: var(--texte); text-align: right; }
.recu-ligne.total { font-size: 15px; font-weight: 700; border-bottom: none; }
.recu-ligne.total strong { color: var(--vert-dark); font-size: 18px; }
.livraison-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.livraison-actions .btn-back, .livraison-actions .btn-next { flex: 1; min-width: 140px; }

/* ACTIONS */
.action-row { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; padding-bottom: 20px; }
.btn-next { background: var(--vert); color: white; padding: 14px 28px; border-radius: var(--radius); font-size: 15px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
.btn-next:hover:not(:disabled) { background: var(--vert-dark); transform: translateY(-1px); }
.btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-back { background: white; color: var(--texte-sec); padding: 14px 20px; border-radius: var(--radius); font-size: 14px; font-weight: 600; border: 1px solid var(--bordure); cursor: pointer; transition: all 0.2s; }
.btn-back:hover { border-color: var(--vert); color: var(--vert); }
.recap-total.big { font-size: 18px; }
.recap-total.big strong { font-size: 22px; }

/* SIGNALER / LITIGE */
.btn-signaler { display: block; margin: 4px 0 0 auto; background: none; border: none; color: #dc2626; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; }
.btn-signaler:hover { text-decoration: underline; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 24px; backdrop-filter: blur(4px); }
.modal-litige { background: white; border-radius: 20px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 24px 60px rgba(0,0,0,0.2); }
.modal-litige h3 { font-size: 18px; font-weight: 800; margin: 0 0 16px; color: var(--texte); }
.litige-input, .litige-textarea { width: 100%; box-sizing: border-box; border: 1px solid var(--bordure); border-radius: var(--radius); padding: 10px 12px; font-size: 14px; font-family: inherit; color: var(--texte); margin-bottom: 10px; }
.litige-textarea { resize: none; }
.litige-input:focus, .litige-textarea:focus { border-color: var(--vert); outline: none; }
.modal-litige-btns { display: flex; gap: 10px; justify-content: flex-end; }

/* NOTATION */
.rating-section { margin-bottom: 24px; }
.rating-section p { font-size: 14px; color: var(--texte-sec); margin-bottom: 10px; }
.stars { display: flex; gap: 6px; justify-content: center; }
.star { font-size: 32px; color: var(--bordure); cursor: pointer; transition: color 0.15s; }
.star.active { color: #f59e0b; }
.rating-done { font-size: 14px; color: var(--vert-dark); font-weight: 600; margin-bottom: 24px; }
</style>