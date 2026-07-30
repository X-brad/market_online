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
              <span class="pulse"></span>
              <span>Coursière disponible</span>
            </div>
            <div class="visual-coursiere">
              <div class="avatar">AK</div>
              <div>
                <p class="c-name">Amara Koné</p>
                <p class="c-info">Marché Adjamé · ⭐ 4.9</p>
              </div>
              <span class="dispo-badge">Dispo</span>
            </div>
            <div class="visual-marche">
              <span>🏪</span>
              <span>Marché d'Adjamé</span>
              <span class="dist">~1.2 km</span>
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
              <p>~35 min</p>
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

    <!-- PROFILS COURSIÈRES -->
    <section class="profiles">
      <div class="container">
        <div class="section-head">
          <span class="section-tag">Nos coursières</span>
          <h2>Standard ou Premium</h2>
          <p>Choisissez le niveau de service qui vous convient</p>
        </div>
        <div class="profiles-grid">
          <div
            class="profile-card"
            v-for="p in profiles"
            :key="p.titre"
            @click="ouvrirModal('rejoindre comme coursière ' + p.titre)"
          >
            <div class="profile-header" :class="p.classe">
              <span class="profile-icon">{{ p.icon }}</span>
              <h3>{{ p.titre }}</h3>
              <p>{{ p.prix }}</p>
            </div>
            <ul class="profile-features">
              <li v-for="f in p.features" :key="f">✓ {{ f }}</li>
            </ul>
            <div class="profile-cta">Rejoindre en tant que coursière →</div>
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
import { ref } from 'vue'
import { useToastStore } from '../stores/toast'

const toast = useToastStore()
const activeStep = ref(0)
const hoveredMarche = ref(null)
const showModal = ref(false)
const modalAction = ref('')

function ouvrirModal(action) {
  modalAction.value = action
  showModal.value = true
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

const marches = [
  { nom: 'Marché de Cocody', commune: 'Cocody', icon: '🏪' },
  { nom: 'Cocovico', commune: 'Cocody', icon: '🛒' },
  { nom: "Marché d'Adjamé", commune: 'Adjamé', icon: '🏪' },
  { nom: 'Marché de Treichville', commune: 'Treichville', icon: '🛒' },
  { nom: 'Marché de Koumassi', commune: 'Koumassi', icon: '🏪' },
  { nom: 'Marché de Bingerville', commune: 'Bingerville', icon: '🛒' }
]

const profiles = [
  {
    titre: 'Standard',
    prix: '500 F CFA / jour',
    icon: '⭐',
    classe: 'standard',
    features: [
      '10 courses par jour',
      'Visibilité normale',
      'Marché le plus proche',
      'Tchat intégré'
    ]
  },
  {
    titre: 'Premium',
    prix: '1 000 F CFA / jour',
    icon: '💎',
    classe: 'premium',
    features: [
      '15 courses par jour',
      'Visibilité prioritaire',
      'Tout marché au choix',
      'Tchat + appel intégré'
    ]
  }
]

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
.pulse { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1.5s infinite; display: inline-block; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
.visual-coursiere { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
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

/* ── PROFILES ── */
.profiles { padding: 90px 0; background: var(--fond); }
.profiles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 700px; margin: 0 auto; }
.profile-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
}
.profile-card:hover { border-color: var(--vert); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(29,158,117,0.15); }
.profile-header { padding: 28px; text-align: center; }
.profile-header.standard { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.profile-header.premium { background: linear-gradient(135deg, var(--vert-light), #9FE1CB); }
.profile-icon { font-size: 36px; display: block; margin-bottom: 10px; }
.profile-header h3 { font-size: 22px; font-weight: 800; color: var(--vert-dark); margin: 0 0 6px; }
.profile-header p { font-size: 15px; color: var(--vert); font-weight: 600; margin: 0; }
.profile-features { list-style: none; padding: 24px 28px 16px; display: flex; flex-direction: column; gap: 12px; }
.profile-features li { font-size: 14px; color: var(--texte); display: flex; align-items: center; gap: 8px; }
.profile-cta { text-align: center; padding: 16px 28px 24px; font-size: 13px; font-weight: 700; color: var(--vert); }

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