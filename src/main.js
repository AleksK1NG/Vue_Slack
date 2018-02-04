// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import VueRouter from 'vue-router';
import firebase from 'firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import store from './store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/',
    component: Chat,
    beforeEnter:(to, from, next) => {
      if (!firebase.auth().currentUser) {
        next('/login')
      } else {
        next()
      }
    }
  },
];

const router = new VueRouter({routes});

// Initialize Firebase
let config = {
  apiKey: "AIzaSyCjtu63infwvbVtJ05Mnn2tybyHGm7wHeI",
  authDomain: "vue-slack-clone.firebaseapp.com",
  databaseURL: "https://vue-slack-clone.firebaseio.com",
  projectId: "vue-slack-clone",
  storageBucket: "vue-slack-clone.appspot.com",
  messagingSenderId: "722256398306"
};
firebase.initializeApp(config);

window.firebase = firebase;


Vue.config.productionTip = false;


const unsubscribe = firebase.auth().onAuthStateChanged(user => {

  store.dispatch('setUser', user);

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    components: { App },
    template: '<App/>',
    router,
    store,
  });

  unsubscribe()
});


