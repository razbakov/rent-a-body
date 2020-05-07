<template>
  <TLoader v-if="!stream" />
  <div v-else class="bg-black text-white w-full h-screen">
    <div v-if="isCreator" class="absolute top-0 left-0 m-4 z-50">
      <button
        v-for="camera in cameras"
        :key="camera.deviceId"
        class="border border-white p-2 m-1"
        @click="setCamera(camera.deviceId)"
      >
        {{ camera.label }}
      </button>
    </div>
    <div
      ref="video"
      class="w-full h-screen flex items-center justify-center"
    ></div>
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
    room: null,
    cameras: [],
    cameraId: '',
    token: ''
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
    cameraId() {
      this.initSpeaker()
    },
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

      this.token = (
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
        this.initSpeaker()
      } else {
        this.initViewer()
      }
    },
    setCamera(deviceId) {
      this.cameraId = deviceId
    },
    async initSpeaker() {
      console.log('initSpeaker')

      const devices = await navigator.mediaDevices.enumerateDevices()
      this.cameras = devices.filter((device) => device.kind === 'videoinput')

      let options = {}

      if (this.cameraId) {
        options = {
          deviceId: { exact: this.cameraId }
        }
      }

      const track = await createLocalVideoTrack(options)

      this.attachTrack(track)

      if (!this.room) {
        this.room = await connect(this.token, {
          tracks: [track],
          video: {
            facingMode: 'environment',
            height: 1280,
            width: 720
          }
        })
      } else {
        const localParticipant = this.room.localParticipant
        const tracks = Array.from(localParticipant.getVideoTracks().values())
        if (tracks.length) {
          localParticipant.unpublishTracks(tracks)
        }
        localParticipant.publishTrack(track)
      }
    },
    async initViewer(token) {
      this.room = await connect(this.token, {
        audio: false,
        video: false
      })

      this.room.participants.forEach((participant) => {
        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            this.attachTrack(publication.track)
          }
        })
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
      this.$refs.video.innerHTML = ''
      this.$refs.video.append(track.attach())
    }
  }
}
</script>
