<template>
  <main class="flex justify-center items-center h-screen w-full">
    <div>
      <p class="text-xs uppercase">Borderes closed?</p>
      <h1 class="font-bold text-4xl">Travel anywhere</h1>
      <p class="text-lg">
        Get control over a camera
      </p>
      <div class="text-center mt-3 w-full md:flex">
        <TButton v-if="!uid" to="/signup">
          Join Now
        </TButton>
        <TButton v-else to="/account">
          Go to my Account
        </TButton>
      </div>
    </div>
  </main>
</template>

<script>
import useAuth from '~/use/auth'
import TButton from '~/components/TButton'

export default {
  components: {
    TButton
  },
  setup() {
    const { uid } = useAuth()

    return {
      uid
    }
  }
}
</script>
