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
} from 'naive-ui'
import { appService } from '@/service'
import { CSSProperties, computed, ref, shallowRef, watchEffect } from 'vue'
import type { AppVOWithItems } from 'app-api'

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

const loadAppList = async () => {
  const list = await appService.listWithItems()
  appList.value = list ?? []
}

watchEffect(() => {
  loadAppList()
})
</script>

<template>
  <n-layout class="w-screen h-screen" :native-scrollbar="false" :content-style="contentStyle">
    <n-input v-model:value="search" type="text" :size="size" placeholder="输入关键字检索" />

    <div class="mt-4">
      <n-list v-if="filteredAppList.length">
        <n-list-item v-for="item of filteredAppList" :key="'' + item.id">
          <n-thing :title="item.name">
            <template #header-extra>extra</template>
            <n-descriptions label-placement="left" bordered size="small">
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
    >
      <n-icon size="26">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 512 512"
        >
          <path
            d="M262.29 192.31a64 64 0 1 0 57.4 57.4a64.13 64.13 0 0 0-57.4-57.4zM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22a155.3 155.3 0 0 1-21.46-12.57a16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22a155.3 155.3 0 0 1 21.46 12.57a16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="32"
          ></path>
        </svg>
      </n-icon>
    </n-element>
  </n-layout>
</template>

<style scoped></style>
