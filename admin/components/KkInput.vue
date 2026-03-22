<script setup lang="ts">
defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <input
    :value="modelValue"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :required="required"
    class="kk-input"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
.kk-input {
  width: 100%;
  height: 36px;
  border: 1.5px solid transparent;
  border-radius: 18px;
  padding: 0 16px;
  font-size: 16px;
  color: #1f2937;
  background: #ffffff;
  outline: none;
  box-shadow: none;
  background-image: linear-gradient(#ffffff, #ffffff),
    linear-gradient(to top, #0B56CF 0%, #0B56CF 15%, transparent 35%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  transition: border-color 0.15s ease;
}

.kk-input::placeholder {
  color: #9ca3af;
}

.kk-input:focus {
  background-image: linear-gradient(#ffffff, #ffffff),
    linear-gradient(to top, #0B56CF 0%, #0B56CF 15%, transparent 35%);
}
</style>
