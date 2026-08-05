<template>
  <div class="home">


    <!-- MODALE AUTH -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal">
        <button class="modal-close" @click="showModal = false">✕</button>
        <div class="modal-icon">🛍️</div>
        <h3>Vous avez déjà un compte ?</h3>
        <p>Connectez-vous pour {{ modalAction }} ou créez un compte gratuitement.</p>
        <div class="modal-btns">
          <RouterLink to="/connexion" class="btn-primary modal-btn">Oui, me connecter</RouterLink>
          <RouterLink to="/inscription" class="btn-outline modal-btn">Non, m'inscrire</RouterLink>
        </div>
      </div>
    </div>

    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          <div class="hero-tag">🇨🇮 Abidjan · Livraison de marché</div>
          <h1>Vos courses de marché, <span>livrées par les femmes du quartier</span></h1>
          <p>Délégez vos achats aux coursières locales des marchés d'Abidjan. Produits frais, paiement Mobile Money, livraison rapide.</p>
          <div class="hero-btns">
            <button class="btn-hero-primary" @click="ouvrirModal('commander')">Commander maintenant →</button>
            <RouterLink to="/connexion" class="btn-hero-outline">Se connecter</RouterLink>
          </div>
          <div class="hero-stats">
            <div class="stat" v-for="s in stats" :key="s.label">
              <span class="stat-val">{{ s.val }}</span>
              <span class="stat-label">{{ s.label }}</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-card main-card">
            <div class="visual-header">
              <span class="radar-wrap">
                <span class="radar-ring" v-if="rechercheEnCours"></span>
                <span class="radar-ring delay" v-if="rechercheEnCours"></span>
                <span class="pulse"></span>
              </span>
              <span>{{ rechercheEnCours ? 'Recherche de la coursière la plus proche…' : 'Coursière trouvée' }}</span>
            </div>
            <Transition name="candidat-swap" mode="out-in">
              <div class="visual-coursiere" :key="candidatActuel.nom" v-if="!rechercheEnCours">
                <div class="avatar">{{ candidatActuel.initiales }}</div>
                <div>
                  <p class="c-name">{{ candidatActuel.nom }}</p>
                  <p class="c-info">{{ candidatActuel.marche }} · ⭐ {{ candidatActuel.note }}</p>
                </div>
                <span class="dispo-badge">Dispo</span>
              </div>
              <div class="visual-coursiere skeleton" v-else>
                <div class="avatar skel"></div>
                <div>
                  <p class="skel-line w1"></p>
                  <p class="skel-line w2"></p>
                </div>
              </div>
            </Transition>
            <div class="visual-marche">
              <span>🏪</span>
              <span>{{ candidatActuel.marche }}</span>
              <span class="dist">~{{ distanceAffichee }} km</span>
            </div>
          </div>
          <div class="visual-card mini-card left">
            <span>🥬</span>
            <div>
              <p>Produits frais</p>
              <p>Livrés aujourd'hui</p>
            </div>
          </div>
          <div class="visual-card mini-card right">
            <span>⚡</span>
            <div>
              <p>~{{ delaiAffiche }} min</p>
              <p>Délai moyen</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMMENT ÇA MARCHE -->
    <section class="how">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Simple & rapide</span>
          <h2>Comment ça marche ?</h2>
          <p>3 étapes pour recevoir votre marché à domicile</p>
        </div>
        <div class="steps">
          <div
            v-for="(s, i) in steps"
            :key="s.titre"
            class="step"
            :class="{ active: activeStep === i }"
            @mouseenter="activeStep = i"
            @mouseleave="activeStep = 0"
            @click="ouvrirModal(s.action)"
          >
            <div class="step-icon">{{ s.icon }}</div>
            <div class="step-num">{{ s.num }}</div>
            <h3>{{ s.titre }}</h3>
            <p>{{ s.desc }}</p>
            <span class="step-cta">{{ s.cta }} →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MARCHÉS -->
    <section class="marches">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Couverture</span>
          <h2>Marchés disponibles</h2>
          <p>Les marchés reconnus d'Abidjan, couverts dès le lancement</p>
        </div>
        <div class="marches-grid">
          <div
            class="marche-card"
            v-for="m in marches"
            :key="m.nom"
            @mouseenter="hoveredMarche = m.nom"
            @mouseleave="hoveredMarche = null"
            :class="{ hovered: hoveredMarche === m.nom }"
            @click="ouvrirModal('commander au ' + m.nom)"
          >
            <span class="marche-icon">{{ m.icon }}</span>
            <p class="marche-nom">{{ m.nom }}</p>
            <p class="marche-commune">📍 {{ m.commune }}</p>
            <span class="marche-badge">Actif</span>
          </div>
        </div>
      </div>
    </section>

    <!-- DEVENEZ COURSIÈRE -->
    <section class="devenir">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Rejoignez l'équipe</span>
          <h2>Devenez coursière MamiMarché</h2>
          <p>Voici concrètement ce qui se passe quand une course arrive</p>
        </div>
        <div class="devenir-grid">

          <!-- DÉMO PARCOURS RÉEL -->
          <div class="demo-phone-wrap">
            <div class="demo-phone">
              <div class="demo-progress-row">
                <div class="demo-progress-seg" v-for="(e, i) in etapesDemo" :key="e.cle">
                  <div
                    class="demo-progress-fill"
                    :class="{ filled: i < etapeDemoIndex }"
                    :key="i === etapeDemoIndex ? 'live-' + timerRingKey : 'static-' + i"
                    :style="i === etapeDemoIndex ? { animation: 'progressFill ' + DUREE_ETAPE_DEMO + 'ms linear forwards' } : {}"
                  ></div>
                </div>
              </div>
              <Transition name="demo-swap" mode="out-in">
                <div
                  class="demo-etape-photo"
                  :key="etapeDemoActuelle.cle"
                  :style="{ backgroundImage: 'url(' + etapeDemoActuelle.image + ')' }"
                >
                  <div class="demo-scrim"></div>
                  <span class="demo-badge-float">{{ etapeDemoActuelle.icon }}</span>
                  <div class="demo-texte-bas">
                    <p class="demo-titre">{{ etapeDemoActuelle.titre }}</p>
                    <p class="demo-texte">{{ etapeDemoActuelle.texte }}</p>
                  </div>
                </div>
              </Transition>
            </div>
            <p class="demo-legende">↑ Aperçu réel de l'expérience coursière</p>
          </div>

          <!-- TARIFS -->
          <div class="tarifs-card">
            <div class="tarifs-toggle">
              <button type="button" :class="{ active: profilActif === 'standard' }" @click="profilActif = 'standard'">⭐ Standard</button>
              <button type="button" :class="{ active: profilActif === 'premium' }" @click="profilActif = 'premium'">💎 Premium</button>
              <span class="toggle-thumb" :class="profilActif"></span>
            </div>
            <Transition name="tarif-swap" mode="out-in">
              <div class="tarif-contenu" :key="profilActif">
                <p class="tarif-prix">
                  {{ profilActif === 'standard' ? tarifsCoursiere.unitePrixStandardVendeuse : tarifsCoursiere.unitePrixPremiumVendeuse }} F CFA
                  <span>/ jour</span>
                </p>
                <ul class="tarif-features">
                  <li>✓ {{ profilActif === 'standard' ? tarifsCoursiere.quotaStandard : tarifsCoursiere.quotaPremium }} courses par jour</li>
                  <li>✓ {{ profilActif === 'standard' ? 'Visibilité normale' : 'Visibilité prioritaire' }}</li>
                  <li>✓ {{ profilActif === 'standard' ? 'Marché le plus proche' : 'Tout marché au choix' }}</li>
                  <li>✓ {{ profilActif === 'standard' ? 'Tchat intégré' : 'Tchat + appel intégré' }}</li>
                </ul>
              </div>
            </Transition>
            <button class="btn-hero-primary tarif-cta" @click="ouvrirModal('rejoindre comme coursière ' + profilActif)">
              Rejoindre en tant que coursière →
            </button>
          </div>

        </div>
      </div>
    </section>

    <!-- POURQUOI NOUS -->
    <section class="why">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Nos engagements</span>
          <h2>Pourquoi MamiMarché ?</h2>
        </div>
        <div class="why-grid">
          <div class="why-card" v-for="w in whys" :key="w.titre">
            <span class="why-icon">{{ w.icon }}</span>
            <h3>{{ w.titre }}</h3>
            <p>{{ w.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta">
      <div class="container cta-inner">
        <h2>Prêt à commander votre marché ?</h2>
        <p>Rejoignez les familles d'Abidjan qui font confiance à MamiMarché</p>
        <div class="cta-btns">
          <button class="btn-hero-primary" @click="ouvrirModal('commander')">Créer un compte gratuit</button>
          <button class="btn-hero-outline" @click="ouvrirModal('devenir coursière')">Devenir coursière</button>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToastStore } from '../stores/toast'
import api from '../api/axios.js'

const toast = useToastStore()
const activeStep = ref(0)
const hoveredMarche = ref(null)
const showModal = ref(false)
const modalAction = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/marches', { params: { actif: true } })
    if (res.data.marches.length > 0) marches.value = res.data.marches
  } catch (err) {
    console.error('Erreur marchés:', err)
  }
  try {
    const res = await api.get('/parametres/public')
    tarifsCoursiere.value = res.data
  } catch (err) {
    console.error('Erreur tarifs coursière:', err)
  }

  heroInterval = setInterval(cyclerCandidat, 4500)
  demoInterval = setInterval(avancerDemo, DUREE_ETAPE_DEMO)
})

