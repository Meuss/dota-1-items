<script setup lang="ts">
import type { DotaItem } from '~/types/item'

defineProps<{
  item: DotaItem
}>()
</script>

<template>
  <div class="space-y-2.5">
    <!-- Item header -->
    <div class="flex items-start gap-3">
      <img
        :src="item.image"
        :alt="item.name"
        class="size-12 shrink-0 rounded object-cover"
      />
      <div class="min-w-0">
        <h3 class="text-sm font-bold text-white">{{ item.name }}</h3>
        <div class="mt-1 flex items-center gap-2">
          <span v-if="item.buyPrice !== null" class="text-xs font-semibold text-dota-gold">
            {{ item.buyPrice.toLocaleString() }}g
          </span>
          <ShopBadge :shop="item.shop" />
        </div>
      </div>
    </div>

    <!-- Components / Recipe (recursive) -->
    <div v-if="item.components.length > 0" class="space-y-1">
      <div class="text-[10px] font-semibold uppercase tracking-wider text-dota-muted">
        Requires
      </div>
      <ComponentTree :components="item.components" />
    </div>

    <!-- No components: basic item -->
    <div v-else class="text-[10px] italic text-dota-muted">
      Basic item — buy directly
    </div>
  </div>
</template>
