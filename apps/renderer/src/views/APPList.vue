<script lang="ts" setup>
import {
  NInput,
  NList,
  NListItem,
  NThing,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NElement,
  NLayout,
  NIcon,
  NButton,
  useMessage,
} from 'naive-ui'
import { appService } from '@/service'
import { CSSProperties, computed, ref, shallowRef, watchEffect } from 'vue'
import router from '@/router/router'
import { RouteNameMap } from '@/router/constant'
import { Database } from '@vicons/tabler'
import type { AppVOWithItems } from 'app-api'

const message = useMessage()

const size = 'large' as const
const contentStyle: CSSProperties = {
  padding: '20px',
}

const search = ref('')
const appList = shallowRef<AppVOWithItems[]>([])
const filteredAppList = computed(() => {
  const result = appList.value.filter((item) => {
    return item.name.includes(search.value)
  })
  return result
})

const loading = ref(false)
const loadAppList = async () => {
  loading.value = true
  try {
    const list = await appService.listWithItems()
    appList.value = list ?? []
  } catch {
    message.error('刷新失败')
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  loadAppList()
})

const handleConfigClick = () => {
  router.push({
    name: RouteNameMap.DBConfig,
  })
}

const handleEdit = (id?: bigint) => {
  router.push({
    name: id ? RouteNameMap.APPEdit : RouteNameMap.APPAdd,
    query: {
      id: id?.toString(),
    },
  })
}

const handleRemove = async (id: bigint) => {
  let isRemoved = false
  try {
    isRemoved = await appService.remove(id)
  } catch (error) {
    console.log(error)
    isRemoved = false
  }
  if (isRemoved) {
    message.success('删除成功')
    loadAppList()
  } else {
    message.error('删除失败')
  }
}
</script>

<template>
  <n-layout class="w-screen h-screen" :native-scrollbar="false" :content-style="contentStyle">
    <div class="flex items-center">
      <n-input v-model:value="search" type="text" :size="size" placeholder="输入关键字检索" />
      <n-button class="ml-3" type="success" :size="size" ghost @click="loadAppList">刷新</n-button>
      <n-button class="ml-3" type="info" :size="size" ghost @click="handleEdit()">新建</n-button>
    </div>

    <div class="mt-4">
      <n-list v-if="filteredAppList.length">
        <n-list-item v-for="item of filteredAppList" :key="'' + item.id">
          <n-thing :title="item.name">
            <template #header-extra>
              <n-button class="ml-3" type="warning" size="tiny" ghost @click="handleEdit(item.id)"
                >编辑</n-button
              >
              <n-button class="ml-3" type="error" size="tiny" ghost @click="handleRemove(item.id)"
                >删除</n-button
              >
            </template>
            <n-descriptions :column="2" label-placement="left" bordered size="small">
              <n-descriptions-item v-for="field of item.items" :key="'' + field.id" :label="field.title">{{
                field.value
              }}</n-descriptions-item>
            </n-descriptions>
          </n-thing>
        </n-list-item>
      </n-list>
      <n-empty v-else />
    </div>

    <n-element
      class="fixed bottom-5 right-5 w-11 h-11 flex justify-center items-center rounded-full cursor-pointer shadow-lg"
      style="
        background-color: var(--popover-color);
        color: var(--text-color-2);
        transition: all 0.3s var(--cubic-bezier-ease-in-out);
      "
      title="MySQL配置"
      @click="handleConfigClick"
    >
      <n-icon size="26">
        <Database />
      </n-icon>
    </n-element>
  </n-layout>
</template>

<style scoped></style>
