<template>
  <TLoader v-if="!stream" />
  <div v-else class="bg-black text-white w-full h-screen overflow-hidden">
    <div class="absolute top-0 left-0 w-full m-4 z-50 text-center text-sm">
      {{ message }}
    </div>
    <div v-if="isCreator" class="absolute top-0 left-0 m-4 mt-32 z-50">
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
      id="video"
      class="w-full h-screen overflow-hidden flex items-center justify-center"
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
    cameraId: null,
    token: '',
    track: null,
    message: ''
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
      this.log('Joining as Speaker')

      const devices = await navigator.mediaDevices.enumerateDevices()
      this.cameras = devices.filter((device) => device.kind === 'videoinput')

      let options = {}

      if (this.cameraId) {
        options = {
          deviceId: { exact: this.cameraId }
        }
      }

      if (this.track) {
        this.log(`Stopping track ${this.track.name}`)
        this.track.stop()
        if (this.room?.localParticipant) {
          this.log(`Unpublishing tracks`)
          const tracks = Array.from(
            this.room.localParticipant.videoTracks.values()
          ).map((publication) => publication.track)
          this.room.localParticipant.unpublishTracks(tracks)
        }
      }

      this.track = await createLocalVideoTrack(options)

      if (!this.room) {
        this.room = await connect(this.token, {
          video: {
            facingMode: 'environment'
          }
        })
      }

      this.log(`Publishing track ${this.track.name}`)
      this.room.localParticipant.publishTrack(this.track)
      this.attachTrack(this.track, this.room.localParticipant)
    },
    async initViewer(token) {
      this.log('Joining as Viewer')
      this.room = await connect(this.token, {
        audio: false,
        video: false
      })

      const localParticipant = this.room.localParticipant

      this.log(`Connected to the room as ${localParticipant.identity}`)

      this.room.participants.forEach((participant) => {
        this.log(`Participant ${participant.identity} is connected`)

        participant.tracks.forEach((publication) => {
          if (publication.track) {
            this.attachTrack(publication.track, participant)
          }
        })

        participant.on('trackSubscribed', (track) =>
          this.attachTrack(track, participant)
        )
      })

      this.room.once('participantConnected', (participant) => {
        this.log(`Participant ${participant.identity} has joined`)

        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            this.attachTrack(publication.track, participant)
          }
        })

        participant.on('trackSubscribed', (track) =>
          this.attachTrack(track, participant)
        )
      })
    },
    attachTrack(track, participant) {
      this.log(`Attaching track ${track.name} of ${participant?.identity}`)

      this.$refs.video.innerHTML = ''
      this.$refs.video.append(track.attach())
    },
    log(message) {
      console.log(message)
      this.message = message
    }
  }
}
</script>

<style>
html,
body {
  overflow: hidden;
}

#video video {
  max-height: 100vh;
}
</style>
