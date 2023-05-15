<!-- eslint-disable vue/multi-word-component-names -->
<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

export interface NotificationProps {
    state?: "open" | "closed";
}

const props = defineProps<NotificationProps>();

const emit = defineEmits<{
    (e: "update:state", state: NotificationProps["state"]): void;
}>();

/**
 * We need this additional variable to let the
 * `state` model be optional
 */
const state = ref<NotificationProps["state"]>(
    props.state === "open" ? "open" : "closed"
);

const toggle = () => {
    const newState = state.value === "closed" ? "open" : "closed";
    state.value = newState;
    emit("update:state", newState);
};

watch(props, (newProps) => {
    if (newProps.state) {
        state.value = newProps.state;
    }
});
</script>

<template>
    <div class="notification">
        <button type="button" class="notification-trigger" @click="toggle">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 21H14C14 22.1 13.1 23 12 23C10.9 23 10 22.1 10 21ZM21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2C13.1 2 14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19ZM17 11C17 8.2 14.8 6 12 6C9.2 6 7 8.2 7 11V18H17V11Z"
                    fill="black"
                />
            </svg>
            <div class="sr-only">Toggle NotificationProps</div>
        </button>
        <div v-if="state === 'open'" class="notification-floating">
            <slot></slot>
        </div>
    </div>
</template>

<style>
.notification {
    position: relative;
}
.notification-trigger {
    margin: 0;
    padding: 0;
    display: inline-block;
    line-height: 1;
    cursor: pointer;
}

.notification-floating {
    position: absolute;
    top: 100%;
    background: white;
    box-shadow: 0 2px 5px rgb(128, 128, 128);
    border-radius: 5px;
    max-height: 60vh;
    max-width: 500px;
    min-width: 300px;
    overflow: auto;
    padding: 5px;
    z-index: 999;
}

</style>
