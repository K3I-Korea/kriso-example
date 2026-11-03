<!--
  Vue 앱에서 사용하는 예 (npm i @k3i/ds lit)
  vite.config.ts 에서 ds- 로 시작하는 태그를 커스텀 엘리먼트로 알려준다:
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("ds-") } } })
-->
<script setup lang="ts">
import "@k3i/ds";
import "@k3i/ds/tokens.css";
import { ref } from "vue";

const email = ref("");
function submit(e: Event) {
  console.log(Object.fromEntries(new FormData(e.target as HTMLFormElement)));
}
</script>

<template>
  <ds-card elevated>
    <h2 slot="header">회원가입</h2>
    <form @submit.prevent="submit">
      <ds-input
        name="email"
        type="email"
        label="이메일"
        required
        :value="email"
        @ds-input="email = $event.detail.value"
      />
      <ds-button type="submit" full-width>가입</ds-button>
    </form>
  </ds-card>
</template>
