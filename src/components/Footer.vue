<script setup lang="ts">
</script>

<template>
  <footer class="bg-surface-container border-t border-outline-variant py-24 px-margin-mobile md:px-margin-desktop">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start w-full max-w-7xl mx-auto">
      <!-- Branding -->
      <div>
        <h3 class="font-headline-md text-headline-md font-extrabold text-on-surface mb-6 uppercase">krrillos</h3>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-xs">
          Precisión artesanal. Diseño arquitectónico. Footwear de alto rendimiento para el entorno urbano contemporáneo.
        </p>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-2 gap-gutter">
        <div class="flex flex-col gap-4">
          <h4 class="font-label-caps text-label-caps uppercase font-bold text-on-surface">Servicio</h4>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Envíos</a>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Devoluciones</a>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Contacto</a>
        </div>
        <div class="flex flex-col gap-4">
          <h4 class="font-label-caps text-label-caps uppercase font-bold text-on-surface">Legal</h4>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Privacidad</a>
          <a href="#" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Términos</a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="flex flex-col gap-6 md:items-end">
        <p class="font-label-caps text-label-caps uppercase text-on-surface-variant">
          © 2024 krrillos. High-End Footwear Precision.
        </p>
        <div class="flex gap-4">
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">VISA</span>
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">MC</span>
          <span class="w-10 h-6 bg-surface-variant rounded-sm flex items-center justify-center text-[8px] font-bold">AMEX</span>
        </div>
      </div>
    </div>
  </footer>
</template>
