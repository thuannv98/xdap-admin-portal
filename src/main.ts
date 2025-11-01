import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css';
import Aura from "@primeuix/themes/aura";
import '@/assets/theme.css';
import PrimeVue from 'primevue/config';
import Button from "primevue/button"

const app = createApp(App)
// app.use(PrimeVue);

app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ".p-dark",
		}
	},
});


// app.component('Button', Button);

app.use(createPinia())
app.use(router)

app.mount('#app')
