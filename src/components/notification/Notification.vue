<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";

import type { CSSProperties } from "vue";
import type { NotificationProps } from ".";
interface Props extends /* @vue-ignore */ NotificationProps {
    id: string;
}

const props = withDefaults(defineProps<Props>(), {
    duration: 2000,
});

const visible = ref(false);
let timer: (() => void) | undefined = undefined;

const horizontalClass = computed(() =>
    props.position?.endsWith("left")
        ? "notification-left"
        : "notification-right"
);

const verticalProperty = computed(() =>
    props.position?.startsWith("bottom") ? "bottom" : "top"
);

const positionStyle = computed<CSSProperties>(() => {
    return {
        [verticalProperty.value]: `${props.offset}px`,
        zIndex: 99,
    };
});

function startTimer() {
    if (props.duration && props.duration > 0) {
        ({ stop: timer } = useTimeoutFn(() => {
            if (visible.value) close();
        }, props.duration));
    }
}

function clearTimer() {
    timer?.();
}

function close() {
    visible.value = false;
    // @ts-ignore
    props.onClose?.();
}

onMounted(() => {
    startTimer();
    visible.value = true;
});

defineExpose({
    visible,
    close,
});
</script>
<template>
    <div
        v-show="visible"
        :id="id"
        :class="[horizontalClass, 'notification']"
        :style="positionStyle"
        role="alert"
        @mouseenter="clearTimer"
        @mouseleave="startTimer"
    >
        <div class="notification-body">
            <h2 class="notification-title" v-text="title" />
            <div
                v-show="message"
                class="notification-content"
                :style="!!title ? undefined : { margin: 0 }"
            >
                <slot>
                    <p v-if="!dangerouslyUseHTMLString">{{ message }}</p>
                    <p v-else v-html="message" />
                </slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.notification {
    position: fixed;
    background: white;
    box-shadow: 2px 4px 8px #a5a5a5;
    padding: 10px;
    border-radius: 8px;

    &-left {
        left: 20px;
    }

    &-right {
        right: 20px;
    }
}
</style>
