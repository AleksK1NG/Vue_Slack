<template>
  <div class="chat__container">
    <Sidebar></Sidebar>
    <Messages></Messages>
  </div>
</template>

<script>

  import Sidebar from '../components/Ssidebar/Sidebar';
  import Messages from '../components/messages/Messages';

  export default {
    name: 'chat',
    components: {
      Sidebar,
      Messages,
    },

  }

</script>

<style scoped>

  .chat__container{
    height: 100%;
  }

</style>
