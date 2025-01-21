<template>
  <div>
    <!-- The checkbox input itself is hidden -->
    <input type="checkbox" v-model="isChecked" id="customCheckbox" class="checkbox-input" />
    <!-- Label that acts as the custom checkbox -->
    <label for="customCheckbox" class="checkbox-label"></label>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

// Define the state of the checkbox
const isChecked = ref(false)

// Watch for changes in checkbox state and handle them here
watch(isChecked, (newVal) => {
  console.log(`Checkbox state: ${newVal ? 'checked' : 'unchecked'}`)
})
</script>

<style scoped>
/* Hide the default checkbox input */
.checkbox-input {
  display: none;
}

/* Style for the checkbox label */
.checkbox-label {
  display: inline-block;
  width: 50px; /* Size of the checkbox */
  height: 50px; /* Size of the checkbox */
  background-image: url('../assets/illustration.png'); /* Default image for unchecked state */
  background-size: cover;
  cursor: pointer;
  transition: background-image 0.3s ease;
}

/* When the checkbox is checked, change the background image */
.checkbox-input:checked + .checkbox-label {
  background-image: url('../assets/collabCat.png'); /* Image for checked state */
}
</style>
