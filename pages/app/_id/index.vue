<template>
  <TLoader v-if="!stream" />
  <div v-else class="bg-black text-white w-full h-screen p-4">
    <TControlPad
      :value.sync="stream.direction"
      @input="(direction) => update({ direction })"
    />
  </div>
</template>

<script>
import TControlPad from '~/components/TControlPad'
import TLoader from '~/components/TLoader'
import useRouter from '~/use/router'
import useDoc from '~/use/liveDoc'

export default {
  components: {
    TControlPad,
    TLoader
  },
  setup() {
    const { params } = useRouter()
    const id = params.id

    const { doc: stream, update, loading, isCreator, exists } = useDoc(
      'streams',
      id
    )

    return {
      stream,
      update,
      loading,
      isCreator,
      exists
    }
  }
}
</script>