onUnmounted(() => {
  clearInterval(heroInterval)
  clearInterval(demoInterval)
})

function ouvrirModal(action) {
  modalAction.value = action
  showModal.value = true
}

// ── CARTE HÉRO : simulation vivante du dispatching par proximité ──
const candidatsDemo = [
  { nom: 'Amara Koné', initiales: 'AK', marche: "Marché d'Adjamé", note: 4.9, distance: 1.2, delai: 35 },
  { nom: 'Chloé Braut', initiales: 'CB', marche: 'Marché de Cocody', note: 4.7, distance: 0.8, delai: 22 },
  { nom: 'Mariam Sita', initiales: 'MS', marche: 'Marché de Treichville', note: 4.8, distance: 1.6, delai: 40 }
]
const candidatIndex = ref(0)
const rechercheEnCours = ref(false)
const candidatActuel = computed(() => candidatsDemo[candidatIndex.value])
const distanceAffichee = ref(candidatsDemo[0].distance.toFixed(1))
const delaiAffiche = ref(String(candidatsDemo[0].delai))
let heroInterval = null

function animerNombre(refCible, debut, fin, decimales, duree = 700) {
  const debutTemps = performance.now()
  function tick(maintenant) {
    const t = Math.min(1, (maintenant - debutTemps) / duree)
    const ease = 1 - Math.pow(1 - t, 3)
    const valeur = debut + (fin - debut) * ease
    refCible.value = valeur.toFixed(decimales)
    if (t < 1) requestAnimationFrame(tick)
    else refCible.value = fin.toFixed(decimales)
  }
  requestAnimationFrame(tick)
}

