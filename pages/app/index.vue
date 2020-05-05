<template>
  <div class="bg-gray-100">
    <div class="bg-gray-100 p-4 container mx-auto md:max-w-md min-h-screen">
      <main>
        <TCardList
          :collection="collection"
          :title="title"
          :add="add"
          :fields="fields"
          :filters="filters"
        >
          <template v-slot="{ item }">
            <div class="p-4 card-item">
              <div class="font-bold text-xl mb-2">{{ item.title }}</div>
              <div class="text-xs mb-4">
                Created on {{ getDateTime(item.createdAt) }}
              </div>
              <TButton :to="`/app/${item.id}`">Open Stream</TButton>
            </div>
          </template>
        </TCardList>
      </main>
    </div>
  </div>
</template>

<script>
import useAuth from '~/use/auth'
import useDoc from '~/use/doc'
import { getDay, getTime, getDate, getDateTime } from '~/utils'
import TCardList from '~/components/TCardList'
import TButton from '~/components/TButton'

export default {
  middleware: ['auth'],
  components: {
    TCardList,
    TButton
  },
  data: () => ({
    importingGame: false
  }),
  setup() {
    const { can } = useAuth()
    const { create } = useDoc('streams')

    const title = 'Streams'
    const collection = 'streams'
    const add = 'Start Streaming'

    const fields = [
      {
        name: 'title',
        label: 'Title'
      }
    ]

    const filters = []

    return {
      can,
      getDay,
      getTime,
      getDate,
      getDateTime,
      fields,
      title,
      collection,
      add,
      create,
      filters
    }
  }
}
</script>
