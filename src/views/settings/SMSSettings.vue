<script setup lang="ts">
import HeaderSimple from "@/components/view/HeaderSimple.vue";
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const msg = ref("");
const isLoading = ref(true);
const sms_id = ref(0);
const isSaving = ref(false);
const message = ref({
    type: "error",
    text: "",
});
let tOut: any;

onMounted(async () => {
    const data = await fetchApi(`${API_BASE}/misc?name=sms`);
    if (data.success) {
        msg.value = data.rows[0]?.data || "";
        sms_id.value = data.rows[0]?.id || 0;
    }
    isLoading.value = false;
});

const handleForm = async (form: any) => {
    if (isSaving.value) {
        return;
    }
    if (tOut) {
        clearTimeout(tOut);
    }
    isSaving.value = true;
    const res = await fetchApi(form.action, {
        method: "POST",
        body: new FormData(form),
    });
    isSaving.value = false;

    if (!res.success) {
        message.value.type = "error";
        message.value.text = res.message;
        tOut = setTimeout(() => {
            tOut = 0;
            message.value.text = "";
        }, 5000);
    } else {
        message.value.type = "success";
        message.value.text = res.message || "";

        tOut = setTimeout(() => {
            tOut = 0;
            message.value.text = "";
        }, 5000);
    }
};
</script>
<template>
    <div class="sms-settings">
        <HeaderSimple
            title="SMS Settings"
            :onClose="(router) => router.push({ name: 'home' })"
        />
        <form
            method="POST"
            :action="`${API_BASE}/misc/${sms_id ? sms_id : ''}`"
            @submit.prevent="(evt) => handleForm(evt.target)"
        >
            <input type="hidden" name="name" value="sms" />
            <label>Message body:</label>
            <textarea
                name="data"
                rows="10"
                :placeholder="
                    isLoading ? 'Loading...' : 'Enter your message here...'
                "
                v-model="msg"
            ></textarea>
            <p v-if="message.text" :class="['form-alert', message.type]">
                {{ message.text }}
            </p>
            <button type="submit" :disabled="isSaving">
                <template v-if="isSaving">Saving...</template>
                <template v-else>Save</template>
            </button>
        </form>
    </div>
</template>
<style lang="scss" scoped>
.sms-settings {
    form {
        display: block;
        margin-top: 20px;
        max-width: 700px;

        textarea {
            display: block;
            min-height: 250px;
            box-sizing: border-box;
            field-sizing: content;

            &:hover,
            &:focus {
                outline: none;
                box-shadow: 0 0 2px var(--clr-accent);
            }
        }

        label {
            margin-bottom: 10px;
        }

        button {
            margin-top: 20px;
            margin-left: auto;
        }

        p {
            margin-top: 20px;
        }
    }
}
</style>
