<template lang="pug">
div.date-field
    div
        input(:name="`${name}Date`" :min="minDate" required="" type="date" v-model="date" @input="onInput")
    div
        input(:name="`${name}Time`" :min="minTime" required="" type="time" v-model="time" @input="onInput")
</template>

<script lang="ts">
import dayjs, {Dayjs} from 'dayjs'
import {computed, ref, watch} from 'vue'

export default {
    name: 'DateField',
    emits: ['update:modelValue'],
    props: {
        min: {
            type: Number,
        },
        modelValue: {
            type: Number
        },
        name: {
            required: true,
            type: String
        }
    },
    setup(props, {emit}) {
        const getFormattedDate = (date: Dayjs) => {
            return date.format('YYYY-MM-DD')
        }

        const getFormattedTime = (date: Dayjs) => {
            return date.format('HH:mm')
        }

        const onInput = () => {
            if (!date.value && !time.value) {
                emit('update:modelValue', 0)
                return
            }

            if (!date.value || !time.value) {
                return
            }

            const newValue = dayjs(`${date.value} ${time.value}`).valueOf()

            emit('update:modelValue', newValue)
        }

        const date = ref<string | undefined>()
        const time = ref<string | undefined>()

        const minDate = computed(() => {
            if (!props.min) {
                return
            }

            return getFormattedDate(dayjs(props.min))
        })

        const minTime = computed(() => {
            const minFullDate = dayjs(props.min)

            const dateSameAsMinDate = minFullDate.diff(date.value, 'd') === 0

            if (!props.min || !dateSameAsMinDate) {
                return
            }

            return getFormattedTime(minFullDate)
        })

        watch(() => props.modelValue, () => {
            if (!props.modelValue) {
                date.value = undefined
                time.value = undefined
                return
            }

            const fullDate = dayjs(props.modelValue)

            date.value = getFormattedDate(fullDate)
            time.value = getFormattedTime(fullDate)
        }, {immediate: true})

        return {
            date,
            minDate,
            minTime,
            onInput,
            time
        }
    }
}
</script>

<style lang="scss" scoped>
</style>
