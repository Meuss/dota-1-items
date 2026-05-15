<script setup lang="ts">
const { slots, openPicker, clearSlot } = useItemStore()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    <ItemSlot
      v-for="slot in slots"
      :key="slot.index"
      :slot="slot"
      @open="openPicker"
      @clear="clearSlot"
    />
  </div>
</template>
