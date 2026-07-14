<script setup lang="ts">
import Header from '@/components/Header.vue'
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    
    <main class="flex-1">
      <!-- Hero Section -->
      <section class="bg-gradient-to-b from-surface-container to-surface py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
        <div class="w-full max-w-7xl mx-auto">
          <h1 class="font-headline-lg text-headline-lg text-on-surface mb-4">Nuestra Historia</h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant">Descubre la pasión y dedicación que ha impulsado KRRIYOS durante tres décadas</p>
        </div>
      </section>

      <!-- Timeline Section -->
      <section class="py-20 md:py-28 px-margin-mobile md:px-margin-desktop">
        <div class="w-full max-w-7xl mx-auto">
          <!-- Origins -->
          <div class="mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 class="font-headline-md text-headline-md text-on-surface mb-6">Los Orígenes</h2>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  <strong>KRRIYOS nació en 1995</strong>, fruto de una tradición familiar dedicada al arte de fabricar calzado. Nuestra historia comenzó mucho antes, con <strong>José Arnulfo Carrillo Moreno</strong>, zapatero y productor nacional durante más de veinte años, quien sembró en su familia la pasión, la disciplina y el conocimiento por este oficio artesanal.
                </p>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Ese legado fue heredado por <strong>Jorge Enrique Carrillo Pinto</strong>, quien, mientras cursaba el grado once de bachillerato, decidió dar vida a su propio sueño. En un pequeño taller instalado en la casa familiar comenzó a fabricar sus primeros pares de zapatos, que vendía a sus compañeros de colegio.
                </p>
              </div>
              <div class="bg-surface-container rounded-2xl overflow-hidden h-80 md:h-96 flex items-center justify-center border-2 border-outline-variant">
                <div class="w-full h-full bg-gradient-to-br from-outline-variant to-surface-container flex items-center justify-center">
                  <span class="text-on-surface-variant text-lg">📷 Foto del Taller</span>
                </div>
              </div>
            </div>
          </div>

          <!-- The Beginning -->
          <div class="mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div class="md:order-2">
                <h2 class="font-headline-md text-headline-md text-on-surface mb-6">Los Primeros Pasos</h2>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Los inicios estuvieron marcados por el ingenio y las ganas de aprender. <strong>Su primera moldura nació al desarmar un par de zapatos Zodiac</strong> que un amigo le había regalado. Tras humedecer cuidadosamente el cuero para recuperar la forma de cada pieza, logró calcar el patrón que le permitió fabricar sus primeros diseños.
                </p>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Ese momento se convirtió en el punto de partida de una marca construida con esfuerzo, dedicación y amor por el oficio. Cada zapato fabricado llevaba consigo la esencia de nuestras raíces zapateras.
                </p>
              </div>
              <div class="md:order-1 bg-surface-container rounded-2xl overflow-hidden h-80 md:h-96 flex items-center justify-center border-2 border-outline-variant">
                <div class="w-full h-full bg-gradient-to-br from-primary to-outline-variant flex items-center justify-center">
                  <span class="text-on-surface-variant text-lg">📷 Primeros Diseños</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Evolution -->
          <div class="mb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 class="font-headline-md text-headline-md text-on-surface mb-6">La Evolución</h2>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Con el paso de los años, <strong>KRRIYOS ha evolucionado sin perder la esencia</strong> con la que nació: fabricar calzado de calidad, combinando la tradición zapatera con la innovación, el diseño y el compromiso de ofrecer productos que acompañen el caminar de miles de colombianos.
                </p>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Hemos invertido en tecnología, capacitación y en la búsqueda constante de nuevos materiales y técnicas que nos permitan mejorar nuestros productos sin abandonar jamás nuestras raíces artesanales.
                </p>
              </div>
              <div class="bg-surface-container rounded-2xl overflow-hidden h-80 md:h-96 flex items-center justify-center border-2 border-outline-variant">
                <div class="w-full h-full bg-gradient-to-br from-outline-variant to-primary flex items-center justify-center">
                  <span class="text-on-surface-variant text-lg">📷 Proceso de Fabricación</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Present & Future -->
          <div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div class="md:order-2">
                <h2 class="font-headline-md text-headline-md text-on-surface mb-6">Presente y Futuro</h2>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Hoy, después de <strong>tres décadas como marca</strong> y con un legado familiar que ha trascendido generaciones, <strong>KRRIYOS continúa honrando sus raíces</strong> mientras avanza hacia el futuro con la misma pasión que inspiró sus primeros pasos.
                </p>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                  Cada par de zapatos que fabricamos es un testimonio de nuestro compromiso con la calidad, la tradición y la innovación. Seguimos escribiendo nuestra historia, una vez tras otra, con el corazón puesto en cada detalle.
                </p>
                <div class="flex items-center gap-4 p-4 bg-surface-container rounded-lg border-l-4 border-primary">
                   <img src="/icon.webp" alt="Tradición Artesanal" class="w-10 h-10 object-contain" />
                  <p class="font-label-md text-label-md text-on-surface-variant">Más de 30 años fabricando calzado con pasión</p>
                </div>
              </div>
              <div class="md:order-1 bg-surface-container rounded-2xl overflow-hidden h-80 md:h-96 flex items-center justify-center border-2 border-outline-variant">
                <div class="w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                  <span class="text-on-surface-variant text-lg">📷 Equipo de KRRIYOS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="bg-surface-container py-20 md:py-28 px-margin-mobile md:px-margin-desktop">
        <div class="w-full max-w-7xl mx-auto">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-12 text-center">Nuestros Valores</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Value 1 -->
            <div class="bg-surface rounded-2xl p-8 border border-outline-variant">
              <img src="/icon.webp" alt="Tradición Artesanal" class="w-12 h-12 mb-4 object-contain" />
              <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Tradición Artesanal</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Honramos el arte de fabricar calzado, manteniendo técnicas ancestrales combinadas con innovación moderna.
              </p>
            </div>

            <!-- Value 2 -->
            <div class="bg-surface rounded-2xl p-8 border border-outline-variant">
              <img src="/icon.webp" alt="Calidad Premium" class="w-12 h-12 mb-4 object-contain" />
              <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Calidad Premium</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Cada detalle importa. Utilizamos los mejores materiales y cuidamos cada paso del proceso de fabricación.
              </p>
            </div>

            <!-- Value 3 -->
            <div class="bg-surface rounded-2xl p-8 border border-outline-variant">
              <img src="/icon.webp" alt="Pasión y Compromiso" class="w-12 h-12 mb-4 object-contain" />
              <h3 class="font-headline-sm text-headline-sm text-on-surface mb-4">Pasión y Compromiso</h3>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Fabricamos con el corazón, buscando acompañar cada paso de nuestros clientes con confianza.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 md:py-28 px-margin-mobile md:px-margin-desktop">
        <div class="w-full max-w-7xl mx-auto text-center">
          <h2 class="font-headline-md text-headline-md text-on-surface mb-6">Forma Parte de Nuestra Historia</h2>
          <p class="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl mx-auto">
            Descubre nuestra colección de calzado y sé parte de una tradición que combina arte, calidad y pasión.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/catalogo" 
              class="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-secondary transition-colors"
            >
              Ver Catálogo
            </router-link>
            <router-link 
              to="/" 
              class="px-8 py-3 border-2 border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors"
            >
              Volver al Inicio
            </router-link>
          </div>
        </div>
      </section>
    </main>

  </div>
</template>

<style scoped>
</style>
