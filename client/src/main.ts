import './assets/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueDatePicker from '@vuepic/vue-datepicker'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@vuepic/vue-datepicker/dist/main.css'
import { auth0 } from './services/auth0'

const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(auth0)
app.use(router)
app.component('VueDatePicker', VueDatePicker)
app.mount('#app')
