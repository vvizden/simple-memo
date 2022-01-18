<script lang="ts" setup>
import {
  NInput,
  NForm,
  NFormItem,
  NButton,
  NPageHeader,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NDynamicInput,
  useMessage,
} from 'naive-ui'
import { ref, watchEffect, computed } from 'vue'
import { appService } from '@/service'
import { useRouter, useRoute } from 'vue-router'
import { RouteNameMap } from '@/router/constant'
import type { FormRules } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const message = useMessage()

const size = 'large' as const
const formRef = ref<InstanceType<typeof NForm>>()
const formValue = ref<{ name: string; items: { id: string; title: string; value: string }[] }>({
  name: '',
  items: [],
})
const rules: FormRules = {
  name: {
    type: 'string',
    required: true,
    whitespace: true,
    message: '请输入应用名称',
    trigger: 'input',
  },
}

const appID = computed(() => {
  return route.query.id as string | undefined
})

const formType = computed(() => {
  return appID.value ? '编辑' : '新增'
})

/**
 * 原始的属性 id 集合
 */
let appItemIds: string[] = []

const loadAppData = async () => {
  if (!route.query.id) {
    return
  }

  const appData = await appService.getOne(BigInt(route.query.id as string))
  if (appData) {
    const appItems = []
    const itemIds = []
    for (const item of appData.items) {
      const id = item.id.toString()
      itemIds.push(id)
      appItems.push({
        id,
        title: item.title,
        value: item.value,
      })
    }
    appItemIds = itemIds

    formValue.value = {
      name: appData.name,
      items: appItems,
    }
  }
}

watchEffect(() => {
  loadAppData()
})

const loading = ref(false)
const handleValidateClick = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const { name, items } = formValue.value

  const itemIdsRemove = new Set([...appItemIds])
  const itemsUpdate = []
  const itemsAdd = []

  for (const { id, title, value } of items) {
    if (!value) {
      continue
    }

    if (itemIdsRemove.has(id)) {
      itemIdsRemove.delete(id)

      itemsUpdate.push({
        id: BigInt(id),
        title,
        value,
      })
    } else {
      itemsAdd.push({
        title,
        value,
      })
    }
  }

  loading.value = true
  let isSuccess = false

  try {
    if (appID.value) {
      isSuccess = await appService.update({
        id: BigInt(appID.value),
        name,
        itemsRemove: [...itemIdsRemove].map((id) => BigInt(id)),
        itemsUpdate,
        itemsAdd,
      })
    } else {
      isSuccess = (await appService.add({
        name,
        items: itemsAdd,
      })) as boolean
    }
  } catch (error) {
    console.log(error)
    isSuccess = false
  }

  if (isSuccess) {
    message.success(`${formType.value}成功`)
    router.replace({
      name: RouteNameMap.APPList,
    })
  } else {
    message.error(`${formType.value}失败`)
    loading.value = false
  }
}

const handleBack = () => {
  router.replace({
    name: RouteNameMap.APPList,
  })
}

const onCreate = () => {
  return {
    id: `add-${Math.random() * Date.now()}`,
    title: '',
    value: '',
  }
}
</script>

<template>
  <n-layout class="w-screen h-screen">
    <n-layout-header class="px-2 h-10 flex items-center">
      <n-page-header @back="handleBack">
        <template #title>
          <span class="align-sub">{{ formType }}应用</span>
        </template>
      </n-page-header>
    </n-layout-header>
    <n-layout-content
      class="!top-10"
      position="absolute"
      :native-scrollbar="false"
      content-style="padding: 44px; height: 100%;"
    >
      <n-form
        class="w-3/5 my-0 mx-auto"
        :label-width="80"
        :model="formValue"
        :rules="rules"
        :size="size"
        :disabled="loading"
        ref="formRef"
      >
        <n-form-item label="应用名称" path="name" first>
          <n-input placeholder="请输入应用名称" v-model:value="formValue.name" clearable />
        </n-form-item>

        <n-form-item label="应用属性">
          <n-dynamic-input
            item-style="margin-bottom: 0; display: flex;"
            key-field="id"
            v-model:value="formValue.items"
            :on-create="onCreate"
            #="{ index }"
          >
            <div class="flex flex-auto">
              <n-form-item
                class="flex-auto"
                ignore-path-change
                :show-label="false"
                :path="`items[${index}].title`"
              >
                <n-input
                  placeholder="属性"
                  @keydown.enter.prevent
                  v-model:value="formValue.items[index].title"
                />
              </n-form-item>
              <div class="h-10 flex items-center flex-none mx-2">=</div>
              <n-form-item
                class="flex-auto"
                ignore-path-change
                :show-label="false"
                :path="`items[${index}].value`"
              >
                <n-input
                  placeholder="属性值"
                  @keydown.enter.prevent
                  v-model:value="formValue.items[index].value"
                />
              </n-form-item>
            </div>
          </n-dynamic-input>
        </n-form-item>

        <n-button
          type="primary"
          block
          attr-type="button"
          :size="size"
          :loading="loading"
          @click="handleValidateClick"
          >{{ loading ? '正在提交...' : '提交' }}</n-button
        >
      </n-form>
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>
