<template>
    <td v-bind="$attrs">
        <h5>{{ patientName }}</h5>
        <small>{{ _id }}</small>
    </td>
    <td>
        {{ dateRearr(date) }}
    </td>
    <td>
        {{ age }}
    </td>
    <td>
        {{ specimen }}
    </td>
    <td>
        {{ referer }}
    </td>
    <td v-if="aspNote">
        {{ aspNote }}
    </td>
    <td v-if="me">
        {{ meShort }}
    </td>
    <td v-if="impression">
        {{ impressionShort }}
    </td>
    <td>
        <button @click="deleteRecord" class="delete-button">Delete</button>
        <button @click="editRecord" class="edit-button">Edit Patient</button>
    </td>
    <td>
        <slot></slot>
    </td>
</template>

<script>
export default {
    name: "recordRow",
    props: {
        _id: String,
        patientName: String,
        collDate: String,
        date: String,
        contactNo: String,
        gender: String,
        age: String,
        specimen: String,
        referer: String,
        aspNote: String,
        me: String,
        impression: String,
        tests: Array,
        _rev: String,
    },
    computed: {
        meShort() {
            return this.me.length > 50 ? this.me.slice(0, 50) + "..." : this.me;
        },
        impressionShort() {
            return this.impression.length > 50
                ? this.impression.slice(0, 50) + "..."
                : this.impression;
        },
    },
    methods: {
        dateRearr(date) {
            const dateArr = date.split("-");
            return `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
        },
        deleteRecord() {
            this.$emit("delete", {
                _id: this._id,
                _rev: this._rev,
            });
        },
        editRecord() {
            this.$router.push({ name: "AddRecord", params: { id: this._id } });
        },
    },
};
</script>

<style lang="scss">
button {
    color: white;
    background: #17768d;
    border-radius: 4px;
    height: 1.5rem;
    width: 100%;
    border-style: none;
}

.delete-button {
    padding: 0px 0.5rem;
}
</style>
