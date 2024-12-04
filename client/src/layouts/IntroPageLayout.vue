<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue'

const { links } = defineProps<{
  links: {
    label: string
    name: string
  }[]
}>()

const route = useRoute()

const imageURL = ref("../assets/intro/01.jpeg")

const image = "../assets/intro/01.jpeg"

const navigation = computed(() =>
  links.map((item) => ({
    ...item,
    isActive: route.name === item.name,
  }))
)
</script>

<template>
    <div class="flex">
        <div>
            <img src="../assets/intro/01.jpeg" class=" h-20 rounded-full">
        </div>
      <div v-for="link in navigation" :key="link.name">
        <a href="#">{{ link.name }}</a>
      </div>
    </div>
  <main>
    <div class="container mx-auto px-6 py-6">
      <RouterView />
    </div>
  </main>
</template>
