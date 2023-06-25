<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    Hello World

    
  </div>
</template>

<script>
console.log("This is a test")


export default {
  name: 'HomeVue',
  props: {
    msg: String
  }
}
</script>


