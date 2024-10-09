<template>
  <q-input
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    :label="label"
    dark
    outlined
    bg-color="grey-10"
  >
    <template v-if="$slots.prepend" v-slot:prepend>
      <slot name="prepend" />
    </template>

    <template v-if="$slots.append" v-slot:append> <slot name="append" /> </template
  ></q-input>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: 'CustomInput',
    props: {
      modelValue: {
        type: [String, Number],
        default: ''
      },
      label: {
        type: String,
        required: true
      }
    },
    emits: ['update:modelValue']
  })
</script>

<style>
  .q-field--outlined .q-field__control:before {
    border-color: #202225;
  }
  .q-field--outlined .q-field__control {
    border-radius: 12px;
  }
</style>
