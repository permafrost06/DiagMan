<script setup lang="ts">
import CheckBox from "@/components/form/CheckBox.vue";
import SimpleSelect from "@/components/form/SimpleSelect.vue";
import HeaderSimple from "@/components/view/HeaderSimple.vue";
import { API_BASE, saveListConfig } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import Loading from "@/Icons/Loading.vue";
import { onMounted, ref } from "vue";

import { DEFAULT_SHOW_ORDER } from "@/helpers/config";

const isSaving = ref(false);
const isLoading = ref(true);
const message = ref({
    type: "error",
    text: "",
});

const configData = ref({
    limit: 0,
    show: [
        "name",
        "contact",
        "timestamp",
        "delivery_date",
        "specimen",
        "status",
    ],
    sizes: {},
});
let tOut: any;

onMounted(async () => {
    const data = await fetchApi(
        `${API_BASE}/misc/named/get?name=patient_list_config&scope=user`,
    );
    isLoading.value = false;
    if (!data.success || !data.data) {
        return;
    }
    configData.value = JSON.parse(data.data);
});

const handleForm = async () => {
    if (isSaving.value) {
        return;
    }
    if (tOut) {
        clearTimeout(tOut);
    }
    isSaving.value = true;

    const limit = parseInt(configData.value.limit.toString());
    const show = [];

    for (const col of DEFAULT_SHOW_ORDER) {
        if (configData.value.show.includes(col)) {
            show.push(col);
        }
    }

    const [success, data] = await saveListConfig({
        ...configData.value,
        limit,
        show,
    });
    isSaving.value = false;

    if (!success) {
        message.value.type = "error";
        message.value.text = data;
        tOut = setTimeout(() => {
            tOut = 0;
            message.value.text = "";
        }, 5000);
    } else {
        message.value.type = "success";
        message.value.text = data;

        tOut = setTimeout(() => {
            tOut = 0;
            message.value.text = "";
        }, 5000);
    }
};

const selectionChange = (name: string) => {
    if (configData.value.show.includes(name)) {
        configData.value.show.splice(configData.value.show.indexOf(name), 1);
    } else {
        configData.value.show.push(name);
    }
};
</script>

<template>
    <HeaderSimple
        title="Patient List"
        :onClose="(router) => router.push({ name: 'home' })"
    />
    <div class="pl-settings">
        <div v-if="isLoading" class="pl-loading">
            <Loading />
        </div>
        <form v-else method="POST" @submit.prevent="handleForm">
            <p
                v-if="message.text"
                :class="['form-alert', message.type]"
                style="margin-bottom: 20px"
            >
                {{ message.text }}
            </p>
            <SimpleSelect
                label="Number of Rows"
                @input="(evt: any) => (configData.limit = evt.target.value)"
                :value="configData.limit"
            >
                <option value="0">Dynamic</option>
                <option value="10">10</option>
                <option value="25">25</option>
            </SimpleSelect>

            <div class="visible-columns">
                <p>Visible Columns</p>
                <div class="visible-columns-items">
                    <CheckBox
                        label="Name & ID"
                        value="name"
                        :checked="configData.show.includes('name')"
                        @change="selectionChange('name')"
                    />
                    <CheckBox
                        label="Type"
                        value="type"
                        :checked="configData.show.includes('type')"
                        @change="selectionChange('type')"
                    />
                    <CheckBox
                        label="Age"
                        value="age"
                        :checked="configData.show.includes('age')"
                        @change="selectionChange('age')"
                    />
                    <CheckBox
                        label="Gender"
                        value="gender"
                        :checked="configData.show.includes('gender')"
                        @change="selectionChange('gender')"
                    />
                    <CheckBox
                        label="Contact No"
                        value="contact"
                        :checked="configData.show.includes('contact')"
                        @change="selectionChange('contact')"
                    />
                    <CheckBox
                        label="Date Added"
                        value="timestamp"
                        :checked="configData.show.includes('timestamp')"
                        @change="selectionChange('timestamp')"
                    />
                    <CheckBox
                        label="Delivery Date"
                        value="delivery_date"
                        :checked="configData.show.includes('delivery_date')"
                        @change="selectionChange('delivery_date')"
                    />
                    <CheckBox
                        label="Specimen"
                        value="specimen"
                        :checked="configData.show.includes('specimen')"
                        @change="selectionChange('specimen')"
                    />
                    <CheckBox
                        label="Referer"
                        value="referer"
                        :checked="configData.show.includes('referer')"
                        @change="selectionChange('referer')"
                    />
                    <CheckBox
                        label="Status"
                        value="status"
                        :checked="configData.show.includes('status')"
                        @change="selectionChange('status')"
                    />
                </div>
            </div>

            <button type="submit" class="font-h">
                <Loading v-if="isSaving" />
                Save Changes
            </button>
        </form>
    </div>
</template>
<style lang="scss" scoped>
.pl-settings {
    max-width: 500px;
    padding: 20px 0;

    .pl-loading {
        display: flex;
        justify-content: center;

        svg {
            width: 50px;
            height: 50px;
        }
    }

    .visible-columns {
        margin: 20px 0 10px;

        p {
            font-size: var(--fs-md);
            font-weight: 500;
        }

        &-items {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
        }
    }

    button {
        margin-top: 20px;
    }
}
</style>
