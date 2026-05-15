<script setup lang="ts">
import type { SlotState } from '~/types/item'

defineProps<{
  slot: SlotState
}>()

defineEmits<{
  open: [index: number]
  clear: [index: number]
}>()
</script>

<template>
  <div
    class="group relative rounded-xl border transition-all"
    :class="
      slot.item
        ? 'border-dota-border bg-dota-surface'
        : 'cursor-pointer border-dashed border-dota-border/60 bg-dota-surface/40 hover:border-dota-gold-dim hover:bg-dota-surface/70'
    "
    @click="!slot.item && $emit('open', slot.index)"
  >
    <!-- Empty state -->
    <div
      v-if="!slot.item"
      class="flex flex-col items-center justify-center px-3 py-6"
    >
      <div class="flex size-10 items-center justify-center rounded-lg border border-dota-border/60 text-dota-muted">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span class="mt-2 text-xs text-dota-muted">Slot {{ slot.index + 1 }}</span>
    </div>

    <!-- Filled state -->
    <div v-else class="p-3">
      <!-- Clear button -->
      <button
        class="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-dota-bg/80 text-dota-muted opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        @click.stop="$emit('clear', slot.index)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Swap button -->
      <button
        class="absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-dota-bg/80 text-dota-muted opacity-0 transition-opacity hover:text-dota-gold group-hover:opacity-100"
        @click.stop="$emit('open', slot.index)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <ItemDetail :item="slot.item" />
    </div>
  </div>
</template>
