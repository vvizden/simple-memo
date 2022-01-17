import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { RouteNameMap } from './constant'
import { dbService } from '@/service'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: {
      name: RouteNameMap.Home,
    },
  },
  {
    path: '/db-config',
    name: RouteNameMap.DBConfig,
    component: () => import(/* webpackChunkName: "db" */ '@/views/DBConfig.vue'),
    meta: {
      title: '数据库配置',
    },
  },
  {
    path: '/home',
    name: RouteNameMap.Home,
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
    meta: {
      title: '搜索',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const dbConfig = await dbService.get()

  if (dbConfig) {
    return true
  } else {
    if (to.name === RouteNameMap.DBConfig) {
      return true
    } else {
      return {
        name: RouteNameMap.DBConfig,
        replace: true,
      }
    }
  }
})

export default router
