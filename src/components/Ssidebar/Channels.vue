<template>
  <div class="channels__container">
    <h2 class="ui inverted center aligned header">Channels <i class="add square icon add_channel" @click="openChannelModal"></i></h2>
    <div class="ui raised padded segment channels__list">
      <ul>
        <li class="channels__item"
            v-for="channel in channels"
            :key="channel.id"
            :class="{'is_active': setChannelActive(channel)}"
            @click="changeChannel(channel)"
        ># {{channel.name}}
        <div class="ui label purple channel__count" v-if="getNotification(channel) > 0 && channel.id !== currentChannel.id">{{getNotification(channel)}}</div>
        </li>
      </ul>
    </div>




    <div class="ui basic modal" id="channelModal">
      <div class="ui icon header">
        Create channel
      </div>

      <div class="content">

        <div class="ui inverted form" :class="{'error': hasErrors}">

          <div class="field">
            <label for="new_channel">New channel</label>
            <input type="text" name="new_channel" v-model="new_channel" id="new_channel">
          </div>

          <div class="ui error message" v-if="hasErrors">
            <p v-for="error in errors">{{error}}</p>
          </div>

        </div>

      </div>

      <div class="actions">
        <div class="ui red basic cancel inverted button">
          <i class="remove icon"></i>Cancel
        </div>
        <div class="ui green inverted button" @click="addChannel">
          <i class="checkmark icon"></i>Add
        </div>
      </div>
    </div>

  </div>
</template>

<script>

  import mixin from '../mixins';
  import { mapGetters } from 'vuex';

  export default {

    name: 'channels',

    data() {
      return {
        channels: [],
        new_channel: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        errors: [],
        firstLoad: true,
        notifCount: [],
        channel: null
      }
    },

    mixins: [mixin],

    computed: {
      ...mapGetters(['currentChannel', 'isPrivate']),
      hasErrors () {
        return this.errors.length > 0
      },
    },

    watch: {
      isPrivate() {
        if (this.isPrivate) {
          this.resetNotifications();
        }
      }
    },

    mounted () {
      this.addListeners();
    },

    methods: {

      addListeners () {
        // Child Event Listener
        this.channelsRef.on('child_added', snap => {
          this.channels.push(snap.val());

          if (this.firstLoad && this.channels.length > 0) {
            this.$store.dispatch('setCurrentChannel', this.channels[0]);
            this.channel = this.channels[0];
          }

          this.firstLoad = false;

          // Notification listener
          this.addCountListener(snap.key);

        })
      },

      addCountListener (channelId) {
        this.messagesRef.child(channelId).on('value', snap => {
          this.handleNotifications(channelId, this.currentChannel.id, this.notifCount, snap)
        })
      },

      handleNotifications (channelId, currentChannelId, notifCount, snap) {
        let lastTotal = 0;

        let index = notifCount.findIndex(el => el.id === channelId);

        if (index !== -1) {

          if (channelId !== currentChannelId){
            lastTotal = notifCount[index].total;

            if (snap.numChildren() - lastTotal > 0) {
              notifCount[index].notif = snap.numChildren() - lastTotal
            }
          }

          notifCount[index].lastKnownTotal = snap.numChildren()

        } else {
          notifCount.push({
            id: channelId,
            total: snap.numChildren(),
            lastKnownTotal: snap.numChildren(),
            notif: 0
          })
        }
      },

      getNotification(channel) {
        let notif = 0;

        this.notifCount.forEach(el => {
          if (el.id === channel.id) {
            notif = el.notif;
          }
        });
        return notif;
      },

      openChannelModal () {
        $('#channelModal').modal('show')
      },

      addChannel () {
        let key = this.channelsRef.push().key;

        let newChannel = { id: key, name: this.new_channel };

        // root/channels/
        this.channelsRef.child(key).update(newChannel).then(() => {

          this.new_channel = '';
          $('#channelModal').modal('hide');

        }).catch(error => {
          this.errors.push(error.message);
        })
      },

      changeChannel (channel) {
        this.resetNotifications();
        this.$store.dispatch('setPrivate', false);
        this.$store.dispatch('setCurrentChannel', channel);
        this.channel = channel;
      },

      resetNotifications () {
        let index = this.notifCount.findIndex(el => el.id === this.channel.id);

        if (index !== -1) {
          this.notifCount[index].total = this.notifCount[index].lastKnownTotal;
          this.notifCount[index].notif = 0;
        }
      },

      detachListeners () {
        this.channelsRef.off();
        this.channels.forEach(el => {
          this.messagesRef.child(el.id).off()
        })
      },

      setChannelActive (channel) {
        return channel.id === this.currentChannel.id;
      },
    },

    beforeDestroy () {
      this.detachListeners();
    },
  }
</script>

<style scoped>
  .channels__list {
    min-height: 100px;
    max-height: 300px!important;
    overflow-y: auto!important;
  }
  .channels__container ul{
    margin: 0;
    padding: 0;
  }
  .channels__item{
    height: 30px;
    margin: 8px;
    list-style: none;
    background-color: #ca67ff;
    cursor: pointer;
    line-height: 30px;
    border-radius: 2px;
    padding-left: 12px;
    font-weight: bold;
    font-size: 1.1em;
  }
  .channel__count{
    float:right;
  }
  .is_active{
    background-color: #9740c5;
  }
  .channels__item:hover{
    background-color: #9740c5;
  }
  .add_channel{
    cursor: pointer;
    color: #8BC34A;
  }
  .add_channel:hover{
    color: #689F38;
  }
</style>
