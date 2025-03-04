<script setup lang="ts">
import { ref } from 'vue'
import {
  FwbAccordion,
  FwbAccordionHeader,
  FwbAccordionPanel,
  FwbAccordionContent,
} from 'flowbite-vue'

const openPanel = ref('')
const togglePanel = (panel: string) => {
  openPanel.value = openPanel.value === panel ? '' : panel
}

const isOpen = (panel: string) => openPanel.value === panel
</script>

<template>
  <div>
    <FwbAccordion>
      <FwbAccordionPanel>
        <FwbAccordionHeader
          aria-controls="collabcat-content"
          :aria-expanded="isOpen('collabcat')"
          data-test="accordion-header-collabcat"
          @click="togglePanel('collabcat')"
          >CollabCat: Task Management Made Fun!</FwbAccordionHeader
        >
        <FwbAccordionContent
          id="collabcat-content"
          v-show="isOpen('collabcat')"
          data-test="accordion-content-collabcat"
        >
          <div>
            <p>
              Turn task management into an engaging and enjoyable experience for all. With
              CollabCat, managing your to-dos becomes easy and fun for the whole family or team!
            </p>
          </div>
        </FwbAccordionContent>
      </FwbAccordionPanel>
      <FwbAccordionPanel>
        <FwbAccordionHeader
          aria-controls="organize-content"
          :aria-expanded="isOpen('organize')"
          data-test="accordion-header-organize"
          @click="togglePanel('organize')"
          >Organize, Connect, Achieve!</FwbAccordionHeader
        >
        <FwbAccordionContent
          id="organize-content"
          v-show="isOpen('organize')"
          data-test="accordion-content-organize"
        >
          <div>
            <p>
              Create and join groups to share and manage tasks with your family and friends!
              Effortlessly schedule tasks, establish routines, and assign responsibilities to
              streamline family duties or collaborate smoothly with friends!
            </p>
          </div>
        </FwbAccordionContent>
      </FwbAccordionPanel>
      <FwbAccordionPanel>
        <FwbAccordionHeader
          aria-controls="rewards-content"
          :aria-expanded="isOpen('rewards')"
          data-test="accordion-header-rewards"
          @click="togglePanel('rewards')"
          >Motivate with Rewards!</FwbAccordionHeader
        >
        <FwbAccordionContent
          id="rewards-content"
          v-show="isOpen('rewards')"
          data-test="accordion-content-rewards"
        >
          <div>
            <p>
              Encourage your kids to complete tasks with a fun reward system! Earn points for every
              completed task and redeem them for exciting rewards. Pssst, adults love rewards
              too—motivation for everyone!
            </p>
          </div>
        </FwbAccordionContent>
      </FwbAccordionPanel>
    </FwbAccordion>
  </div>
</template>
