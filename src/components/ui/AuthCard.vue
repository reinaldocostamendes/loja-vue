<script setup>
defineProps({ title: { type: String, required: true }, subtitle: { type: String, default: '' } })
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <span class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </span>
        <h1 class="text-2xl font-extrabold text-slate-900">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-sm text-slate-500">{{ subtitle }}</p>
      </div>
      <div class="rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 sm:p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
