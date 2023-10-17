<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import Loading from "@/Icons/Loading.vue";
import SimpleBlankInput from "../form/SimpleBlankInput.vue";
import SimpleInput from "../form/SimpleInput.vue";
import SimpleSelect from "../form/SimpleSelect.vue";
import { ref } from "vue";
import { fetchApi } from "@/helpers/http";

interface Props {
    onClose?: () => void;
    onAdded?: (test: any) => void;
    edit?: Record<string, string>;
}
const props = defineProps<Props>();

const isPosting = ref<boolean>(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const fieldErrs = ref<Record<string, string[]>>({});

async function handleFormSubmit(evt: any) {
    if (isPosting.value) {
        return;
    }
    isPosting.value = true;
    error.value = null;
    message.value = null;
    fieldErrs.value = {};

    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });

    if (res.success) {
        message.value = res.message!;
        props.onAdded && props.onAdded(res.rows[0]);
    } else {
        error.value = res.message;
        fieldErrs.value = res.field || {};
    }

    isPosting.value = false;
}
</script>
<template>
    <div class="modal-backdrop test-form-modal">
        <div class="modal-body">
            <h2 class="fs-2xl">{{ edit ? "Edit" : "Add New" }} Test</h2>
            <form
                method="POST"
                :action="API_BASE + '/tests'"
                @submit.prevent="handleFormSubmit"
            >
                <input type="hidden" name="id" :value="edit.id" v-if="edit" />
                <p v-if="error" class="form-alert error">{{ error }}</p>
                <p v-if="message" class="form-alert success">{{ message }}</p>
                <div class="input-grid">
                    <SimpleInput
                        :unWrap="true"
                        name="name"
                        label="Test Name"
                        :hint="fieldErrs.name?.[0]"
                        :value="edit?.name"
                    />
                    <SimpleSelect
                        :unWrap="true"
                        name="type"
                        label="Type"
                        :hint="fieldErrs.type?.[0]"
                        :value="edit?.type"
                    >
                        <option value="">Select type</option>
                        <option value="cyto">Cytopathology</option>
                        <option value="histo">Histopathology</option>
                    </SimpleSelect>
                    <SimpleSelect
                        :unWrap="true"
                        name="size"
                        label="Size"
                        :hint="fieldErrs.size?.[0]"
                        :value="edit?.size"
                    >
                        <option value="">Select size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="complex">Complex</option>
                    </SimpleSelect>
                    <SimpleBlankInput
                        :un-wrap="true"
                        label="Price"
                        :hint="fieldErrs.price?.[0]"
                    >
                        <div class="price-input flex items-center">
                            BDT
                            <input
                                type="number"
                                name="price"
                                :value="
                                    edit ? (edit.price as any / 100).toFixed(2) : 0
                                "
                            />
                        </div>
                    </SimpleBlankInput>
                </div>
                <div class="buttons flex items-center justify-center">
                    <button type="submit">
                        <Loading v-if="isPosting" size="15" />
                        {{ edit ? "Update Test" : "Add Test" }}
                    </button>
                    <button type="button" class="btn-outline" @click="onClose">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
<style lang="scss">
.modal-backdrop {
    position: fixed;
    z-index: 999;
    background: rgba($color: #000000, $alpha: 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
}
.modal-body {
    min-height: 200px;
    background: var(--clr-white);
    min-width: 320px;
}

.test-form-modal {
    h2 {
        text-align: center;
        font-weight: bold;
    }

    .modal-body {
        padding: 30px 50px;
        min-width: 500px;
    }

    form {
        margin-top: 20px;

        .form-alert {
            margin-bottom: 20px;
        }
    }

    .input-grid {
        display: grid;
        grid-template-columns: max-content auto;
        gap: 10px;

        .price-input {
            gap: 5px;

            input {
                padding: 3px 8px;
                width: 100px;
                margin: 0;
            }
        }
    }

    .buttons {
        gap: 20px;
        margin-top: 30px;
    }
}
</style>
