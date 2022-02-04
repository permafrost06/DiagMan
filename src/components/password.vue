<template>
  <div class="backdrop">
    <div class="password-box">
      <p>Enter password</p>
      <input
        @keydown="hideWarn"
        @keydown.enter="verifyPassword"
        type="password"
        v-model="password"
        ref="passField"
      />
      <p v-show="warning" class="warning">Wrong password!</p>
      <button @click="verifyPassword">Unlock</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "password",
  data() {
    return {
      password: "",
      warning: false,
    };
  },
  methods: {
    verifyPassword() {
      if (this.password == "dsib2022") this.$emit("unlocked");
      else {
        this.password = "";
        this.warning = true;
      }
    },
    hideWarn() {
      this.warning = false;
    },
  },
  mounted() {
    this.$refs.passField.focus();
  },
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0 0 0 0;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9;
}

.password-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.warning {
  color: rgb(214, 67, 67);
}

p {
  color: white;
  text-align: center;
}

input {
  height: 1.3rem;
}
</style>
