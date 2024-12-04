<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLink } from 'flowbite-vue'

const { links } = defineProps<{
  links: {
    label: string
    name: string
  }[]
}>()

const route = useRoute()

const navigation = computed(() =>
  links.map((item) => ({
    ...item,
    isActive: route.name === item.name,
  }))
)
</script>

<template>
  <FwbNavbar>
    <template #logo>
        <img src="../assets/intro/01.jpeg" class=" h-20 rounded-full">
    </template>
    <template #default="{ isShowMenu }">
        <FwbNavbarCollapse :isShowMenu="isShowMenu">
          <FwbNavbarLink
            v-for="link in navigation"
            :key="`${link.name}-${String(route.name)}`"
            :is-active="link.isActive"
            :link="{ name: link.name } as any"
            link-attr="to"
            component="RouterLink"
          >
            {{ link.label }}
          </FwbNavbarLink>
          <slot name="menu" />
        </FwbNavbarCollapse>
    </template>
  </FwbNavbar>

  <main>
    <div class="container mx-auto px-6 py-6">
      <RouterView />
    </div>
  </main>
</template>
