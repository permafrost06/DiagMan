<script setup lang="ts">
import SimpleInput from "@/components/form/SimpleInput.vue";
import { API_BASE } from "@/helpers/config";
import { useUser } from "@/stores/user";

const user = useUser();
</script>
<template>
    <div class="acc-settings">
        <h3>Account</h3>

        <form
            class="name-form"
            method="POST"
            :action="API_BASE + '/settings/user/name'"
        >
            <h4 class="form-title">Change Name</h4>
            <p>
                Current Name: <b>{{ user.name }}</b>
            </p>
            <SimpleInput name="name" label="New Name" />
            <button type="submit" class="font-h">Request Name Change</button>
        </form>

        <form
            class="pin-form"
            method="POST"
            :action="API_BASE + '/settings/user/pin'"
        >
            <h4 class="form-title">Change PIN</h4>
            <div class="inputs-grid">
                <SimpleInput
                    name="current-pin"
                    label="Current PIN"
                    :un-wrap="true"
                />
                <SimpleInput name="new-pin" label="New PIN" :un-wrap="true" />
                <SimpleInput
                    name="confirm-pin"
                    label="Confirm PIN"
                    :un-wrap="true"
                />
            </div>
            <button type="submit" class="font-h">Change PIN</button>
        </form>
        <form
            class="password-form"
            method="POST"
            :action="API_BASE + '/settings/user/password'"
        >
            <h4 class="form-title">Change Password</h4>
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
                    name="confirm-password"
                    label="Confirm Password"
                    :un-wrap="true"
                />
            </div>
            <button type="submit" class="font-h">Change Password</button>
        </form>
    </div>
</template>
