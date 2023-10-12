<script setup lang="ts">
import SimpleInput from "@/components/form/SimpleInput.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
import SimpleBlankInput from "@/components/form/SimpleBlankInput.vue";
import Icon from "@/components/base/Icon.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi, fetchWithOffline } from "@/helpers/http";
import {
    TABLES,
    getRowCount,
    getRows,
    insertRowBulk,
} from "@/helpers/local-db";
import { patientSchema } from "@worker/forms/patients";
import { onMounted, ref } from "vue";

const isPosting = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const tests = ref<Array<Record<string, number | string>>>([]);

onMounted(async () => {
    if (!navigator.onLine) {
        tests.value = getRows(TABLES.tests);
        return;
    }

    isLoading.value = true;
    const res = await fetchApi(`${API_BASE}/tests`);
    isLoading.value = false;
    if (!res.success) {
        error.value = res.message;
    } else {
        tests.value = res.rows || [];
        if (getRowCount(TABLES.tests) === 0) {
            insertRowBulk(TABLES.tests, tests.value);
        }
    }
});

async function handleFormSubmit(evt: any) {
    isPosting.value = true;
    const res = await fetchWithOffline(
        {
            key: "patients",
            operation: "insert",
            schema: patientSchema,
            arrays: ["tests"],
        },
        evt.target.action,
        {
            method: "POST",
            body: new FormData(evt.target),
        }
    );

    isPosting.value = false;
    if (res.success) {
        error.value = null;
        message.value = res.message!;
    } else {
        error.value = res.message;
    }
}
</script>
<template>
    <div class="add-patient-page">
        <div class="flex justify-between items-center">
            <h3>Add Patient</h3>
            <RouterLink :to="{ name: 'home' }">
                <Icon size="40" view-box="36">
                    <path
                        fill="currentColor"
                        d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                        class="clr-i-outline clr-i-outline-path-1"
                    /><path fill="none" d="M0 0h36v36H0z" />
                </Icon>
            </RouterLink>
        </div>
        <form
            :action="`${API_BASE}/patients`"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <div class="left-wrapper">
                <div class="left">
                    <h4 class="section-title all-col">Metadata</h4>
                    <SimpleSelect name="type" label="Type" :un-wrap="true">
                        <option value="cyto">Cytopathology</option>
                        <option value="histo">Histopathology</option>
                    </SimpleSelect>
                    <SimpleInput name="id" label="ID" :un-wrap="true" />

                    <h4 class="section-title all-col">Patient Information</h4>

                    <SimpleInput name="name" label="Name" :un-wrap="true" />
                    <SimpleBlankInput label="Age" :un-wrap="true">
                        <div class="flex items-center">
                            <input type="number" name="age" class="age-input" />
                            years
                        </div>
                    </SimpleBlankInput>

                    <SimpleBlankInput label="Gender" :un-wrap="true">
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="gen-male"
                                    value="male"
                                />
                                <label for="gen-male">Male</label>
                            </div>
                            <div class="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="gen-female"
                                    value="female"
                                />
                                <label for="gen-female">Female</label>
                            </div>
                        </div>
                    </SimpleBlankInput>
                    <SimpleInput
                        name="contact"
                        label="Contact"
                        :un-wrap="true"
                    />
                    <SimpleInput
                        name="referer"
                        label="Referer"
                        :un-wrap="true"
                    />
                    <SimpleInput
                        label="Delivery date"
                        :un-wrap="true"
                        type="date"
                        name="delivery_date"
                        field-class="date-input"
                    />

                    <div class="coll-col submit-area">
                        <CheckBox label="Show invoice on exit" />
                        <div class="flex gap-sm mt-sm">
                            <button type="submit" name="add">
                                Add Patient
                            </button>
                            <button
                                type="submit"
                                class="btn-outline"
                                name="draft"
                            >
                                Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right">
                <h4 class="section-title all-col">Specimen Information</h4>

                <SimpleInput
                    label="Entry date"
                    :un-wrap="true"
                    type="date"
                    name="entry_date"
                    field-class="date-input"
                />

                <SimpleInput label="Specimen" :un-wrap="true" name="specimen" />
                <SimpleInput
                    label="Sample collection date"
                    :un-wrap="true"
                    type="date"
                    name="sample_collection_date"
                    field-class="date-input"
                />
                <h4 class="section-title all-col">Tests</h4>
                <div class="all-col">
                    <ul class="tests"></ul>
                    <button>+ Add Test</button>
                    <div class="total"></div>
                </div>

                <h4 class="section-title all-col">Payment Information</h4>
                <SimpleBlankInput label="Discount" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT <input type="number" class="amount-input" />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput label="Payable" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT
                        <input
                            type="number"
                            class="amount-input"
                            readonly
                            value="7200"
                        />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput label="Advanced" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT <input type="number" class="amount-input" />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput label="Due" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT <input type="number" class="amount-input" />
                    </div>
                </SimpleBlankInput>
            </div>
        </form>
    </div>
</template>
<style lang="scss">
.add-patient-page {
    padding: 30px;
    height: 100%;
    display: flex;
    flex-flow: column;

    label {
        margin: 0;
    }

    form {
        flex-grow: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;

        input,
        select {
            max-width: 300px;
            padding: 3px 5px;
        }

        .amount-input {
            width: 100px;
            margin-bottom: 0;
        }
    }

    .left-wrapper {
        border-right: 1px solid var(--clr-black);
        padding-right: 20px;
        padding-bottom: 120px;
        overflow: hidden;
    }

    .left,
    .right {
        display: grid;
        gap: 10px;
        grid-template-columns: minmax(max-content, 200px) auto;
        height: max-content;
    }

    .left {
        .age-input {
            margin: 0;
            margin-right: 10px;
            width: 100px;
        }
    }
    .right {
        padding-left: 20px;
        .total {
            border-top: 1px solid var(--clr-black);
            margin-top: 10px;
        }
    }

    .section-title {
        border-bottom: 1px solid var(--clr-black);
        margin: 20px 0;
        font-size: var(--fs-lg);
    }

    .all-col {
        grid-column: 1 / 3;
    }

    .date-input {
        width: max-content;
        padding: 3px 5px;
    }

    .submit-area {
        background: var(--clr-white);
        position: fixed;
        bottom: 0px;
        left: 30px;
        width: calc(50% - 38px);
        padding-bottom: 40px;
    }
}
</style>