function cyclerCandidat() {
  const ancien = candidatsDemo[candidatIndex.value]
  rechercheEnCours.value = true
  setTimeout(() => {
    candidatIndex.value = (candidatIndex.value + 1) % candidatsDemo.length
    const nouveau = candidatsDemo[candidatIndex.value]
    rechercheEnCours.value = false
    animerNombre(distanceAffichee, ancien.distance, nouveau.distance, 1)
    animerNombre(delaiAffiche, ancien.delai, nouveau.delai, 0)
  }, 1100)
}

// ── SECTION "DEVENEZ COURSIÈRE" : démo du parcours réel d'une course ──
const tarifsCoursiere = ref({ unitePrixStandardVendeuse: 500, unitePrixPremiumVendeuse: 1000, quotaStandard: 10, quotaPremium: 15 })
const profilActif = ref('standard')

const etapesDemo = [
  { cle: 'notif', icon: '🔔', titre: 'Nouvelle course disponible', texte: "Marché d'Adjamé · 2,5 km", image: 'https://images.unsplash.com/photo-1653762379954-8943c787e78b?w=500&h=650&fit=crop&q=80' },
  { cle: 'acceptee', icon: '✅', titre: 'Course acceptée', texte: 'Cliente : Fatou D. · Liste reçue', image: 'https://images.unsplash.com/photo-1758600587355-fb8e9d5db5db?w=500&h=650&fit=crop&crop=focalpoint&fp-x=0.35&fp-y=0.5&q=80' },
  { cle: 'route', icon: '🛵', titre: 'En route vers le marché', texte: 'Position GPS partagée en direct', image: 'https://images.unsplash.com/photo-1653725565489-dfddc2b4cbf0?w=500&h=650&fit=crop&q=80' },
  { cle: 'gain', icon: '💰', titre: 'Course livrée', texte: 'Gain crédité sur votre compte', image: 'https://images.unsplash.com/photo-1743807059700-1d4d97003972?w=500&h=650&fit=crop&q=80' }
]
const etapeDemoIndex = ref(0)
const etapeDemoActuelle = computed(() => etapesDemo[etapeDemoIndex.value])
const DUREE_ETAPE_DEMO = 3200
const timerRingKey = ref(0)
let demoInterval = null

