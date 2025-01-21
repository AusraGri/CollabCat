<script setup lang="ts">
import {
  FwbAccordion,
  FwbAccordionHeader,
  FwbAccordionPanel,
  FwbAccordionContent,
} from 'flowbite-vue'
</script>

<template>
  <div>
    <FwbAccordion>
      <FwbAccordionPanel>
        <FwbAccordionHeader>CollabCat: Task Management Made Fun!</FwbAccordionHeader>
        <FwbAccordionContent>
          <div>
            <p>
              Turn task management into an engaging and enjoyable experience for all. With
              CollabCat, managing your to-dos becomes easy and fun for the whole family or team!
            </p>
          </div>
        </FwbAccordionContent>
      </FwbAccordionPanel>
      <FwbAccordionPanel>
        <FwbAccordionHeader>Organize, Connect, Achieve!</FwbAccordionHeader>
        <FwbAccordionContent>
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
        <FwbAccordionHeader>Motivate with Rewards!</FwbAccordionHeader>
        <FwbAccordionContent>
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
<style scoped></style>
