<script setup lang="ts">
const { totalCost, clearAll, slots } = useItemStore()

const hasAnyItem = computed(() => slots.value.some(s => s.item !== null))
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <!-- Header -->
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-white">
        <span class="text-dota-gold">Dota 1</span> Item Helper
      </h1>
      <p class="mt-2 text-sm text-dota-muted">
        Pick your 6 items to see stats, costs, and shop locations at a glance
      </p>
    </div>

    <!-- Slot grid -->
    <ItemSlotGrid />

    <!-- Bottom bar: total cost + clear all -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm">
        <span class="text-dota-muted">Total cost:</span>
        <span class="ml-2 text-lg font-bold text-dota-gold">
          {{ totalCost.toLocaleString() }}
        </span>
        <span class="text-dota-gold/60">gold</span>
      </div>
      <button
        v-if="hasAnyItem"
        class="rounded-lg border border-dota-border px-3 py-1.5 text-xs text-dota-muted transition-colors hover:border-red-500/50 hover:text-red-400"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>

    <!-- Shop map -->
    <div class="mt-10">
      <h2 class="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-dota-muted">
        Shop Locations
      </h2>
      <div class="overflow-hidden rounded-xl border border-dota-border">
        <img
          src="/shops.jpg"
          alt="Dota 1 shop locations map"
          class="w-full"
        />
      </div>
    </div>

    <!-- Item picker modal -->
    <ItemPicker />
  </div>
</template>
