<template lang="pug">
div.time-entry-filter
    p.time-entry-filter-heading Filter time entries:
    form.time-entry-filter-form
        div.time-entry-filter-name
            label
                | Name:
                input(
                    :value="name"
                    @input="($event) => $emit('update:name', $event.target.value)"
                )
        div.time-entry-filter-types-container
            label Types:
            div.time-entry-filter-types
                label.time-entry-filter-type(v-for="(typeName, typeId) in allTypes" :key="typeId")
                    input(
                        :checked="Boolean(types.includes(typeId))"
                        type="checkbox"
                        @input="($event) => onTypeInput(typeId, $event.target.checked)"
                    )
                    | {{allTypes[typeId]}}
</template>

<script lang="ts">
export default {
    name: 'TimeEntryFilter',
    emits: ['update:name', 'update:types'],
    props: {
        allTypes: {
            required: true,
            type: Object
        },
        name: {
            required: true,
            type: String
        },
        types: {
            required: true,
            type: Array
        }
    },
    setup(props, {emit}) {
        const onTypeInput = (typeId: string, checked: boolean) => {
            const newTypes = checked
                ? [...new Set([...props.types, typeId])]
                : props.types.filter((otherType) => {
                    return otherType !== typeId
                })

            emit('update:types', newTypes)
        }

        return {
            onTypeInput
        }
    }
}
</script>

<style lang="scss" scoped>
.time-entry-filter {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.time-entry-filter-heading {
    margin-bottom: 10px;
}

.time-entry-filter-form {
    display: flex;
    gap: 15px;
}

input {
    background-color: #eeeeee;
}

.time-entry-filter-types-container {
    display: flex;
    flex-direction: column;
}

.time-entry-filter-types {
    display: flex;
    gap: 10px;
}

.time-entry-filter-type {
    align-items: center;
    display: flex;
    gap: 5px;

    input {
        height: 1em;
        width: 1em;
    }
}
</style>
