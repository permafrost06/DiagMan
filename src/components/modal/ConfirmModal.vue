<script setup lang="ts">
import Icon from "../base/Icon.vue";
import { onMounted, ref } from "vue";

interface Props {
    title?: string;
    icon?: "delete" | "question";
}
defineProps<Props>();

const backDrop = ref<HTMLDivElement>();

onMounted(() => {
    backDrop.value!.addEventListener("click", () => {});
});
</script>
<template>
    <div ref="backDrop" class="confirm-modal">
        <div class="modal-body">
            <div class="modal-area">
                <div class="modal-icon">
                    <p
                        :class="{
                            delete: icon === 'delete',
                            question: icon === 'question',
                        }"
                    >
                        <Icon viewBox="24" size="20" v-if="icon === 'delete'">
                            <path
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                            />
                        </Icon>
                        <Icon viewBox="256" size="20" v-else>
                            <path
                                fill="currentColor"
                                d="M144 180a16 16 0 1 1-16-16a16 16 0 0 1 16 16Zm92-52A108 108 0 1 1 128 20a108.12 108.12 0 0 1 108 108Zm-24 0a84 84 0 1 0-84 84a84.09 84.09 0 0 0 84-84Zm-84-64c-24.26 0-44 17.94-44 40v4a12 12 0 0 0 24 0v-4c0-8.82 9-16 20-16s20 7.18 20 16s-9 16-20 16a12 12 0 0 0-12 12v8a12 12 0 0 0 23.73 2.56C158.31 137.88 172 122.37 172 104c0-22.06-19.74-40-44-40Z"
                            />
                        </Icon>
                    </p>
                </div>
                <div class="modal-main">
                    <h2 class="modal-title" v-if="title">
                        {{ title }}
                    </h2>

                    <slot v-else name="title"></slot>
                    <slot></slot>
                </div>
            </div>
            <div class="modal-buttons">
                <slot name="buttons"></slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
.confirm-modal {
    position: fixed;
    background: rgba($color: #000000, $alpha: 0.4);
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;

    .modal-body {
        position: relative;
        width: 100%;
        max-width: 500px;
        background: var(--clr-white);
        overflow: hidden;
        padding: 20px;
        display: flex;
        flex-flow: column;

        .modal-area {
            flex-grow: 1;
            display: flex;
            padding: 10px 0;

            .modal-icon {
                padding: 0 10px;

                p {
                    height: 40px;
                    width: 40px;
                    min-width: 40px;
                    border: 1px solid;
                    border-radius: 100%;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &.delete {
                        color: var(--clr-danger);
                    }

                    &.question {
                        color: var(--clr-warning);
                    }
                }
            }

            .modal-main {
                flex-grow: 1;
                padding: 20px 10px;
                padding-top: 0;

                .modal-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    font-size: var(--fs-xl);
                }
            }
        }

        .modal-buttons {
            border-top: 1px solid var(--clr-black);
            padding-top: 10px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    }
}
</style>
