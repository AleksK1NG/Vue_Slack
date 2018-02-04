<template>
  <div class="ui middle aligned center aligned grid login__container">
    <div class="column">
      <h2 class="ui orange  header">
        <div class="content">
          #Alex::Slack#
        </div>
      </h2>
      <form class="ui large form" :class="{'error': hasErrors}">
        <div class="ui stacked segment">

          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input type="text" name="name" placeholder="Name" v-model="name">
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input type="email" name="email" placeholder="Email" v-model="email">
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input type="password" name="password" placeholder="Password" v-model="password">
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input type="password" name="password_confirmation" placeholder="Confirm password" v-model="password_confirmation">
            </div>
          </div>


          <div class="ui fluid large orange button" @click.prevent="register" :class="{'loading': isLoading}">Login</div>
        </div>

        <div class="ui error message" v-if="hasErrors">
          <p v-for="error in errors">{{error}}</p>
        </div>

      </form>

      <div class="ui message">
        New to us? Login <router-link to="/login">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import md5 from 'md5';

  export  default {
    name: 'register',
    data () {
      return {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        errors: [],
        usersRef: firebase.database().ref('users'),
        isLoading: false,
      }
    },

    computed: {
      hasErrors () {
        return this.errors.length > 0
      },
    },

    methods: {
      register () {
        this.errors = [];

        if (this.isFormValid()) {
          this.isLoading = true;

          firebase.auth().createUserWithEmailAndPassword(this.email, this.password).then(user => {
            console.log('Firebase register' + user.email);

            user.updateProfile({
              displayName: this.name,
              photoURL: "http://www.gravatar.com/avatar/"+md5(user.email)+"?d=identicon",
            }).then( () => {

             // User registration in bd
              this.saveUserToUsersRef(user).then(() => {
                this.$store.dispatch('setUser', user);
                this.$router.push('/')
              })

            }, error => {
              console.log(error);
              this.errors.push(error.message);
              this.isLoading = false;
            })

          }).catch(error => {
            this.errors.push(error.message);
            this.isLoading = false;
          })
        }
      },

      saveUserToUsersRef (user) {
        return this.usersRef.child(user.uid).set({
          name: user.displayName,
          avatar: user.photoURL,
        })
      },

      isEmpty () {
        if (this.name.length === 0 || this.email.length === 0 || this.password.length === 0 || this.password_confirmation.length === 0) {
          return true;
        }
        return false;
      },

      passwordValid () {
        if (this.password.length < 6 || this.password_confirmation.length < 6) {
          return false;
        }
        if (this.password !== this.password_confirmation) {
          return false;
        }
        return true;
      },

      isFormValid () {
        if (this.isEmpty()) {
          this.errors.push('Form validation error');
          return false;
        }
        if (!this.passwordValid()) {
          this.errors.push('Password error');
          return false;
        }
        return true;
      }
    }
  }
</script>

<style scoped>
  .login__container {
    margin-top: 40px;
  }
  .column {
    max-width: 450px;
  }
</style>
