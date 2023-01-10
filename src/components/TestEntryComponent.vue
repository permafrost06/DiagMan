<template>
    <li>
        <div class="test test-code">{{ _id }}</div>
        <div class="test test-name">{{ name }}</div>
        <div class="test test-type">{{ type }}</div>
        <div class="test test-size">{{ size }}</div>
        <div class="test test-cost">{{ cost }}</div>
        <button @click="deleteEntry">Delete</button>
    </li>
</template>

<script>
export default {
    props: {
        _id: String,
        name: String,
        cost: Number,
        type: String,
        size: String,
    },
    methods: {
        deleteEntry() {
            this.$emit("test-delete", this._id);
        },
    },
};
</script>

<style lang="scss" scoped>
button {
    margin: 0.5rem;
}

input {
    width: 10rem;
    margin: 0.5rem;
}
</style>
