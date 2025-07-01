<script setup lang="ts">
import { ref, defineEmits, defineProps, useId } from 'vue'

const props = defineProps<{
  isChecked?: boolean
  label?: string
  isDisabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

const checked = ref(props.isChecked || false)
const inputId = useId()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  checked.value = target.checked
  emit('update:checked', checked.value)
}
</script>

<template>
  <div name="pawCheckbox" class="flex flex-nowrap">
    <input
      type="checkbox"
      :id="inputId"
      class="hidden-checkbox"
      v-model="checked"
      @change="onChange"
      :disabled="isDisabled"
    />
     <label :for="inputId">
      <span v-if="label">{{label || '' }}</span>
    </label>
  </div>
</template>
<style scoped>
.hidden-checkbox {
  display: none;
}

label {
  display: inline-block;
  width: 30px;
  height: 30px;
  position: relative;
  cursor: pointer;
}



.hidden-checkbox + label {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  display: inline-block;
  color: #666;
  line-height: 25px;
}

.hidden-checkbox + label::before {
  content: '';
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  outline: 2px solid #aaa;
  background: #fff;
}

.hidden-checkbox:checked + label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  outline: 2px solid #5fd25f;
  background: #fff;
}
.hidden-checkbox:checked + label::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  background-image: url('@/assets/cat_paw_sm.png');
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center;
  transform: scale(1);
  opacity:1;
  transition: all .3s ease;
}
.hidden-checkbox:not(:checked) + label::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  background-image: url('@/assets/cat_paw_sm.png');
  background-size: 80%;
  background-repeat: no-repeat;
  background-position: center;
  transform: scale(0);
  opacity:0;
}
</style>

