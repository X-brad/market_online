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
    <section id="comment-ca-marche" class="how">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-tag">Simple & rapide</span>
          <h2>Comment ça marche ?</h2>
          <p>3 étapes pour recevoir votre marché à domicile</p>
        </div>
        <div class="steps reveal">
          <div
            v-for="(s, i) in steps"
            :key="s.titre"
            class="step"
            :class="{ active: activeStep === i }"
            @mouseenter="activeStep = i"
            @mouseleave="activeStep = 0"
            @click="ouvrirModal(s.action)"
          >
            <div class="step-top">
              <span class="step-icon-badge" :class="s.svg">
                <svg v-if="s.svg === 'search'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>
                <svg v-else-if="s.svg === 'chat'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.1-.6L3 21l1.7-5.1A8.4 8.4 0 0 1 3.5 12 8.4 8.4 0 0 1 12 3.6a8.4 8.4 0 0 1 9 7.9Z"/></svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-7 9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>
              </span>
              <span class="step-num">{{ s.num }}</span>
            </div>
            <h3>{{ s.titre }}</h3>
            <p>{{ s.desc }}</p>
            <span class="step-cta">{{ s.cta }} →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MARCHÉS -->
    <section id="marches" class="marches">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-tag">Couverture</span>
          <h2>Marchés disponibles</h2>
          <p>Les marchés reconnus d'Abidjan, couverts dès le lancement</p>
        </div>
        <div class="marches-grid reveal">
          <div
            class="marche-card"
            v-for="(m, i) in marches"
            :key="m.nom"
            @mouseenter="hoveredMarche = m.nom"
            @mouseleave="hoveredMarche = null"
            :class="{ hovered: hoveredMarche === m.nom }"
            @click="ouvrirModal('commander au ' + m.nom)"
          >
            <div class="marche-photo" :style="{ backgroundImage: 'url(' + marchePhotos[i % marchePhotos.length] + ')' }">
              <span class="marche-icon-badge">{{ m.icon }}</span>
            </div>
            <div class="marche-info">
              <p class="marche-nom">{{ m.nom }}</p>
              <p class="marche-commune">📍 {{ m.commune }}</p>
              <span class="marche-badge">Actif</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TÉMOIGNAGES -->
    <section class="temoignages reveal" v-if="temoignages.length > 0">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Ils nous font confiance</span>
          <h2>Ce que disent nos clients</h2>
        </div>
        <div class="temoignages-grid">
          <div class="temoignage-card" v-for="t in temoignages" :key="t._id">
            <p class="temoignage-texte">"{{ t.texte }}"</p>
            <div class="temoignage-auteur">
              <div class="temoignage-avatar">
                <img v-if="t.photoUrl" :src="apiOrigin + t.photoUrl" :alt="t.nomClient" />
                <span v-else>{{ initialesTemoignage(t.nomClient) }}</span>
              </div>
              <p>{{ t.nomClient }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- POURQUOI NOUS -->
    <section class="why">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-tag">Nos engagements</span>
          <h2>Pourquoi Achètlà ?</h2>
        </div>
        <div class="why-grid reveal">
          <div class="why-card" v-for="w in whys" :key="w.titre">
            <span class="why-icon-badge" :class="w.svg">
              <svg v-if="w.svg === 'community'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="10" cy="7" r="3.2"/><path d="M22 20v-1a3.5 3.5 0 0 0-2.5-3.35"/><path d="M15.5 3.65a3.5 3.5 0 0 1 0 6.7"/></svg>
              <svg v-else-if="w.svg === 'shield'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 5 6v6c0 4.6 3 7.9 7 9 4-1.1 7-4.4 7-9V6l-7-2.8Z"/><path d="m9.2 12.3 2 2 3.6-4"/></svg>
              <svg v-else-if="w.svg === 'bolt'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.1-.6L3 21l1.7-5.1A8.4 8.4 0 0 1 3.5 12 8.4 8.4 0 0 1 12 3.6a8.4 8.4 0 0 1 9 7.9Z"/></svg>
            </span>
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
        <p>Rejoignez les familles d'Abidjan qui font confiance à Achètlà</p>
        <div class="cta-btns">
          <button class="btn-hero-primary" @click="ouvrirModal('commander')">Créer un compte gratuit</button>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToastStore } from '../stores/toast'
import api from '../api/axios.js'

const toast = useToastStore()
const apiOrigin = api.defaults.baseURL.replace(/\/api\/?$/, '')
const activeStep = ref(0)
const hoveredMarche = ref(null)
const showModal = ref(false)
const modalAction = ref('')
const temoignages = ref([])
let observer = null

onMounted(async () => {
  try {
    const res = await api.get('/marches', { params: { actif: true } })
    if (res.data.marches.length > 0) marches.value = res.data.marches
  } catch (err) {
    console.error('Erreur marchés:', err)
  }
  try {
    const res = await api.get('/temoignages')
    temoignages.value = res.data.temoignages
  } catch (err) {
    console.error('Erreur témoignages:', err)
  }
  heroInterval = setInterval(cyclerCandidat, 4500)

  await nextTick()
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
})

onUnmounted(() => {
  clearInterval(heroInterval)
  observer?.disconnect()
})

