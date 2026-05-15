<script setup lang="ts">
import type { ShopName } from '~/types/item'
import { SHOP_COLORS } from '~/types/item'

const props = defineProps<{
  shop: ShopName
}>()

const colorClasses = computed(() => SHOP_COLORS[props.shop])
</script>

<template>
  <span
    :class="colorClasses"
    class="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight tracking-wide whitespace-nowrap"
  >
    {{ shop }}
  </span>
</template>
