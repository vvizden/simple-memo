<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN, NMessageProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    fontWeightStrong: '600',
    borderRadius: '2px',
    lineHeight: 'unset',
  },
}
</script>

<template>
  <n-config-provider abstract :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<style></style>