function initialesTemoignage(nom) {
  return nom.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

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

const stats = [
  { val: '6', label: 'Marchés couverts' },
  { val: '2', label: 'Modes de livraison' },
  { val: '100%', label: 'Paiement sécurisé' }
]

const steps = [
  {
    num: '01',
    svg: 'search',
    titre: 'Cherchez une coursière',
    desc: 'Tapez votre besoin, choisissez votre marché. Le système trouve la meilleure coursière disponible dans votre commune.',
    action: 'chercher une coursière',
    cta: 'Commencer'
  },
  {
    num: '02',
    svg: 'chat',
    titre: 'Échangez et payez',
    desc: 'Discutez via le tchat intégré, précisez votre liste. Payez via Mobile Money en toute sécurité.',
    action: 'échanger avec une coursière',
    cta: 'Créer un compte'
  },
  {
    num: '03',
    svg: 'home',
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

const marchePhotos = [
  'https://images.unsplash.com/photo-1489450278009-822e9be04dff?w=500&h=380&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609126986933-e3c84f19d49c?w=500&h=380&fit=crop&q=80',
  'https://images.unsplash.com/photo-1458917524587-d3236cc8c2c8?w=500&h=380&fit=crop&q=80',
  'https://images.unsplash.com/photo-1553787434-45e1d245bfbb?w=500&h=380&fit=crop&q=80'
]

const whys = [
  { svg: 'community', titre: 'Femmes du quartier', desc: 'Nos coursières connaissent les marchés, les vendeurs et les meilleurs prix. Une expertise locale unique.' },
  { svg: 'shield', titre: 'Paiement sécurisé', desc: 'Votre argent est protégé via Mobile Money. Les fonds transitent par la plateforme en toute transparence.' },
  { svg: 'bolt', titre: 'Livraison rapide', desc: 'Grâce à la géolocalisation, on assigne la coursière la plus proche pour minimiser les délais.' },
  { svg: 'chat', titre: 'Communication directe', desc: 'Tchat et appel intégrés pour coordonner avec votre coursière sans exposer vos numéros personnels.' }
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
  background:
    linear-gradient(115deg, rgba(8,80,65,0.92) 0%, rgba(8,80,65,0.75) 42%, rgba(8,80,65,0.35) 100%),
    url('https://images.unsplash.com/photo-1585540083814-ea6ee8af9e4f?w=1600&h=1000&fit=crop&q=80') center/cover;
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
  background: rgba(255,255,255,0.16);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 16px;
  padding: 18px 20px;
  color: white;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
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
.step-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.step-icon-badge {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--vert-light); color: var(--vert-dark);
  transition: all 0.3s;
}
.step-icon-badge.chat { background: var(--dore-light); color: var(--dore-dark); }
.step:hover .step-icon-badge, .step.active .step-icon-badge { background: var(--vert); color: white; }
.step-num { font-size: 24px; font-weight: 800; color: var(--bordure); letter-spacing: -0.5px; }
.step:hover .step-num, .step.active .step-num { color: var(--vert-light); }
.step h3 { font-size: 18px; font-weight: 700; color: var(--texte); margin-bottom: 10px; }
.step p { font-size: 14px; color: var(--texte-sec); line-height: 1.7; margin-bottom: 16px; }
.step-cta { font-size: 13px; font-weight: 700; color: var(--vert); display: inline-block; transition: transform 0.2s; }
.step:hover .step-cta { transform: translateX(4px); }

/* ── MARCHÉS ── */
.marches { padding: 90px 0; background: white; }
.marches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.marche-card {
  background: var(--fond);
  border: 1.5px solid var(--bordure);
  border-radius: 16px;
  overflow: hidden;
  text-align: center;
  transition: all 0.25s;
  cursor: pointer;
  position: relative;
}
.marche-card:hover, .marche-card.hovered {
  border-color: var(--vert);
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(29,158,117,0.15);
}
.marche-photo { position: relative; aspect-ratio: 4/3; background-size: cover; background-position: center; }
.marche-icon-badge {
  position: absolute; top: 10px; left: 10px;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; font-size: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.marche-info { padding: 16px 18px 20px; }
.marche-nom { font-weight: 700; font-size: 14px; color: var(--texte); margin: 0 0 4px; }
.marche-commune { font-size: 12px; color: var(--texte-sec); margin: 0 0 10px; }
.marche-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }

/* ── TÉMOIGNAGES ── */
.temoignages { padding: 90px 0; background: var(--ivoire); }
.temoignages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.temoignage-card { background: white; border-radius: 16px; padding: 28px; box-shadow: var(--shadow); border: 0.5px solid var(--bordure); }
.temoignage-texte { font-size: 15px; color: var(--texte); font-style: italic; line-height: 1.7; margin: 0 0 20px; }
.temoignage-auteur { display: flex; align-items: center; gap: 12px; }
.temoignage-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--vert-light); color: var(--vert-dark); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.temoignage-avatar img { width: 100%; height: 100%; object-fit: cover; }
.temoignage-auteur p { font-size: 14px; font-weight: 700; color: var(--texte); margin: 0; }

/* ── WHY ── */
.why { padding: 90px 0; background: white; }
.why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
.why-card { background: var(--fond); border-radius: 14px; padding: 28px; border: 0.5px solid var(--bordure); transition: all 0.2s; }
.why-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); border-color: var(--vert); }
.why-icon-badge {
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px; background: var(--vert-light); color: var(--vert-dark);
}
.why-icon-badge.shield { background: var(--dore-light); color: var(--dore-dark); }
.why-icon-badge.chat { background: var(--dore-light); color: var(--dore-dark); }
.why-card h3 { font-size: 16px; font-weight: 700; color: var(--texte); margin-bottom: 8px; }
.why-card p { font-size: 14px; color: var(--texte-sec); line-height: 1.7; }

/* ── CTA ── */
.cta { background: linear-gradient(135deg, var(--vert-dark) 0%, var(--vert) 100%); padding: 80px 0; }
.cta-inner { text-align: center; }
.cta h2 { font-size: 34px; font-weight: 800; color: white; margin-bottom: 12px; }
.cta p { font-size: 17px; color: rgba(255,255,255,0.85); margin-bottom: 36px; }
.cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

/* ── SCROLL REVEAL ── */
.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.revealed { opacity: 1; transform: none; }
</style>