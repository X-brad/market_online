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
        <p class="ob-unites-reminder" v-if="unitesSautees && !c.unitesActives">💰 N'oubliez pas d'activer vos unités depuis votre dashboard pour recevoir des courses.</p>
      </div>

      <!-- ÉTAPES -->
      <div class="ob-etapes">
        <div
          v-for="(e, i) in etapes"
          :key="e.id"
          class="ob-etape"
          :class="{ done: e.faite, active: i === etapeActive, sautee: e.id === 2 && unitesSautees && !e.faite }"
        >
          <div class="ob-etape-left">
            <div class="ob-etape-dot" :class="{ done: e.faite, active: i === etapeActive, sautee: e.id === 2 && unitesSautees && !e.faite }">
              <span v-if="e.faite">✓</span>
              <span v-else-if="e.id === 2 && unitesSautees">⏭</span>
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
              <span class="ob-done-badge sautee" v-else-if="e.id === 2 && unitesSautees">⏭ Plus tard</span>
            </div>

            <!-- Étape 1 : validation admin, aucune action possible, juste une attente -->
            <div class="ob-etape-action" v-if="!e.faite && i === etapeActive && e.id === 1">
              <div class="ob-attente-validation">
                <span class="ob-spinner"></span>
                En attente de validation par l'administrateur…
              </div>
            </div>

            <!-- Étape 2 : achat d'unités (optionnelle, peut être différée au dashboard) -->
            <div class="ob-etape-action ob-unites" v-if="!e.faite && i === etapeActive && e.id === 2 && !unitesSautees">
              <div class="ob-unites-options">
                <div
                  class="ob-unite-option"
                  v-for="u in unitesOptions"
                  :key="u.type"
                  :class="{ selected: uniteChoisie === u.type }"
                  @click="uniteChoisie = u.type"
                >
                  <span class="ob-unite-icon">{{ u.icon }}</span>
                  <p class="ob-unite-type">{{ u.type }}</p>
                  <p class="ob-unite-prix">{{ u.prix }} F / jour</p>
                  <p class="ob-unite-quota">{{ u.quota }} courses max</p>
                </div>
              </div>
              <button class="btn-action" @click="acheterUnites" :disabled="chargementAction">
                🌊 Payer via Wave
              </button>
              <button class="btn-plus-tard" @click="unitesSautees = true">
                Je paierai plus tard, depuis mon dashboard →
              </button>
            </div>

            <!-- Étape 3 : géolocalisation -->
            <div class="ob-etape-action" v-if="!e.faite && i === etapeActive && e.id === 3">
              <button class="btn-action" @click="activerPosition" :disabled="chargementAction">
                {{ chargementAction ? 'Localisation...' : '📍 Activer ma position' }}
              </button>
            </div>

            <!-- Étape 4 : disponible -->
            <div class="ob-etape-action" v-if="!e.faite && i === etapeActive && e.id === 4">
              <button class="btn-action" @click="activerDisponible" :disabled="chargementAction">
                🟢 Me mettre disponible
              </button>
            </div>

            <!-- Étape 5 : profil (photo + description) -->
            <div class="ob-etape-action ob-profil" v-if="!e.faite && i === etapeActive && e.id === 5">
              <div class="ob-profil-photo" @click="!photoPreviewUrl && photoInput?.click()">
                <img v-if="photoPreviewUrl" :src="photoPreviewUrl" :style="{ transform: `rotate(${rotationDegres}deg)` }" class="photo-en-rotation" />
                <img v-else-if="authStore.user?.photoUrl" :src="apiOrigin + authStore.user.photoUrl" />
                <span v-else>📷 Ajouter une photo</span>
              </div>
              <div class="ob-rotate-controls" v-if="photoPreviewUrl">
                <button type="button" class="btn-rotate" @click="rotationDegres = (rotationDegres + 270) % 360" title="Pivoter à gauche">↺</button>
                <button type="button" class="btn-rotate" @click="rotationDegres = (rotationDegres + 90) % 360" title="Pivoter à droite">↻</button>
                <button type="button" class="btn-valider-photo" @click="validerPhotoRotation" :disabled="chargementAction">
                  {{ chargementAction ? 'Envoi...' : '✓ Valider cette photo' }}
                </button>
                <button type="button" class="btn-annuler-photo" @click="annulerPhoto">Annuler</button>
              </div>
              <p class="ob-photo-hint" v-else>Votre photo sera automatiquement recadrée en carré. Vous pourrez la faire pivoter si besoin.</p>
              <textarea
                v-model="description"
                maxlength="500"
                placeholder="Présentez-vous en quelques mots : votre secteur, votre expérience..."
                class="ob-textarea"
              ></textarea>
              <button class="btn-action" @click="enregistrerProfil" :disabled="chargementAction || !authStore.user?.photoUrl || !description.trim()">
                {{ chargementAction ? 'Enregistrement...' : '⭐ Enregistrer mon profil' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <input ref="photoInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden @change="onPhotoChoisie" />

      <!-- TERMINÉ -->
      <div class="ob-termine" v-if="etapesRequisesFaites">
        <div class="ob-termine-icon">🎉</div>
        <h2>Vous êtes prête !</h2>
        <p v-if="c.unitesActives">Votre profil est configuré. Vous pouvez maintenant recevoir des courses sur MamiMarché.</p>
        <p v-else>Votre profil est configuré. Activez vos unités depuis votre dashboard dès que vous êtes prête à recevoir des courses.</p>
        <button class="btn-dashboard" @click="router.push('/coursiere/dashboard')">
          Accéder à mon dashboard →
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import api from '../../api/axios.js'

const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const apiOrigin = api.defaults.baseURL.replace(/\/api\/?$/, '')
const chargementAction = ref(false)
const photoInput = ref(null)
const photoFichier = ref(null)
const photoPreviewUrl = ref(null)
const rotationDegres = ref(0)
const description = ref(authStore.user?.coursiere?.description || '')
const uniteChoisie = ref('Standard')
const unitesSautees = ref(false)

const parametresTarifs = ref({ unitePrixStandardVendeuse: 500, unitePrixPremiumVendeuse: 1000, quotaStandard: 10, quotaPremium: 15 })
const unitesOptions = computed(() => [
  { type: 'Standard', icon: '⭐', prix: parametresTarifs.value.unitePrixStandardVendeuse, quota: parametresTarifs.value.quotaStandard },
  { type: 'Premium', icon: '💎', prix: parametresTarifs.value.unitePrixPremiumVendeuse, quota: parametresTarifs.value.quotaPremium }
])

const c = computed(() => authStore.user?.coursiere || {})

const etapes = computed(() => [
  {
    id: 1,
    icon: '✅',
    titre: 'Validation de votre compte',
    desc: c.value.valide
      ? 'Votre compte coursière a été validé par l\'administrateur.'
      : 'Votre compte coursière a été créé. En attente de validation par l\'administrateur.',
    faite: !!c.value.valide
  },
  {
    id: 2,
    icon: '💰',
    titre: 'Acheter vos unités journalières',
    desc: 'Achetez des unités pour être visible sur la plateforme et recevoir des courses aujourd\'hui.',
    faite: !!c.value.unitesActives
  },
  {
    id: 3,
    icon: '📍',
    titre: 'Activer votre géolocalisation',
    desc: 'Autorisez la position pour que la plateforme calcule votre distance réelle avec les clients.',
    faite: c.value.position?.lat != null
  },
  {
    id: 4,
    icon: '🟢',
    titre: 'Activer votre statut disponible',
    desc: 'Passez en mode disponible pour apparaître dans les résultats de recherche des clients.',
    faite: c.value.statut === 'disponible'
  },
  {
    id: 5,
    icon: '⭐',
    titre: 'Compléter votre profil',
    desc: 'Ajoutez une photo et une description pour inspirer confiance aux clients.',
    faite: !!(authStore.user?.photoUrl && c.value.description)
  }
])

const etapeActive = computed(() => etapes.value.findIndex(e => !e.faite && !(e.id === 2 && unitesSautees.value)))
const etapesFaites = computed(() => etapes.value.filter(e => e.faite).length)
const progression = computed(() => (etapesFaites.value / etapes.value.length) * 100)
const etapesRequisesFaites = computed(() => etapes.value.every(e => e.faite || (e.id === 2 && unitesSautees.value)))

async function rafraichirUser() {
  try {
    const res = await api.get('/auth/moi')
    authStore.mettreAJourUser({ coursiere: res.data.user.coursiere, photoUrl: res.data.user.photoUrl })
  } catch (err) {
    console.error('Erreur rafraîchissement profil:', err)
  }
}

async function chargerTarifs() {
  try {
    const res = await api.get('/parametres/public')
    parametresTarifs.value = res.data
  } catch (err) {
    console.error('Erreur tarifs:', err)
  }
}

async function acheterUnites() {
  chargementAction.value = true
  try {
    await api.put('/coursiere/unites', { type: uniteChoisie.value })
    await rafraichirUser()
    toast.success('💰 Unités achetées ! Vous êtes maintenant visible.')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'achat des unités')
  } finally {
    chargementAction.value = false
  }
}

function activerPosition() {
  if (!navigator.geolocation) {
    toast.error('La géolocalisation n\'est pas disponible sur cet appareil')
    return
  }
  chargementAction.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await api.put('/coursiere/position', { lat: pos.coords.latitude, lng: pos.coords.longitude })
        await rafraichirUser()
        toast.success('📍 Position activée !')
      } catch (err) {
        toast.error('Erreur lors de l\'enregistrement de la position')
      } finally {
        chargementAction.value = false
      }
    },
    () => {
      toast.error('Autorisez la géolocalisation dans votre navigateur pour continuer')
      chargementAction.value = false
    },
    { enableHighAccuracy: true }
  )
}

