<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: [String, Array], default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
  min: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
})
defineEmits(['update:modelValue'])

function firstError(error) {
  return Array.isArray(error) ? error[0] : error
}
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ label }} <span v-if="required" class="text-rose-500">*</span>
    </span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :min="min"
      :step="step"
      class="w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2"
      :class="error ? 'ring-rose-300 focus:ring-rose-500' : 'ring-slate-200 focus:ring-brand-500'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="firstError(error)" class="mt-1.5 text-xs font-medium text-rose-600">{{ firstError(error) }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-400">{{ hint }}</p>
  </label>
</template>
