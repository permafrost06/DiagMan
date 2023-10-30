<script setup lang="ts">
import SimpleInput from "@/components/form/SimpleInput.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
import SimpleBlankInput from "@/components/form/SimpleBlankInput.vue";
import Icon from "@/components/base/Icon.vue";
import CheckBox from "@/components/form/CheckBox.vue";
import Loading from "@/Icons/Loading.vue";
import TestSelector from "./TestSelector.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { dateToDMY, dmyToDate } from "@/helpers/utils";
import { onMounted, ref } from "vue";
// @ts-ignore
import datepicker from "js-datepicker";
import "js-datepicker/dist/datepicker.min.css";
import router from "@/router";

const props = defineProps<{
    toEdit?: Record<string, string>;
    headless?: boolean;
    onSuccess?: (row: Record<string, string>, msg: string) => void;
}>();

const entryDateField = ref<HTMLInputElement>();
const sampleDateField = ref<HTMLInputElement>();
const deliveryDateField = ref<HTMLInputElement>();

const isPosting = ref<"add" | "draft" | boolean>(false);
const error = ref<string | null>(null);
const fieldErrors = ref<undefined | Record<string, string[]>>();
const message = ref<string | null>(null);
const total = ref<number>(0);
const discount = ref<number>(0);
const advance = ref<number>(0);
const invoice = ref<boolean>(false);

onMounted(async () => {
    createDatePickers();
    if (props.toEdit) {
        let total2 = 0;
        (props.toEdit.tests as any).forEach((t: any) => {
            total2 += t.price;
        });
        total.value = total2;
        advance.value = (props.toEdit.advance as any) / 100;
        discount.value = (props.toEdit.discount as any) / 100;
    }
});

async function handleFormSubmit(evt: any) {
    const status = evt.submitter?.value === "draft" ? "draft" : "pending";
    isPosting.value = evt.submitter?.value || true;
    const data = new FormData(evt.target);
    data.append("status", status);

    ["entry_date", "sample_collection_date", "delivery_date"].forEach((df) => {
        const val = data.get(df)?.toString();
        if (!val || val.length < 10) {
            return;
        }
        data.delete(df);
        data.append(df, dmyToDate(val).toLocaleDateString());
    });

    error.value = null;
    message.value = null;

    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: data,
    });

    isPosting.value = false;
    if (res.success) {
        message.value = res.message!;
        if (props.onSuccess) {
            props.onSuccess(res.rows[0], res.message!);
        } else if (invoice.value) {
            router.push({
                name: "patients.invoice",
                params: {
                    id: res.rows[0].id,
                },
            });
        }
    } else {
        error.value = res.message;
        fieldErrors.value = res.field;
    }
}

