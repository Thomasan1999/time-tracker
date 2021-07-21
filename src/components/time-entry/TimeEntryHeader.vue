<template lang="pug">
div.time-entry-header(:class="columnName" @click="$emit('click')")
    slot
        | {{titleHtml}}
    div(v-if="sorted") {{sortOrder === -1 ? '&#9660;' : '&#9650;'}}
</template>

<script lang="ts">
import {computed} from 'vue'

export default {
    name: 'TimeEntryHeader',
    emits: ['click'],
    props: {
        columnName: {
            required: true,
            type: String
        },
        sorted: {
            required: true,
            type: Boolean
        },
        sortOrder: {
        },
        title: {
            type: String
        }
    },
    setup(props) {
        const titleHtml = computed(() => {
            return props.title ?? `${props.columnName}:`
        })

        return {
            titleHtml
        }
    }
}
</script>

<style lang="scss" scoped>
.time-entry-header {
    display: flex;
    text-transform: capitalize;
}
</style>
