<template>
  <div class="inline-block">
    <div class="flex justify-center">
      <div
        class="m-1 rounded border border-white w-16 h-16 flex justify-center items-center"
        :class="{ 'bg-white text-black': value === 'up' }"
        @mousedown="$emit('input', 'up')"
        @mouseup="$emit('input', 'stop')"
      >
        <TIcon name="up" />
      </div>
    </div>
    <div class="flex">
      <div
        class="m-1 rounded border border-white w-16 h-16 flex justify-center items-center"
        :class="{ 'bg-white text-black': value === 'left' }"
        @mousedown="$emit('input', 'left')"
        @mouseup="$emit('input', 'stop')"
      >
        <TIcon name="left" />
      </div>
      <div
        class="m-1 rounded border border-white w-16 h-16 flex justify-center items-center"
        :class="{ 'bg-white text-black': value === 'down' }"
        @mousedown="$emit('input', 'down')"
        @mouseup="$emit('input', 'stop')"
      >
        <TIcon name="down" />
      </div>
      <div
        class="m-1 rounded border border-white w-16 h-16 flex justify-center items-center"
        :class="{ 'bg-white text-black': value === 'right' }"
        @mousedown="$emit('input', 'right')"
        @mouseup="$emit('input', 'stop')"
      >
        <TIcon name="right" />
      </div>
    </div>
  </div>
</template>

<script>
import TIcon from '~/components/TIcon'

export default {
  components: {
    TIcon
  },
  props: {
    value: {
      type: String,
      default: 'stop'
    }
  }
}
</script>
