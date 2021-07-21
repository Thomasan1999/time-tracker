<template lang="pug">
div.select-field(ref="root" @click="visible = !visible")
    slot(name="active")
    teleport(v-if="visible" to="#portal")
        div.select-option-container(:class="{visible}" :style="position" @click="visible = !visible")
            slot
</template>

<script lang="ts">
import {onMounted, reactive, ref, watch} from "vue";

export default {
    name: 'SelectField',
    setup() {
        const visible = ref(false)

        const root = ref<HTMLDivElement | null>(null)

        const position = reactive({
            left: 0,
            top: 0
        })

        onMounted(() => {
            const rootClientRect = root.value!.getBoundingClientRect()

            position.left = `${rootClientRect.left - 5}px`
            position.top = `${rootClientRect.top + 40}px`
        })

        watch(visible, () => {
            const onClick = ($event) => {
                if (!root.value?.contains($event.target)) {
                    visible.value = false
                }
            }

            if (visible.value) {
                window.addEventListener('click', onClick)
            }
            else {
                window.removeEventListener('click', onClick)
            }
        })

        return {
            position,
            root,
            visible
        }
    }
}
</script>

<style lang="scss" scoped>
.select-field {
    cursor: default;
    position: relative;
}

.select-option-container {
    background-color: #eeeeee;
    box-shadow: 0 5px 5px 3px rgba(0, 0, 0, .3);
    height: 40px;
    left: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    width: 150px;
    z-index: 1;

    &.visible {
        height: auto;
    }
}
</style>
