 <template>
  <div class="not-found">
    <div class="nf-content">
      <div class="nf-emoji">🛍️</div>
      <h1>404</h1>
      <h2>Page introuvable</h2>
      <p>Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer vos courses !</p>
      <div class="nf-btns">
        <RouterLink to="/" class="btn-primary">🏠 Retour à l'accueil</RouterLink>
        <RouterLink to="/connexion" class="btn-outline" v-if="!authStore.estConnecte">Se connecter</RouterLink>
        <RouterLink :to="authStore.getDashboardRoute()" class="btn-outline" v-else>Mon dashboard</RouterLink>
      </div>
      <div class="nf-marchés">
        <p>Vous cherchez peut-être :</p>
        <div class="nf-links">
          <RouterLink to="/inscription">S'inscrire</RouterLink>
          <RouterLink to="/connexion">Se connecter</RouterLink>
          <RouterLink to="/#marches">Nos marchés</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, var(--vert-dark) 0%, var(--vert) 100%);
}
.nf-content {
  text-align: center;
  color: white;
  max-width: 500px;
}
.nf-emoji {
  font-size: 80px;
  margin-bottom: 16px;
  display: block;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
h1 {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  margin: 0 0 8px;
  opacity: 0.3;
  letter-spacing: -4px;
}
h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px;
}
p {
  font-size: 16px;
  opacity: 0.85;
  line-height: 1.7;
  margin-bottom: 32px;
}
.nf-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}
.btn-primary {
  background: white;
  color: var(--vert-dark);
  padding: 13px 24px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.btn-outline {
  background: transparent;
  color: white;
  padding: 13px 24px;
  border-radius: var(--radius);
  font-size: 15px;
  font-weight: 600;
  border: 1.5px solid rgba(255,255,255,0.5);
  text-decoration: none;
  transition: all 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.1); }
.nf-marchés { opacity: 0.7; }
.nf-marchés p { font-size: 13px; margin-bottom: 12px; opacity: 1; }
.nf-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.nf-links a {
  font-size: 13px;
  color: white;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
