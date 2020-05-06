<template>
  <TLoader v-if="!stream" />
  <div v-else class="bg-black text-white w-full h-screen p-4">
    <div id="remote"></div>
    <TControlPad
      :value.sync="stream.direction"
      @input="(direction) => update({ direction })"
    />
  </div>
</template>

<script>
import { createLocalTracks, connect } from 'twilio-video'
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
    uid(uid) {
      if (!uid) {
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

      this.initTwilio(token)
    },
    async initTwilio(token) {
      const tracks = await createLocalTracks()

      const room = await connect(token, {
        tracks
      })

      const localParticipant = room.localParticipant
      console.log(
        `Connected to the Room as LocalParticipant "${localParticipant.identity}"`
      )

      // Log any Participants already connected to the Room
      room.participants.forEach((participant) => {
        console.log(
          `Participant "${participant.identity}" is connected to the Room`
        )
      })
      // Log Participants as they disconnect from the Room
      room.once('participantDisconnected', (participant) => {
        console.log(
          `Participant "${participant.identity}" has disconnected from the Room`
        )
      })

      room.on('participantConnected', (participant) => {
        console.log(`Participant "${participant.identity}" connected`)

        participant.tracks.forEach((publication) => {
          if (publication.isSubscribed) {
            const track = publication.track
            document.getElementById('remote').appendChild(track.attach())
          }
        })

        participant.on('trackSubscribed', (track) => {
          document.getElementById('remote').appendChild(track.attach())
        })
      })
    }
  }
}
</script>