async function activerDisponible() {
  chargementAction.value = true
  try {
    await api.put('/coursiere/statut', { statut: 'disponible' })
    await rafraichirUser()
    toast.success('🟢 Vous êtes maintenant disponible !')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors du changement de statut')
  } finally {
    chargementAction.value = false
  }
}

function onPhotoChoisie(e) {
  const file = e.target.files[0]
  if (!file) return
  if (photoPreviewUrl.value) URL.revokeObjectURL(photoPreviewUrl.value)
  photoFichier.value = file
  photoPreviewUrl.value = URL.createObjectURL(file)
  rotationDegres.value = 0
}

function annulerPhoto() {
  if (photoPreviewUrl.value) URL.revokeObjectURL(photoPreviewUrl.value)
  photoFichier.value = null
  photoPreviewUrl.value = null
  rotationDegres.value = 0
  if (photoInput.value) photoInput.value.value = ''
}

// Décode le fichier en respectant son orientation EXIF (une photo de téléphone est souvent
// stockée "à plat" avec une métadonnée qui dit comment l'afficher) puis redessine sur un
// canvas pivoté. Sans ça, la rotation manuelle partirait d'une base différente de ce que
// l'utilisatrice voit réellement dans l'aperçu, et le résultat semblerait aléatoire.
async function decoderImageOrientee(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Certains navigateurs plus anciens ne supportent pas l'option, on retombe plus bas
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')) }
    img.src = url
  })
}

