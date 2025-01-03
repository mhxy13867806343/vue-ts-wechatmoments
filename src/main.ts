import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { 
  Button, 
  NavBar, 
  Cell, 
  Image as VanImage, 
  Uploader,
  ActionSheet,
  Popup,
  Field,Icon,
  ShareSheet
} from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Icon)
app.use(Button)
app.use(NavBar)
app.use(Cell)
app.use(VanImage)
app.use(Uploader)
app.use(ActionSheet)
app.use(Popup)
app.use(Field)
app.use(ShareSheet)

app.mount('#app')
