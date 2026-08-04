<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="t.type"
        >
          <span class="toast-icon">{{ t.icon }}</span>
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="remove(t.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '../stores/toast'
const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const remove = toastStore.remove
</script>
<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  min-width: 280px;
  max-width: 380px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.toast.success { background: var(--vert); color: white; }
.toast.error { background: #dc2626; color: white; }
.toast.warning { background: #f59e0b; color: white; }
.toast.info { background: #3b82f6; color: white; }
.toast-icon { font-size: 18px; flex-shrink: 0; }
.toast-msg { flex: 1; line-height: 1.4; }
.toast-close {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 11px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastOut 0.25s ease forwards; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(40px); }
}
</style>