async function rotationVersBlob(file, degres) {
  const source = await decoderImageOrientee(file)
  const largeur = source.width ?? source.naturalWidth
  const hauteur = source.height ?? source.naturalHeight
  const swap = degres % 180 !== 0
  const canvas = document.createElement('canvas')
  canvas.width = swap ? hauteur : largeur
  canvas.height = swap ? largeur : hauteur
  const ctx = canvas.getContext('2d')
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(degres * Math.PI / 180)
  ctx.drawImage(source, -largeur / 2, -hauteur / 2)
  if (source.close) source.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Échec de la rotation')), 'image/jpeg', 0.92)
  })
}

async function validerPhotoRotation() {
  if (!photoFichier.value) return
  chargementAction.value = true
  try {
    const blob = rotationDegres.value === 0
      ? photoFichier.value
      : await rotationVersBlob(photoFichier.value, rotationDegres.value)
    const formData = new FormData()
    formData.append('photo', blob, 'photo.jpg')
    const res = await api.post('/coursiere/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    authStore.mettreAJourUser({ photoUrl: res.data.photoUrl })
    toast.success('Photo ajoutée 📸')
    annulerPhoto()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de la photo')
  } finally {
    chargementAction.value = false
  }
}

async function enregistrerProfil() {
  chargementAction.value = true
  try {
    await api.put('/coursiere/profil', { description: description.value.trim() })
    await rafraichirUser()
    toast.success('⭐ Profil complété !')
    setTimeout(() => toast.success('🎉 Félicitations ! Vous êtes prête à recevoir des courses !'), 1000)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement du profil')
  } finally {
    chargementAction.value = false
  }
}

let intervalleValidation = null

onMounted(() => {
  chargerTarifs()
  rafraichirUser()
  intervalleValidation = setInterval(() => {
    if (!c.value.valide) rafraichirUser()
  }, 8000)
})

onUnmounted(() => {
  clearInterval(intervalleValidation)
})
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
.ob-done-badge.sautee { background: #fff7e0; color: #92400e; }
.ob-etape-dot.sautee { background: #fde9b8; color: #92400e; }
.ob-etape.sautee { opacity: 1; }
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
.btn-action:hover:not(:disabled) { background: var(--vert-dark); transform: translateY(-1px); }
.btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-plus-tard {
  display: block;
  margin: 12px auto 0;
  background: none;
  border: none;
  color: var(--texte-sec);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.btn-plus-tard:hover { color: var(--texte); }
.ob-unites-reminder {
  max-width: 480px;
  margin: 12px auto 0;
  background: #fff7e0;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
}

/* ATTENTE VALIDATION */
.ob-attente-validation {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #fff7e0, #fde9b8);
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 12px 16px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
}
.ob-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(146,64,14,0.3);
  border-top-color: #92400e;
  border-radius: 50%;
  flex-shrink: 0;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* UNITÉS */
.ob-unites-options { display: flex; gap: 10px; margin-bottom: 14px; }
.ob-unite-option {
  flex: 1;
  border: 1.5px solid var(--bordure);
  border-radius: 12px;
  padding: 14px 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}
.ob-unite-option.selected { border-color: var(--vert); background: var(--vert-light); }
.ob-unite-icon { font-size: 20px; display: block; margin-bottom: 6px; }
.ob-unite-type { font-size: 13px; font-weight: 700; margin: 0 0 2px; color: var(--texte); }
.ob-unite-prix { font-size: 12px; font-weight: 600; color: var(--vert); margin: 0 0 2px; }
.ob-unite-quota { font-size: 11px; color: var(--texte-sec); margin: 0; }

/* PROFIL */
.ob-profil-photo {
  width: 100%;
  max-width: 220px;
  aspect-ratio: 1;
  border-radius: 14px;
  border: 1.5px dashed var(--bordure);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  color: var(--texte-sec);
  cursor: pointer;
  overflow: hidden;
  margin-bottom: 14px;
  transition: border-color 0.2s;
}
.ob-profil-photo:hover { border-color: var(--vert); }
.ob-profil-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.25s ease; }
.ob-photo-hint { font-size: 12px; color: var(--texte-sec); margin: 0 0 14px; }
.ob-rotate-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.btn-rotate {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 1px solid var(--bordure);
  background: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-rotate:hover { border-color: var(--vert); background: var(--vert-light); }
.btn-valider-photo {
  padding: 10px 18px;
  background: var(--vert);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-valider-photo:hover:not(:disabled) { background: var(--vert-dark); }
.btn-valider-photo:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-annuler-photo {
  background: none;
  border: none;
  color: var(--texte-sec);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.btn-annuler-photo:hover { color: var(--texte); }
.ob-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px 14px;
  border: 1px solid var(--bordure);
  border-radius: var(--radius);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  margin-bottom: 14px;
}
.ob-textarea:focus { border-color: var(--vert); outline: none; }

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
</style>
