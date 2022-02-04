<template>
  <li>
    <div class="test test-code">{{ _id }}</div>
    <span v-if="edit">
      <input type="text" v-model="newName" />
      <input type="text" v-model="newCost" />
      <button @click="updateEntry">Save</button>
    </span>
    <span v-else>
      <div class="test test-name">{{ name }}</div>
      <div class="test test-cost">{{ cost }}</div>
      <button @click="editEntry">Edit</button
      ><button @click="deleteEntry">Delete</button>
    </span>
  </li>
</template>

<script>
export default {
  props: {
    _id: String,
    name: String,
    cost: Number,
  },
  data() {
    return {
      edit: false,
      newName: this.name,
      newCost: this.cost,
    };
  },
  methods: {
    editEntry() {
      this.edit = true;
    },
    updateEntry() {
      this.$emit("test-update", {
        _id: this._id,
        name: this.newName,
        cost: Number(this.newCost),
      });
      this.edit = false;
    },
    deleteEntry() {
      this.$emit("test-delete", this._id);
    },
  },
};
</script>

<style lang="scss" scoped>
button {
  width: auto;
  height: auto;
  padding: 0.4rem 0.75rem;
  margin: 0.5rem;
}

input {
  width: 10rem;
  margin: 0.5rem;
}
</style>
