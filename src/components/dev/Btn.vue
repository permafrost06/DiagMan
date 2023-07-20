<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <button>
        <slot></slot>
    </button>
</template>
<style scoped>
button {
    border: 1px solid #a7a7a7;
    border-radius: 8px;
    padding: 10px 8px;
    text-transform: uppercase;
    font-weight: medium;
    cursor: pointer;
    background: white;
}

button:hover {
    background: #f7f7f7;
}
</style>
