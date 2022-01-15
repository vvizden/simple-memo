import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'
import './styles/index.css'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

const app = createApp(App)
app.use(router)
app.mount('#app')
