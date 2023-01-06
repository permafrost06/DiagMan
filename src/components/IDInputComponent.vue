<!-- eslint-disable vue/no-parsing-error -->
<template>
    <p>
        <label for="id_input">ID</label>
        <input id="id_input" v-model="id" @keydown="preventSlash" @keyup="checkID" />
        <okay-svg v-if="id && !idCollision && !slashError" />
        <error-svg v-if="(id && idCollision) || slashError" />
        <slot></slot>

        <p v-if="slashError" class="slash-error">ID Cannot contain slash</p>
    </p>
</template>

<script>
import okaySvg from "./IconOkayComponent.vue";
import errorSvg from "./IconErrorComponent.vue";
const ipc = window.ipcRenderer;

export default {
    components: {
        okaySvg,
        errorSvg,
    },
    data() {
        return {
            idCollision: false,
            slashError: false,
            originalID: "",
        };
    },
    props: { update: Boolean, modelValue: String, collision: Boolean },
    emits: ["update:modelValue", "update:collision"],
    computed: {
        id: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
    },
    mounted() {
        ipc.on("id-conflict", () => {
            this.idCollision = true;
            this.$emit("update:collision", this.idCollision);
        });
        ipc.on("id-safe", () => {
            this.idCollision = false;
            this.$emit("update:collision", this.idCollision);
        });
    },
    methods: {
        checkID() {
            if (this.update) {
                ipc.send("check-id-collision", this.id, this.$route.params.id);
                return;
            }

            ipc.send("check-id-collision", this.id);
        },
        preventSlash(event) {
            this.slashError = false;
            if (event.key === "/" || event.key === "\\") {
                event.preventDefault();
                this.slashError = true;
            }
        },
    },
};
</script>

<style>
.slash-error {
    background-color: red;
    color: white;
    width: 11.4rem;
    padding: 0.25rem 0.4rem;
}
</style>
