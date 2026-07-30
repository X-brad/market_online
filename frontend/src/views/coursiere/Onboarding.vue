 <template>
  <div class="onboarding">
    <div class="container">

      <!-- HEADER -->
      <div class="ob-header">
        <div class="ob-logo">🛍️ MamiMarché</div>
        <h1>Bienvenue {{ authStore.user?.prenom }} ! 👋</h1>
        <p>Suivez ces étapes pour commencer à recevoir des courses</p>
        <div class="ob-progress">
          <div class="ob-progress-bar" :style="{ width: progression + '%' }"></div>
        </div>
        <span class="ob-progress-label">{{ etapesFaites }} / {{ etapes.length }} étapes complétées</span>
      </div>

      <!-- ÉTAPES -->
      <div class="ob-etapes">
        <div
          v-for="(e, i) in etapes"
          :key="e.id"
          class="ob-etape"
          :class="{ done: e.faite, active: i === etapeActive }"
        >
          <div class="ob-etape-left">
            <div class="ob-etape-dot" :class="{ done: e.faite, active: i === etapeActive }">
              <span v-if="e.faite">✓</span>
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div class="ob-etape-line" v-if="i < etapes.length - 1" :class="{ done: e.faite }"></div>
          </div>
          <div class="ob-etape-content">
            <div class="ob-etape-header">
              <span class="ob-etape-icon">{{ e.icon }}</span>
              <div>
                <h3>{{ e.titre }}</h3>
                <p>{{ e.desc }}</p>
              </div>
              <span class="ob-done-badge" v-if="e.faite">✓ Fait</span>
            </div>
            <div class="ob-etape-action" v-if="!e.faite && i === etapeActive">
              <button class="btn-action" @click="completerEtape(i)">
                {{ e.btnLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TERMINÉ -->
      <div class="ob-termine" v-if="etapesFaites === etapes.length">
        <div class="ob-termine-icon">🎉</div>
        <h2>Vous êtes prête !</h2>
        <p>Votre profil est configuré. Vous pouvez maintenant recevoir des courses sur MamiMarché.</p>
        <button class="btn-dashboard" @click="allerDashboard">
          Accéder à mon dashboard →
        </button>
      </div>

      <!-- SKIP -->
      <div class="ob-skip" v-if="etapesFaites < etapes.length">
        <button @click="allerDashboard">Passer cette étape pour l'instant →</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'

const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const etapeActive = computed(() => etapes.value.findIndex(e => !e.faite))

const etapes = ref([
  {
    id: 1,
    icon: '✅',
    titre: 'Compte créé avec succès',
    desc: 'Votre compte coursière a été créé. En attente de validation par l\'administrateur.',
    btnLabel: '',
    faite: true
  },
  {
    id: 2,
    icon: '💰',
    titre: 'Acheter vos unités journalières',
    desc: 'Achetez des unités pour être visible sur la plateforme et recevoir des courses aujourd\'hui.',
    btnLabel: '💳 Acheter mes unités via Wave',
    faite: false
  },
  {
    id: 3,
    icon: '📍',
    titre: 'Définir votre marché de prédilection',
    desc: 'Choisissez le ou les marchés où vous opérez pour recevoir des courses pertinentes.',
    btnLabel: '🏪 Choisir mon marché',
    faite: false
  },
  {
    id: 4,
    icon: '🟢',
    titre: 'Activer votre statut disponible',
    desc: 'Passez en mode disponible pour apparaître dans les résultats de recherche des clients.',
    btnLabel: '🟢 Me mettre disponible',
    faite: false
  },
  {
    id: 5,
    icon: '⭐',
    titre: 'Compléter votre profil',
    desc: 'Ajoutez une photo et une description pour inspirer confiance aux clients.',
    btnLabel: '👤 Compléter mon profil',
    faite: false
  }
])

const etapesFaites = computed(() => etapes.value.filter(e => e.faite).length)
const progression = computed(() => (etapesFaites.value / etapes.value.length) * 100)

function completerEtape(i) {
  etapes.value[i].faite = true
  const messages = [
    '',
    '💰 Unités achetées ! Vous êtes maintenant visible.',
    '🏪 Marché défini avec succès !',
    '🟢 Vous êtes maintenant disponible !',
    '⭐ Profil complété !'
  ]
  toast.success(messages[i] || 'Étape complétée !')

  if (etapesFaites.value === etapes.value.length) {
    setTimeout(() => toast.success('🎉 Félicitations ! Vous êtes prête à recevoir des courses !'), 1000)
  }
}

function allerDashboard() {
  router.push('/coursiere/dashboard')
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: var(--fond);
  padding: 40px 0 60px;
}

/* HEADER */
.ob-header {
  text-align: center;
  margin-bottom: 48px;
}
.ob-logo {
  font-size: 20px;
  font-weight: 800;
  color: var(--vert-dark);
  margin-bottom: 20px;
}
.ob-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--texte);
  margin-bottom: 8px;
}
.ob-header p {
  font-size: 15px;
  color: var(--texte-sec);
  margin-bottom: 24px;
}
.ob-progress {
  max-width: 400px;
  margin: 0 auto 8px;
  height: 8px;
  background: var(--bordure);
  border-radius: 4px;
  overflow: hidden;
}
.ob-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--vert-dark), var(--vert));
  border-radius: 4px;
  transition: width 0.5s ease;
}
.ob-progress-label {
  font-size: 13px;
  color: var(--texte-sec);
  font-weight: 600;
}

