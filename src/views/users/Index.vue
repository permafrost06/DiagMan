<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { API_BASE } from "@/helpers/config";
import { fetchApi } from "@/helpers/http";
import { onMounted, ref } from "vue";

const isPosting = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const message = ref<string | null>(null);
const users = ref<Array<Record<string, number | string>>>([]);
const toEdit = ref<Record<string, number | string> | null>(null);
const toDelete = ref<Record<string, number | string> | null>(null);

onMounted(() => {
    loadPage();
});

async function loadPage() {
    if (isLoading.value) {
        return;
    }
    isLoading.value = true;
    const res = await fetchApi(`${API_BASE}/users`);
    isLoading.value = false;
    if (!res.success) {
        error.value = res.message;
    } else {
        users.value = res.rows || [];
    }
}

async function handleFormSubmit(evt: any) {
    isPosting.value = true;
    const res = await fetchApi(evt.target.action, {
        method: "POST",
        body: new FormData(evt.target),
    });

    isPosting.value = false;
    if (res.success) {
        error.value = null;
        message.value = res.message!;
        if (toEdit.value) {
            users.value = users.value.filter(
                (user) => user.id != toEdit.value?.id
            );
            toEdit.value = null;
        }
        users.value.push(res.rows[0]);
    } else {
        error.value = res.message;
    }
}

async function deleteUser(toDel: any) {
    const del = confirm("Are you sure?");
    if (!del || toDelete.value) {
        return;
    }
    toDelete.value = toDel;
    const res = await fetchApi(`${API_BASE}/users/${toDel.id}`, {
        method: "DELETE",
    });
    if (res.success) {
        error.value = null;
        message.value = res.message!;
        users.value = users.value.filter(
            (user) => user.id != toDelete.value?.id
        );
    } else {
        error.value = res.message;
    }
    toDelete.value = null;
}
</script>
<template>
    <div class="row-wrap">
        <form
            :action="`${API_BASE}/users/${toEdit ? 'update' : 'add'}`"
            method="POST"
            @submit.prevent="handleFormSubmit"
        >
            <input v-if="toEdit" type="hidden" name="id" :value="toEdit.id" />
            <p v-if="error">Error: {{ error }}</p>
            <p v-if="message">{{ message }}</p>

            <div>
                <label for="name">Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    :value="toEdit?.name"
                />
            </div>

            <div>
                <label for="email">Email</label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    placeholder="Email"
                    :value="toEdit?.email"
                />
            </div>

            <div>
                <label for="role">Role</label>
                <select name="role" id="role" :value="toEdit?.role">
                    <option value="cashier" selected>Cashier</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div>
                <label for="password">Password</label>
                <input
                    type="text"
                    name="password"
                    id="password"
                    placeholder="Password"
                />
            </div>

            <button :disabled="isPosting" type="submit">
                <span v-if="isPosting">Please wait...</span>
                <span v-else-if="toEdit">Update</span>
                <span v-else>Add</span>
            </button>
        </form>
        <div>
            <h3>Users</h3>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                </tr>
                <tr v-if="isLoading">
                    <td colspan="5">Loading, please wait...</td>
                </tr>
                <tr v-else-if="!users?.length">
                    <td colspan="5">No users added yet!</td>
                </tr>
                <template v-else>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.role }}</td>

                        <td>
                            <button @click="toEdit = user">Edit</button>
                            <button @click="deleteUser(user)">
                                {{
                                    toDelete?.id === user.id
                                        ? "Wait..."
                                        : "Delete"
                                }}
                            </button>
                        </td>
                    </tr>
                </template>
            </table>
        </div>
    </div>
</template>
<style>
form {
    width: 100%;
    max-width: 500px;
    margin: 0 50px;
}
th,
td {
    margin: 0;
    padding: 5px;
}
.flex {
    display: flex;
    justify-content: space-between;
}
</style>
