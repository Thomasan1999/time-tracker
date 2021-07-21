<template lang="pug">
div.page-index-container
    router-link.page-index(
        v-for="index in numberOfPages"
        :class="{active: modelValue === index - 1}"
        :to="{query: {...$route.query, pageNumber: index}}"
    ) {{index}}
</template>

<script lang="ts">
export default {
    name: 'PageIndexContainer',
    props: {
        modelValue: {
            required: true,
            type: Number
        },
        numberOfPages: {
            required: true,
            type: Number
        }
    },
    setup() {

    }
}
</script>

<style lang="scss" scoped>
.page-index-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.page-index {
    align-items: center;
    cursor: pointer;
    display: flex;
    justify-content: center;
    padding: 10px;
    text-decoration: none;

    &.active {
        background-color: blue;
        color: white;
    }
}
</style>
