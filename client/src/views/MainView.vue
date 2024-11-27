
<script setup lang="ts">
import { FwbCarousel } from 'flowbite-vue';

const pictures = [
  {src: '../assets/intro/01.jpeg', alt: 'Image 1'},
  {src: '../assets/intro/02.jpg', alt: 'Image 2'},
  {src: '../assets/intro/03.jpg', alt: 'Image 3'},
]

</script>

<template>
    <div class="h-96 bg-black">
        <FwbCarousel :pictures="pictures" />
    </div>
</template>

<style scoped>

</style>