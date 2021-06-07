<template>
  <input class="search" type="text" placeholder="Search..." />
</template>

<script>
export default {
  name: "searchBox",
};
</script>

<style lang="scss">
.search {
  height: 1.7rem;
  width: 10rem;
  margin-left: -5px;
  border: 1px solid #c4c4c4;
  border-radius: 0px 6px 6px 0px;
  color: #a2a2a2;
  padding-left: 0.5rem;
  outline: none;

  background-image: url("data:image/svg+xml,%3Csvg width='28' height='26' viewBox='0 0 28 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0H28V26H0V0Z' fill='%2317768D'/%3E%3Ccircle cx='12.8817' cy='11.8817' r='5.8817' stroke='white' stroke-width='2'/%3E%3Cline x1='17.5212' y1='16.0901' x2='21.724' y2='20.2929' stroke='white' stroke-width='2'/%3E%3C/svg%3E%0A");
  background-repeat: no-repeat;
  background-position: right;
  background-size: auto;

  &::-moz-placeholder {
    opacity: 1;
  }
}
</style>
