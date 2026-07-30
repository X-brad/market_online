<template>
  <div id="app">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <Footer />
    <Toast />
  </div>
</template>

<script setup>
import NavBar from './components/layout/NavBar.vue'
import Footer from './components/layout/Footer.vue'
import Toast from './components/Toast.vue'
</script>

<style scoped>
main { min-height: calc(100vh - 140px); }
</style>