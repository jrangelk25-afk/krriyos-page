<template>
  <Transition name="fade">
    <button
      v-if="isVisible"
      class="scroll-to-top-btn"
      @click="scrollToTop"
      :aria-label="t('scrollToTop')"
      :disabled="scroll.isScrolling.value"
    >
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePageScroll } from '../composables/usePageScroll'

const scroll = usePageScroll()
const isVisible = ref(false)

// Traducción básica
const t = (key: string) => {
  const translations: Record<string, string> = {
    scrollToTop: 'Volver al inicio',
  }
  return translations[key] || key
}

const handleScroll = () => {
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  scroll.toTop()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.icon {
  width: 1.2rem;
  height: 1.2rem;
  stroke-width: 2.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
