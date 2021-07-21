<template lang="pug">
form.time-entry-row.time-entry(@reset.prevent="$emit('reset')" @submit.prevent="onSubmit")
    div.type
        select-field
            template(#active)
                div.select-option.active {{types[type]}}
            div.select-option(
                v-for="typeOption in typeOptions"
                :key="typeOption.name"
                @click="$emit('input', 'type', typeOption.name)"
            )
                | {{typeOption.title}}
            form.select-option(@click.stop @submit.prevent="addType")
                input(placeholder="New type" v-model="newType")
    div.name.add-time-entry-name
        input(
            name="name"
            :placeholder="unsaved ? 'New Entry' : 'Name'"
            required=""
            :value="name"
            @input="($event) => $emit('input', 'name', $event.target.value)"
        )
    date-field.from(name="from" :model-value="from" @update:modelValue="(newValue) => $emit('input', 'from', newValue)")
    from-to-hyphen
    date-field.to(name="to" :min="from" :model-value="to" @update:modelValue="(newValue) => $emit('input', 'to', newValue)")
    div.timeDiff ({{timeDiff || '00:00:00'}})
    div.controls
        template(v-if="unsaved")
            button(
                :disabled="from && to"
                type="button"
                @click="$emit('input', !from ? 'from' : 'to', Date.now())"
            ) {{from ? 'End Timer' : 'Start Timer'}}
            button(
                :disabled="submitDisabled"
                :title="submitDisabled ? 'Must fill form data before adding' : 'Add'"
                @click="submitDisabled ? $event.preventDefault() : undefined"
            ) ✓
            button(title="Reset form data" type="reset") X
        template(v-else)
            button(title="Delete" type="button" @click="$emit('delete')") X
</template>

<script lang="ts">
import DateField from '@/components/DateField.vue'
import FromToHyphen from '@/components/FromToHyphen.vue'
import store from '@/store'
import {computed, ref, watch} from 'vue'
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import SelectField from "@/components/SelectField.vue";

dayjs.extend(duration)

export default {
    name: 'TimeEntry',
    components: {
        SelectField,
        DateField,
        FromToHyphen
    },
    emits: ['addType', 'delete', 'input', 'reset', 'save'],
    props: {
        from: {
            required: true,
            type: Number,
        },
        name: {
            required: true,
            type: String
        },
        unsaved: {
            default: false,
            type: Boolean
        },
        to: {
            required: true,
            type: Number,
        },
        type: {
            required: true,
            type: String
        }
    },
    setup(props, {emit}) {
        const addType = () => {
            emit('addType', newType.value)
            newType.value = ''
        }

        const onSubmit = () => {
            if (!valid) {
                return
            }

            emit('save')
        }

        const setTimeDiff = () => {
            if (!props.from && !props.to) {
                return
            }

            const diff = dayjs(props.to || Date.now()).diff(props.from || Date.now())

            timeDiff.value = dayjs.duration(diff).format('HH:mm:ss')
        }

        const setTimer = () => {
            setTimeDiff()

            timeDiffInterval = window.setInterval(setTimeDiff, 1000)
        }

        const unsetTimer = () => {
            if (timeDiffInterval === null) {
                return
            }

            window.clearInterval(timeDiffInterval)
            timeDiffInterval = null
        }

        const newType = ref('')

        const timeDiff = ref<string | undefined>()

        let timeDiffInterval: number | null = null

        const submitDisabled = computed(() => {
            return !props.name || !props.type || !props.from || !props.to
        })

        const timerSet = computed(() => {
            return Boolean(props.from) && !props.to
        })

        const types = computed(() => {
            return store.timeEntryTypes
        })

        const typeOptions = computed(() => {
            return Object.entries(store.timeEntryTypes)
                .map(([name, title]) => {
                    return {name, title}
                })
        })

        const valid = computed(() => {
            return props.from <= props.to;
        })

        watch(() => [props.from, props.to], () => {
            setTimeDiff()
        }, {immediate: true})

        watch(() => timerSet.value, () => {
            if (timerSet.value) {
                setTimer()
            }
            else {
                unsetTimer()
            }
        }, {immediate: true})

        return {
            addType,
            newType,
            onSubmit,
            setTimer,
            submitDisabled,
            timeDiff,
            types,
            typeOptions
        }
    }
}
</script>

<style lang="scss" scoped>
.time-entry {
    display: flex;
}
</style>
