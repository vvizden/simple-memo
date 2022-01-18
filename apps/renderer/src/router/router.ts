import { createRouter, createWebHashHistory } from 'vue-router'
import { RouteNameMap } from './constant'
import { dbService } from '@/service'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteNameMap.Home,
    redirect: {
      name: RouteNameMap.APPList,
    },
  },
  {
    path: '/db/config',
    name: RouteNameMap.DBConfig,
    component: () => import(/* webpackChunkName: "db" */ '@/views/DBConfig.vue'),
    meta: {
      title: 'MySQL配置',
    },
  },
  {
    path: '/app/list',
    name: RouteNameMap.APPList,
    component: () => import(/* webpackChunkName: "app" */ '@/views/APPList.vue'),
    meta: {
      title: '应用列表',
    },
  },
  {
    path: '/app/add',
    name: RouteNameMap.APPAdd,
    component: () => import(/* webpackChunkName: "app" */ '@/views/APPForm.vue'),
    meta: {
      title: '新增应用',
    },
  },
  {
    path: '/app/edit',
    name: RouteNameMap.APPEdit,
    component: () => import(/* webpackChunkName: "app" */ '@/views/APPForm.vue'),
    meta: {
      title: '编辑应用',
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
