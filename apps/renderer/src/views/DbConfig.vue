<script lang="ts" setup>
import { NInput, NForm, NFormItem, NButton, NH1, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { dbService } from '@/service'
import { isValidMySQLURL } from '@/utils/validator'
import { useRouter } from 'vue-router'
import { RouteNameMap } from '@/router/constant'
import type { FormRules } from 'naive-ui'

const router = useRouter()

const message = useMessage()

const size = 'large' as const
const formRef = ref<InstanceType<typeof NForm>>()
const formValue = ref({
  url: '',
  user: '',
  password: '',
})
const rules: FormRules = {
  url: [
    {
      type: 'string',
      required: true,
      whitespace: true,
      validator(rule, value) {
        return isValidMySQLURL(value)
      },
      message: '格式: HOST:PORT/DATABASE?KEY1=VALUE',
      trigger: 'input',
    },
  ],
  user: {
    type: 'string',
    required: true,
    whitespace: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  password: {
    type: 'string',
    required: true,
    whitespace: true,
    message: '请输入密码',
    trigger: 'input',
  },
}

const loading = ref(false)
const handleValidateClick = async () => {
  let isConnected = false
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const { url, user, password } = formValue.value
  loading.value = true
  try {
    isConnected = await dbService.testConnection(url, user, password)
  } catch (error) {
    console.log(error)
    isConnected = false
  }

  if (isConnected) {
    try {
      await dbService.save(url, user, password)
    } catch (error) {
      message.success('配置存储失败，请重试')
      loading.value = false
      return
    }

    message.success('连接成功', {
      onLeave: () => {
        router.replace({
          name: RouteNameMap.Home,
        })
      },
    })
  } else {
    message.error('连接失败，请检查连接参数是否正确')
    loading.value = false
  }
}
</script>

<template>
  <div class="w-screen h-screen flex flex-col justify-center items-center">
    <n-h1>MySQL 配置</n-h1>
    <n-form
      class="w-96 h-96"
      :label-width="80"
      :model="formValue"
      :rules="rules"
      :size="size"
      :disabled="loading"
      ref="formRef"
    >
      <n-form-item label="URL" path="url" first>
        <n-input placeholder="格式: HOST:PORT/DATABASE?KEY1=VALUE" v-model:value="formValue.url" clearable />
      </n-form-item>
      <n-form-item label="用户名" path="user">
        <n-input placeholder="输入用户名" v-model:value="formValue.user" clearable />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          placeholder="输入密码"
          v-model:value="formValue.password"
          type="password"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" block attr-type="button" :loading="loading" @click="handleValidateClick">{{
          loading ? '正在尝试连接...' : '确定'
        }}</n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped></style>