function avancerDemo() {
  etapeDemoIndex.value = (etapeDemoIndex.value + 1) % etapesDemo.length
  timerRingKey.value++
}

const stats = [
  { val: '6', label: 'Marchés couverts' },
  { val: '2', label: 'Modes de livraison' },
  { val: '100%', label: 'Paiement sécurisé' }
]

const steps = [
  {
    num: '01',
    icon: '🔍',
    titre: 'Cherchez une coursière',
    desc: 'Tapez votre besoin, choisissez votre marché. Le système trouve la meilleure coursière disponible dans votre commune.',
    action: 'chercher une coursière',
    cta: 'Commencer'
  },
  {
    num: '02',
    icon: '💬',
    titre: 'Échangez et payez',
    desc: 'Discutez via le tchat intégré, précisez votre liste. Payez via Mobile Money en toute sécurité.',
    action: 'échanger avec une coursière',
    cta: 'Créer un compte'
  },
  {
    num: '03',
    icon: '🏠',
    titre: 'Recevez à domicile',
    desc: 'Votre coursière fait les achats et vous livre. Produits frais garantis, directement du marché.',
    action: 'recevoir votre marché',
    cta: 'Commander maintenant'
  }
]

const marches = ref([
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🏪' },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🛒' },
  { nom: "Marché d'Adjamé", commune: 'Adjamé', icon: '🏪' },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒' },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪' },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒' }
])

const whys = [
  { icon: '👩🏾', titre: 'Femmes du quartier', desc: 'Nos coursières connaissent les marchés, les vendeurs et les meilleurs prix. Une expertise locale unique.' },
  { icon: '🔒', titre: 'Paiement sécurisé', desc: 'Votre argent est protégé via Mobile Money. Les fonds transitent par la plateforme en toute transparence.' },
  { icon: '⚡', titre: 'Livraison rapide', desc: 'Grâce à la géolocalisation, on assigne la coursière la plus proche pour minimiser les délais.' },
  { icon: '💬', titre: 'Communication directe', desc: 'Tchat et appel intégrés pour coordonner avec votre coursière sans exposer vos numéros personnels.' }
]
</script>

