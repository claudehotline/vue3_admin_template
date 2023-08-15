import { createApp } from 'vue'
import 'element-plus/dist/index.css'
//引入模板的全局样式
import '@/styles/index.scss'
//svg插件需要配置代码
import 'virtual:svg-icons-register'
import App from '@/App.vue'
//引入element-plus插件和样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
//引入自定义插件对象:注册整个项目全局组件
import gloalComponent from '@/components'
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
//引入路由
import router from '@/router';
//引入仓库
import pinia from './store'
//引入路由鉴权文件
import './permission'

//获取应用实例对象
const app = createApp(App)
//安装element-plus插件
app.use(ElementPlus, { locale: zhCn })
app.use(gloalComponent)
//安装仓库
app.use(pinia)
app.use(router)
app.mount('#app')