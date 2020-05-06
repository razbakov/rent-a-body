<template>
  <TLoader v-if="!stream" />
  <div v-else class="bg-black text-white w-full h-screen">
    <div id="video" class="w-full h-screen"></div>
    <button
      @click="disconnect()"
      class="absolute top-0 right-0 m-4 bordered border-white p-4"
    >
      Stop
    </button>
    <TControlPad
      class="absolute bottom-0 right-0 m-4"
      :value.sync="stream.direction"
      @input="(direction) => update({ direction })"
    />
  </div>
</template>

<script>
import { createLocalVideoTrack, connect } from 'twilio-video'
import TControlPad from '~/components/TControlPad'
import TLoader from '~/components/TLoader'
import useAuth from '~/use/auth'
import useRouter from '~/use/router'
import useDoc from '~/use/liveDoc'

export default {
  components: {
    TControlPad,
    TLoader
  },
  data: () => ({
    room: null
  }),
  setup() {
    const { params } = useRouter()
    const id = params.id

    const { uid } = useAuth()

    const { doc: stream, update, loading, isCreator, exists } = useDoc(
      'streams',
      id
    )

    return {
      stream,
      update,
      loading,
      isCreator,
      exists,
      id,
      uid
    }
  },

  watch: {
    loading(loading) {
      if (loading) {
        return
      }

      this.init()
    }
  },

  methods: {
    async init() {
      const data = {
        identity: this.uid,
        room: this.id
      }

      const token = (
        await (
          await fetch(
            'https://us-central1-rent-a-body.cloudfunctions.net/twilio',
            {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' }
            }
          )
        ).json()
      ).token

      if (this.isCreator) {
        this.initSpeaker(token)
      } else {
        this.initViewer(token)
      }
    },
    disconnect() {
      if (this.room) {
        this.room.disconnect()
      }
    },
    async initSpeaker(token) {
      const track = await createLocalVideoTrack()
      this.attachTrack(track)

      this.room = await connect(token, {
        tracks: [track],
        video: {
          facingMode: 'environment'
        }
      })
    },
    async initViewer(token) {
      this.room = await connect(token, {
        audio: false,
        video: false
      })

      this.room.on('participantConnected', (participant) => {
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            this.attachTrack(publication.track)
          }
        })

        participant.on('trackSubscribed', this.attachTrack)
      })
    },
    attachTrack(track) {
      document.getElementById('video').appendChild(track.attach())
    }
  }
}
</script>
