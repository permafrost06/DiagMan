<template>
    <td class="col-1" v-bind="$attrs">
        <h5>{{ patientName }}</h5>
        <small>{{ _id }}</small>
    </td>
    <td class="col-2">
        {{ dateRearr(date) }}
    </td>
    <td :class="[{ 'col-3': !aspNote }]" v-if="!aspNote">
        {{ age }}
    </td>
    <td :class="[{ 'col-4': !aspNote }]" v-if="!aspNote">
        {{ contactNo }}
    </td>
    <td :class="[{ 'col-5': !aspNote }, { 'col-3': aspNote }]">
        {{ specimen }}
    </td>
    <td :class="[{ 'col-6': !aspNote }]" v-if="!aspNote">
        {{ referer }}
    </td>
    <td class="col-4" v-if="aspNote" v-html="aspNote" />
    <td class="col-5" v-if="me" v-html="meShort" />
    <td class="col-6" v-if="impression" v-html="impressionShort" />
    <td class="col-7 buttons-cell">
        <button @click="deleteRecord" class="danger">Delete</button>
        <button @click="editRecord" class="secondary">Edit Patient</button>
    </td>
    <td class="col-8 buttons-cell">
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
