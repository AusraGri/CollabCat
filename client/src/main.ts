import './assets/style.css'
import { createAuth0, LocalStorageCache } from '@auth0/auth0-vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { cache } from './utils/cache'

const app = createApp(App)

app.use(createPinia())
app.use(VueQueryPlugin)
app.use(router)
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    cacheLocation: 'localstorage',
    cache: cache,
    authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
    },
  })
)
app.component('VueDatePicker', VueDatePicker);
app.mount('#app')
