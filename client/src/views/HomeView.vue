<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import type { Selectable } from 'kysely'
import type { Article } from '@server/shared/types'
import { FwbButton } from 'flowbite-vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { isLoggedIn } from '@/stores/user'

// const articles = ref<Selectable<Article>[]>([])

// const fetchArticles = async () => {
//   articles.value = await trpc.article.findAll.query()
// }

// onMounted(fetchArticles)
</script>

<template>
  <div class="dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">API test platform</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
            Hi! To begin the test, please sign up and then login.
          </p>
          <div class="mt-6 flex items-center gap-2">
            <FwbButton component="RouterLink" tag="router-link" href="/signup">Sign up</FwbButton>
            <FwbButton component="RouterLink" tag="router-link" color="alternative" href="/login">
              Log in
            </FwbButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
