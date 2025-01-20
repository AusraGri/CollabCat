<script setup lang="ts">
import {ref} from 'vue'
import image1 from '@/assets/intro/01.jpeg'
import image2 from '@/assets/intro/02.jpg'
import image3 from '@/assets/intro/03.jpg'


const pictures = ref( [
  { src: image1, alt: 'Image 1' },
  { src: image2, alt: 'Image 2' },
  { src: image3, alt: 'Image 3' },
])

</script>
<template>
  <div>
    <FwbCarousel :pictures="pictures" slide :slide-interval="5000" />
  </div>
</template>
<style scoped></style>
