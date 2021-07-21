<template lang="pug">
router-view
div#portal
</template>

<script lang="ts">
    export default {
        name: 'App'
    }
</script>

<style lang="scss">
@import './reset.scss';

* {
    color: currentColor;
    font: inherit;
}

input, select, .select-field {
    background-color: transparent;
    border: 0;
    width: 100%;
}

.select-option-container {
    & > * {
        padding-left: 5px;
        padding-right: 5px;
    }
}

.select-option {
    align-items: center;
    display: flex;
    height: 40px;
}
</style>
