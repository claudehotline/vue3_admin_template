//路由鉴权：鉴权，项目当中路由能不能被访问
import router from '@/router'
import setting from './setting'
import nprogress from 'nprogress'
//引入进度条的样式
import 'nprogress/nprogress.css'
nprogress.configure({ showSpinner: false })

//获取用户相关的小仓库 内部TOKEN数据，去判断用户是否登陆成功
import useUserStore from './store/modules/user'
import pinia from './store'
let userStore = useUserStore(pinia)

//全局守卫：项目当中任意路由切换都会触发的钩子
//全局前置守卫
router.beforeEach(async (to: any, from: any, next: any) => {
  document.title = `${setting.title} - ${to.meta.title}`
  //访问某一个路由之间的守卫
  nprogress.start()
  //获取TOKEN，去判断用户登录、还是未登录
  let token = userStore.token
  //获取用户的名字
  let username = userStore.username
  if (token) {
    if (to.path == '/login') {
      next({ path: '/' })
    } else {
      if (username) {
        next()
      } else {
        try {
          await userStore.userInfo()
          next()
        } catch (error) {
          //TOKEN过期
          //用户手动修改本地存储的TOKEN
          //退出登录->用户相关的数据清空
          userStore.userLogout()
          next({ path: '/login', query: { redirect: to.path } })
        }
      }
    }
  } else {
    //用户未登录的判断
    if (to.path == '/login') {
      next()
    } else {
      next({ path: '/login', query: { redirect: to.path } })
    }
  }
})

//全局后置守卫
router.afterEach((to: any, from: any) => {
  nprogress.done()
})
