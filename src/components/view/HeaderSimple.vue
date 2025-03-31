<script setup lang="ts">
import { useRouter } from "vue-router";
import Icon from "@/components/base/Icon.vue";
import { onMounted, onUnmounted } from "vue";

export interface Props {
    title: string;
    onClose?: () => void;
}
const props = defineProps<Props>();

const router = useRouter();

const onCloseClick = () => {
    if (props.onClose) {
        props.onClose(router);
        return;
    }
    router.back();
};

const escEvt = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
        onCloseClick();
    }
};

onMounted(() => {
    document.addEventListener("keydown", escEvt);
});

onUnmounted(() => {
    document.removeEventListener("keydown", escEvt);
});

</script>

<template>
    <div class="simple-header">
        <h1 class="fs-2xl flex-grow">{{ title }}</h1>
        <button
            type="button"
            @click="() => onCloseClick(router)"
            class="simple-close-btn"
        >
            <Icon size="40" view-box="36">
                <path
                    fill="currentColor"
                    d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                    class="clr-i-outline clr-i-outline-path-1"
                />
                <path fill="none" d="M0 0h36v36H0z" />
            </Icon>
        </button>
    </div>
</template>
<style lang="scss" scoped>
.simple-header {
    display: flex;
    gap: 20px;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--clr-black);

    .simple-close-btn {
        background: transparent;
        color: var(--clr-black);
        padding: 5px;
    }
    .simple-close-btn:hover {
        color: var(--clr-accent);
    }
}
</style>
