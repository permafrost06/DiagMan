<script setup lang="ts">
import LoadingVue from "@/Icons/Loading.vue";
import SimpleInput from "@/components/form/SimpleInput.vue";
import { API_BASE, AUTH_TOKEN_KEY } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { useUser } from "@/stores/user";
import { ref } from "vue";
const user = useUser();

const tOuts: any = {
    name: 0,
    pin: 0,
    password: 0,
};
const saving = ref({
    name: false,
    pin: false,
    password: false,
});
const message = ref({
    name: {
        type: "error",
        text: "",
    },
    pin: {
        type: "error",
        text: "",
    },
    password: {
        type: "error",
        text: "",
    },
});

const handleForm = async (form: any, formName: "name" | "pin" | "password") => {
    if (saving.value[formName]) {
        return;
    }
    if (tOuts[formName]) {
        clearTimeout(tOuts[formName]);
    }
    saving.value[formName] = true;
    const res = await fetchApi(form.action, {
        method: "POST",
        body: new FormData(form),
    });
    saving.value[formName] = false;

    message.value[formName].text = res.message || "";
    if (!res.success) {
        message.value[formName].type = "error";
        tOuts[formName] = setTimeout(() => {
            message.value[formName].text = "";
            tOuts[formName] = 0;
        }, 5000);
    } else {
        if (formName === "name") {
            user.name = res.data.name;
        }
        message.value[formName].type = "success";

        tOuts[formName] = setTimeout(() => {
            message.value[formName].text = "";
            tOuts[formName] = 0;
        }, 5000);
    }
};

const loggingOut = ref(false);
const logout = async () => {
    if (loggingOut.value) {
        return;
    }
    loggingOut.value = true;

    await fetchApi(API_BASE + "/auth/logout", {
        method: "POST",
    });
    localStorage.removeItem(AUTH_TOKEN_KEY);
    location.replace("/");
};
</script>
<template>
    <div class="acc-settings">
        <h1 class="page-title fs-2xl">Account</h1>
        <form
            class="name-form"
            method="POST"
            :action="API_BASE + '/settings/account/name'"
            @submit.prevent="(evt) => handleForm(evt.target, 'name')"
        >
            <h2 class="form-title">Change Name</h2>
            <p
                v-if="message.name.text"
                :class="['form-alert', message.name.type]"
            >
                {{ message.name.text }}
            </p>
            <p>
                Current Name: <b>{{ user.name }}</b>
            </p>
            <SimpleInput name="name" label="New Name" />
            <button type="submit" class="font-h">
                <LoadingVue v-if="saving.name" />
                Request Name Change
            </button>
        </form>

        <form
            class="pin-form"
            method="POST"
            :action="API_BASE + '/settings/account/pin'"
            @submit.prevent="(evt) => handleForm(evt.target, 'pin')"
        >
            <h2 class="form-title">Change PIN</h2>
            <p
                v-if="message.pin.text"
                :class="['form-alert', message.pin.type]"
            >
                {{ message.pin.text }}
            </p>
            <div class="inputs-grid">
                <SimpleInput
                    name="current-pin"
                    label="Current PIN"
                    :un-wrap="true"
                />
                <SimpleInput name="new-pin" label="New PIN" :un-wrap="true" />
                <SimpleInput
                    name="confirm"
                    label="Confirm PIN"
                    :un-wrap="true"
                />
            </div>
            <button type="submit" class="font-h">
                <LoadingVue v-if="saving.pin" />
                Change PIN
            </button>
        </form>
        <form
            class="password-form"
            method="POST"
            :action="API_BASE + '/settings/account/password'"
            @submit.prevent="(evt) => handleForm(evt.target, 'password')"
        >
            <h2 class="form-title">Change Password</h2>
            <p
                v-if="message.password.text"
                :class="['form-alert', message.password.type]"
            >
                {{ message.password.text }}
            </p>
            <div class="inputs-grid">
                <SimpleInput
                    name="current-password"
                    label="Current Password"
                    :un-wrap="true"
                />
                <SimpleInput
                    name="new-password"
                    label="New Password"
                    :un-wrap="true"
                />
                <SimpleInput
                    name="confirm"
                    label="Confirm Password"
                    :un-wrap="true"
                />
            </div>
            <button type="submit" class="font-h">
                <LoadingVue v-if="saving.password" />
                Change Password
            </button>
        </form>
        <form class="logout-form" method="POST" @submit.prevent="logout">
            <p>
                Logged in as: <b>{{ user.name }}</b>
            </p>
            <button type="submit" class="font-h">
                <LoadingVue v-if="loggingOut" />
                Log Out
            </button>
        </form>
    </div>
</template>

<style lang="scss">
.acc-settings {
    .page-title {
        border-bottom: 1px solid var(--clr-black);
    }

    input {
        max-width: 250px;
    }

    form {
        display: block;
        margin: 20px 0;
    }
    form > * {
        margin-top: 8px;
    }
    .form-title {
        font-size: var(--fs-lg);
        font-weight: 500;
    }

    button {
        font-size: var(--fs-md);
    }

    .inputs-grid {
        display: grid;
        grid-template-columns: max-content auto;
        gap: 10px;
    }
}
</style>