<style scoped>
.t-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: white;
}
.t-btn.green { background: #1D9E75; }
.t-btn.red { background: #dc2626; }
.t-btn.amber { background: #f59e0b; }
.t-btn.blue { background: #3b82f6; }

/* ── MODALE ── */
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
.modal {
  background: white;
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  animation: modalIn 0.25s ease;
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
  transition: all 0.2s;
}
.modal-close:hover { background: var(--bordure); }
.modal-icon { font-size: 44px; margin-bottom: 16px; display: block; }
.modal h3 { font-size: 20px; font-weight: 800; color: var(--texte); margin-bottom: 10px; }
.modal p { font-size: 14px; color: var(--texte-sec); margin-bottom: 28px; line-height: 1.6; }
.modal-btns { display: flex; flex-direction: column; gap: 12px; }
.modal-btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  border-radius: var(--radius);
  text-align: center;
  font-weight: 600;
}

/* ── HERO ── */
.hero {
  background: linear-gradient(135deg, var(--vert-dark) 0%, var(--vert) 100%);
  padding: 90px 0 80px;
  color: white;
  overflow: hidden;
}
.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  flex-wrap: wrap;
}
.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  margin-bottom: 20px;
}
.hero-text h1 {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 18px;
  max-width: 540px;
}
.hero-text h1 span { color: #9FE1CB; }
.hero-text p {
  font-size: 17px;
  opacity: 0.88;
  margin-bottom: 36px;
  max-width: 480px;
  line-height: 1.7;
}
.hero-btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
.btn-hero-primary {
  background: white;
  color: var(--vert-dark);
  padding: 14px 28px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  transition: all 0.2s;
  display: inline-block;
  border: none;
  cursor: pointer;
}
.btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.btn-hero-outline {
  background: transparent;
  color: white;
  padding: 14px 28px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  border: 1.5px solid rgba(255,255,255,0.5);
  transition: all 0.2s;
  display: inline-block;
  cursor: pointer;
}
.btn-hero-outline:hover { background: rgba(255,255,255,0.1); }
.hero-stats { display: flex; gap: 32px; }
.stat { display: flex; flex-direction: column; }
.stat-val { font-size: 24px; font-weight: 800; }
.stat-label { font-size: 12px; opacity: 0.7; margin-top: 2px; }

/* VISUAL */
.hero-visual { position: relative; flex-shrink: 0; }
.visual-card {
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 16px;
  padding: 18px 20px;
  color: white;
}
.main-card { width: 280px; }
.visual-header { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 14px; opacity: 0.85; }
.radar-wrap { position: relative; width: 8px; height: 8px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pulse { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; display: inline-block; position: relative; z-index: 1; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
.radar-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #4ade80; animation: radarSweep 1.8s ease-out infinite; }
.radar-ring.delay { animation-delay: 0.6s; }
@keyframes radarSweep { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(6); opacity: 0; } }
.visual-coursiere { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; min-height: 40px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.avatar.skel { background: rgba(255,255,255,0.12); animation: shimmer 1.2s ease-in-out infinite; }
.skel-line { height: 10px; border-radius: 4px; background: rgba(255,255,255,0.14); animation: shimmer 1.2s ease-in-out infinite; margin: 0 0 6px; }
.skel-line.w1 { width: 110px; }
.skel-line.w2 { width: 80px; height: 8px; opacity: 0.8; }
@keyframes shimmer { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
.candidat-swap-enter-active, .candidat-swap-leave-active { transition: all 0.35s ease; }
.candidat-swap-enter-from { opacity: 0; transform: translateX(10px); }
.candidat-swap-leave-to { opacity: 0; transform: translateX(-10px); }
.c-name { font-size: 14px; font-weight: 600; margin: 0 0 2px; }
.c-info { font-size: 12px; opacity: 0.7; margin: 0; }
.dispo-badge { margin-left: auto; background: #4ade80; color: #065f46; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.visual-marche { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 12px; font-size: 13px; }
.dist { margin-left: auto; opacity: 0.7; font-size: 12px; }
.mini-card { position: absolute; display: flex; align-items: center; gap: 10px; padding: 12px 16px; font-size: 13px; }
.mini-card span:first-child { font-size: 22px; }
.mini-card p:first-child { font-weight: 600; font-size: 13px; margin: 0 0 2px; }
.mini-card p:last-child { font-size: 11px; opacity: 0.7; margin: 0; }
.mini-card.left { bottom: -20px; left: -40px; width: 180px; }
.mini-card.right { top: -20px; right: -30px; width: 160px; }

/* ── HOW ── */
.how { padding: 90px 0; background: var(--fond); }
.section-head { text-align: center; margin-bottom: 52px; }
.section-tag { display: inline-block; background: var(--vert-light); color: var(--vert-dark); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.section-head h2 { font-size: 32px; font-weight: 800; color: var(--texte); margin-bottom: 10px; }
.section-head p { font-size: 16px; color: var(--texte-sec); }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.step {
  background: white;
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: var(--shadow);
  border: 1.5px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}
.step:hover, .step.active {
  border-color: var(--vert);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(29,158,117,0.15);
}
.step-icon { font-size: 36px; margin-bottom: 12px; display: block; }
.step-num { font-size: 13px; font-weight: 700; color: var(--vert); letter-spacing: 1px; margin-bottom: 10px; }
.step h3 { font-size: 18px; font-weight: 700; color: var(--texte); margin-bottom: 10px; }
.step p { font-size: 14px; color: var(--texte-sec); line-height: 1.7; margin-bottom: 16px; }
.step-cta { font-size: 13px; font-weight: 700; color: var(--vert); display: inline-block; transition: transform 0.2s; }
.step:hover .step-cta { transform: translateX(4px); }

/* ── MARCHÉS ── */
.marches { padding: 90px 0; background: white; }
.marches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.marche-card {
  background: var(--fond);
  border: 1.5px solid var(--bordure);
  border-radius: 14px;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.25s;
  cursor: pointer;
  position: relative;
}
.marche-card:hover, .marche-card.hovered {
  border-color: var(--vert);
  background: var(--vert-light);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(29,158,117,0.12);
}
.marche-icon { font-size: 32px; display: block; margin-bottom: 10px; }
.marche-nom { font-weight: 700; font-size: 14px; color: var(--texte); margin: 0 0 4px; }
.marche-commune { font-size: 12px; color: var(--texte-sec); margin: 0 0 10px; }
.marche-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }

/* ── DEVENIR COURSIÈRE ── */
.devenir { padding: 90px 0; background: var(--fond); }
.devenir-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 860px; margin: 0 auto; align-items: stretch; }
@media (max-width: 760px) { .devenir-grid { grid-template-columns: 1fr; } }

/* Démo téléphone — photo plein cadre façon story */
.demo-phone-wrap { display: flex; flex-direction: column; align-items: center; }
.demo-phone {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(29,158,117,0.22);
  background: linear-gradient(160deg, var(--vert-dark) 0%, var(--vert) 100%);
}
.demo-progress-row { position: absolute; top: 14px; left: 14px; right: 14px; display: flex; gap: 6px; z-index: 3; }
.demo-progress-seg { flex: 1; height: 3px; border-radius: 3px; background: rgba(255,255,255,0.35); overflow: hidden; }
.demo-progress-fill { height: 100%; width: 0%; background: white; border-radius: 3px; }
.demo-progress-fill.filled { width: 100%; }
@keyframes progressFill { from { width: 0%; } to { width: 100%; } }
.demo-etape-photo {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.demo-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.2) 48%, transparent 72%);
}
.demo-badge-float {
  position: absolute; top: 32px; right: 16px; z-index: 2;
  width: 40px; height: 40px; border-radius: 50%;
  background: white; display: flex; align-items: center; justify-content: center;
  font-size: 19px; box-shadow: 0 4px 12px rgba(0,0,0,0.28);
}
.demo-texte-bas { position: relative; z-index: 2; padding: 20px; color: white; text-align: left; }
.demo-titre { font-size: 17px; font-weight: 800; margin: 0 0 4px; }
.demo-texte { font-size: 13px; opacity: 0.85; margin: 0; }
.demo-swap-enter-active, .demo-swap-leave-active { transition: opacity 0.35s ease; }
.demo-swap-enter-from, .demo-swap-leave-to { opacity: 0; }
.demo-legende { font-size: 11px; color: var(--texte-sec); margin: 14px 0 0; }

/* Carte tarifs */
.tarifs-card {
  background: white;
  border-radius: 20px;
  padding: 26px 24px;
  box-shadow: var(--shadow);
  border: 1px solid var(--bordure);
  display: flex;
  flex-direction: column;
}
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
.tarif-contenu { flex: 1; }
.tarif-prix { font-size: 28px; font-weight: 800; color: var(--vert-dark); margin: 0 0 18px; }
.tarif-prix span { font-size: 14px; font-weight: 600; color: var(--texte-sec); }
.tarif-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.tarif-features li { font-size: 14px; color: var(--texte); display: flex; align-items: center; gap: 8px; }
.tarif-swap-enter-active, .tarif-swap-leave-active { transition: all 0.25s ease; }
.tarif-swap-enter-from { opacity: 0; transform: translateX(8px); }
.tarif-swap-leave-to { opacity: 0; transform: translateX(-8px); }
.tarif-cta { width: 100%; margin-top: 22px; }

/* ── WHY ── */
.why { padding: 90px 0; background: white; }
.why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.why-card { background: var(--fond); border-radius: 14px; padding: 28px; border: 0.5px solid var(--bordure); transition: all 0.2s; }
.why-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--vert); }
.why-icon { font-size: 36px; display: block; margin-bottom: 14px; }
.why-card h3 { font-size: 16px; font-weight: 700; color: var(--texte); margin-bottom: 8px; }
.why-card p { font-size: 14px; color: var(--texte-sec); line-height: 1.7; }

/* ── CTA ── */
.cta { background: linear-gradient(135deg, var(--vert-dark) 0%, var(--vert) 100%); padding: 80px 0; }
.cta-inner { text-align: center; }
.cta h2 { font-size: 34px; font-weight: 800; color: white; margin-bottom: 12px; }
.cta p { font-size: 17px; color: rgba(255,255,255,0.85); margin-bottom: 36px; }
.cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
</style>