function createDatePickers() {
    const options = {
        showAllDates: true,
        formatter(input: HTMLInputElement, date: Date) {
            input.value = dateToDMY(date);
        },
        onShow(ins: any) {
            const val = ins.el.value;
            if (val && val.length === 10) {
                ins.setDate(dmyToDate(val), true);
            }
            const el = ins.el.nextElementSibling as HTMLDivElement;
            const box = el.getBoundingClientRect();
            const pos: {
                top?: string;
                bottom?: string;
                right?: string;
                left?: string;
            } = {};

            if (box.right > screen.availWidth) {
                pos.right = "0px";
            } else {
                pos.left = "0px";
            }

            if (box.bottom > window.innerHeight) {
                pos.bottom = "100%";
            } else {
                pos.top = "100%";
            }
            el.removeAttribute("style");
            for (const i in pos) {
                // @ts-ignore
                el.style[i] = pos[i];
            }
        },
    };
    datepicker(entryDateField.value, options);
    datepicker(sampleDateField.value, options);
    datepicker(deliveryDateField.value, options);
}
</script>
<template>
    <div class="add-patient-page">
        <div v-if="!headless">
            <h1 class="fs-2xl">{{ toEdit ? "Update" : "Add" }} Patient</h1>
            <RouterLink :to="{ name: 'home' }" class="home-url">
                <Icon size="40" view-box="36">
                    <path
                        fill="currentColor"
                        d="m19.41 18l8.29-8.29a1 1 0 0 0-1.41-1.41L18 16.59l-8.29-8.3a1 1 0 0 0-1.42 1.42l8.3 8.29l-8.3 8.29A1 1 0 1 0 9.7 27.7l8.3-8.29l8.29 8.29a1 1 0 0 0 1.41-1.41Z"
                        class="clr-i-outline clr-i-outline-path-1"
                    /><path fill="none" d="M0 0h36v36H0z" />
                </Icon>
            </RouterLink>
        </div>

        <div v-if="error" class="all-col form-alert error">
            {{ error }}
        </div>
        <div v-if="message" class="all-col form-alert success">
            {{ message }}
        </div>
        <form
            :action="`${API_BASE}/patients/${toEdit?.id}`"
            method="POST"
            @submit.prevent="handleFormSubmit"
            class="add-patient"
        >
            <div class="left-wrapper">
                <div class="left">
                    <h4 class="section-title all-col">Metadata</h4>
                    <SimpleSelect
                        name="type"
                        label="Type"
                        :un-wrap="true"
                        :hint="fieldErrors?.type?.[0]"
                        :value="toEdit?.type"
                    >
                        <option value="cyto">Cytopathology</option>
                        <option value="histo">Histopathology</option>
                    </SimpleSelect>
                    <SimpleInput
                        name="id"
                        label="ID"
                        :un-wrap="true"
                        :hint="fieldErrors?.id?.[0]"
                        :value="toEdit?.id"
                    />

                    <h4 class="section-title all-col">Patient Information</h4>

                    <SimpleInput
                        name="name"
                        label="Name"
                        :un-wrap="true"
                        :hint="fieldErrors?.name?.[0]"
                        :value="toEdit?.name"
                    />
                    <SimpleBlankInput
                        label="Age"
                        :un-wrap="true"
                        :hint="fieldErrors?.age?.[0]"
                    >
                        <div class="flex items-center">
                            <input
                                type="number"
                                name="age"
                                class="age-input"
                                :value="toEdit?.age"
                            />
                            years
                        </div>
                    </SimpleBlankInput>

                    <SimpleBlankInput
                        label="Gender"
                        :un-wrap="true"
                        :hint="fieldErrors?.gender?.[0]"
                    >
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="gen-male"
                                    value="male"
                                    :checked="toEdit?.gender === 'male'"
                                />
                                <label for="gen-male">Male</label>
                            </div>
                            <div class="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    id="gen-female"
                                    value="female"
                                    :checked="toEdit?.gender === 'female'"
                                />
                                <label for="gen-female">Female</label>
                            </div>
                        </div>
                    </SimpleBlankInput>
                    <SimpleInput
                        name="contact"
                        label="Contact"
                        :un-wrap="true"
                        :hint="fieldErrors?.contact?.[0]"
                        :value="toEdit?.contact"
                    />
                    <SimpleInput
                        name="referer"
                        label="Referer"
                        :un-wrap="true"
                        :hint="fieldErrors?.referer?.[0]"
                        :value="toEdit?.referer"
                    />
                    <SimpleBlankInput
                        label="Delivery date"
                        :un-wrap="true"
                        :hint="fieldErrors?.delivery_date?.[0]"
                    >
                        <input
                            ref="deliveryDateField"
                            type="text"
                            name="delivery_date"
                            class="date-input"
                            autocomplete="off"
                            placeholder="dd-mm-yyyy"
                            :value="
                                toEdit
                                    ? dateToDMY(
                                          new Date(
                                              parseInt(toEdit.delivery_date)
                                          )
                                      )
                                    : ''
                            "
                        />
                    </SimpleBlankInput>

                    <div class="all-col submit-area" v-if="!headless">
                        <CheckBox
                            label="Show invoice on exit"
                            v-model="invoice"
                        />
                        <div class="flex gap-sm mt-sm">
                            <button type="submit" value="add">
                                <Loading
                                    v-if="
                                        isPosting === true ||
                                        isPosting === 'add'
                                    "
                                />
                                {{ toEdit ? "Update" : "Add" }} Patient
                            </button>
                            <!-- <button
                                type="submit"
                                class="btn-outline"
                                name="status"
                                value="draft"
                            >
                                <Loading v-if="isPosting === 'draft'" />
                                Save Draft
                            </button> -->
                        </div>
                    </div>
                    <div v-else class="all-col headeless-button">
                        <button type="submit" value="add">
                            <Loading
                                v-if="isPosting === true || isPosting === 'add'"
                            />
                            {{ toEdit ? "Update" : "Add" }} Patient
                        </button>
                    </div>
                </div>
            </div>
            <div class="right">
                <h4 class="section-title all-col">Specimen Information</h4>

                <SimpleBlankInput
                    label="Entry date"
                    :un-wrap="true"
                    :hint="fieldErrors?.entry_date?.[0]"
                >
                    <input
                        ref="entryDateField"
                        type="text"
                        name="entry_date"
                        class="date-input"
                        autocomplete="off"
                        placeholder="dd-mm-yyyy"
                        :value="
                            toEdit
                                ? dateToDMY(
                                      new Date(parseInt(toEdit.entry_date))
                                  )
                                : ''
                        "
                    />
                </SimpleBlankInput>

                <SimpleInput
                    label="Specimen"
                    :un-wrap="true"
                    name="specimen"
                    :hint="fieldErrors?.specimen?.[0]"
                    :value="toEdit?.specimen"
                />
                <SimpleBlankInput
                    label="Sample collection date"
                    :un-wrap="true"
                    :hint="fieldErrors?.sample_collection_date?.[0]"
                >
                    <input
                        ref="sampleDateField"
                        type="text"
                        name="sample_collection_date"
                        class="date-input"
                        autocomplete="off"
                        placeholder="dd-mm-yyyy"
                        :value="
                            toEdit
                                ? dateToDMY(
                                      new Date(
                                          parseInt(
                                              toEdit.sample_collection_date
                                          )
                                      )
                                  )
                                : ''
                        "
                    />
                </SimpleBlankInput>
                <h4 class="section-title all-col">Tests</h4>
                <div class="all-col">
                    <TestSelector
                        v-model="total"
                        :tests="(toEdit?.tests as any)"
                    />
                    <p v-if="fieldErrors?.tests" class="hint error">
                        {{ fieldErrors?.tests?.[0] }}
                    </p>
                </div>

                <h4 class="section-title all-col">Payment Information</h4>
                <SimpleBlankInput
                    label="Discount"
                    :un-wrap="true"
                    :hint="fieldErrors?.discount?.[0]"
                >
                    <div class="flex items-center gap-sm">
                        BDT
                        <input
                            type="number"
                            step="0.01"
                            class="amount-input"
                            name="discount"
                            v-model="discount"
                        />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput label="Payable" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT
                        <input
                            type="number"
                            step="0.01"
                            class="amount-input"
                            readonly
                            :value="total / 100 - discount"
                        />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput
                    label="Advance"
                    :un-wrap="true"
                    :hint="fieldErrors?.advance?.[0]"
                >
                    <div class="flex items-center gap-sm">
                        BDT
                        <input
                            type="number"
                            step="0.01"
                            class="amount-input"
                            name="advance"
                            v-model="advance"
                        />
                    </div>
                </SimpleBlankInput>
                <SimpleBlankInput label="Due" :un-wrap="true">
                    <div class="flex items-center gap-sm">
                        BDT
                        <input
                            type="number"
                            step="0.01"
                            class="amount-input"
                            :value="total / 100 - discount - advance"
                        />
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

    form.add-patient {
        flex-grow: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        position: relative;
        padding-bottom: 40px;

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

    .form-alert {
        margin: 10px 0;
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
        position: absolute;
        bottom: 0px;
        left: 0px;
        width: calc(50% - 38px);
        padding-bottom: 40px;
    }
    .headeless-button {
        padding-top: 20px;
    }
}
</style>
