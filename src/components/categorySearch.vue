<template>
  <div class="category-search">
    <input type="text" placeholder=" " />
  </div>
</template>

<style lang="scss">
.category-search {
  position: relative;
  input {
    width: 100%;
    border: 1px solid #c4c4c4;
    border-radius: 4px;
    height: 1.7rem;
    padding-left: 0.5rem;

    background-image: url("data:image/svg+xml,%3Csvg class='category-search-icon' width='17' height='17' viewBox='0 0 17 17' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6.8817' cy='7.3817' r='5.8817' fill='white' stroke='%23C4C4C4' stroke-width='2'/%3E%3Cline x1='11.5212' y1='11.5901' x2='15.724' y2='15.7929' stroke='%23C4C4C4' stroke-width='2'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: left 0.4rem center;

    &:not(:placeholder-shown),
    &:focus {
      outline: none;
      background-image: none;
    }
  }
}
</style>