/* ÉTAPES */
.ob-etapes {
  max-width: 680px;
  margin: 0 auto 32px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.ob-etape {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  opacity: 0.5;
  transition: all 0.3s;
}
.ob-etape.done, .ob-etape.active { opacity: 1; }
.ob-etape-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.ob-etape-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bordure);
  color: var(--texte-sec);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s;
}
.ob-etape-dot.done { background: var(--vert); color: white; }
.ob-etape-dot.active { background: var(--vert-dark); color: white; box-shadow: 0 0 0 4px rgba(29,158,117,0.2); }
.ob-etape-line {
  width: 2px;
  flex: 1;
  background: var(--bordure);
  margin: 6px 0;
  min-height: 20px;
  transition: background 0.3s;
}
.ob-etape-line.done { background: var(--vert); }
.ob-etape-content {
  flex: 1;
  padding-bottom: 20px;
}
.ob-etape-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.ob-etape-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
.ob-etape-header h3 { font-size: 16px; font-weight: 700; color: var(--texte); margin: 0 0 4px; }
.ob-etape-header p { font-size: 13px; color: var(--texte-sec); margin: 0; line-height: 1.5; }
.ob-done-badge {
  margin-left: auto;
  background: var(--vert-light);
  color: var(--vert-dark);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.ob-etape-action { padding-left: 36px; }
.btn-action {
  padding: 12px 24px;
  background: var(--vert);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-action:hover { background: var(--vert-dark); transform: translateY(-1px); }

/* TERMINÉ */
.ob-termine {
  text-align: center;
  padding: 40px 24px;
  background: white;
  border-radius: 20px;
  border: 2px solid var(--vert);
  max-width: 480px;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(29,158,117,0.15);
}
.ob-termine-icon {
  font-size: 56px;
  display: block;
  margin-bottom: 16px;
  animation: bounce 0.6s ease;
}
@keyframes bounce { 0%{transform:scale(0)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
.ob-termine h2 { font-size: 24px; font-weight: 800; color: var(--vert-dark); margin-bottom: 10px; }
.ob-termine p { font-size: 14px; color: var(--texte-sec); margin-bottom: 24px; line-height: 1.6; }
.btn-dashboard {
  padding: 14px 32px;
  background: var(--vert);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-dashboard:hover { background: var(--vert-dark); transform: translateY(-1px); }

/* SKIP */
.ob-skip {
  text-align: center;
  max-width: 680px;
  margin: 0 auto;
}
.ob-skip button {
  background: none;
  border: none;
  color: var(--texte-sec);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.ob-skip button:hover { color: var(--texte); }
</style>
