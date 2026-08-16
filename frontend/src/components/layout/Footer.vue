
<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">Achètlà</div>
        <p>Vos courses de marché, livrées par les femmes du quartier. Abidjan, Côte d'Ivoire.</p>
      </div>
      <div class="footer-col">
        <h4>Découvrir</h4>
        <RouterLink to="/">Accueil</RouterLink>
        <RouterLink to="/#comment-ca-marche">Comment ça marche</RouterLink>
        <RouterLink to="/#marches">Marchés</RouterLink>
      </div>
      <div class="footer-col">
        <h4>Clients</h4>
        <RouterLink to="/inscription">Créer un compte</RouterLink>
        <RouterLink :to="lienMesCourses">Mes courses</RouterLink>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© 2026 Achètlà — Abidjan, Côte d'Ivoire 🇨🇮</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const lienMesCourses = computed(() => authStore.estConnecte ? authStore.getDashboardRoute() : '/connexion')
</script>

<style scoped>
.footer {
  background: var(--vert-dark);
  color: white;
}
.footer-inner {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  padding: 48px 0 32px;
}
.footer-brand { flex: 1; min-width: 220px; }
.footer-logo { font-size: 19px; font-weight: 800; margin-bottom: 10px; }
.footer-brand p { font-size: 13px; opacity: 0.75; line-height: 1.6; max-width: 280px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }
.footer-col h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6; margin-bottom: 4px; font-weight: 700; }
.footer-col a { font-size: 14px; opacity: 0.85; transition: opacity 0.2s; }
.footer-col a:hover { opacity: 1; }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.15);
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  opacity: 0.85;
}

@media (max-width: 640px) {
  .footer-inner { padding: 36px 0 24px; gap: 32px; }
}
</style>
