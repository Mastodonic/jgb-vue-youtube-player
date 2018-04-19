import YoutubePlayer from './components/YoutubePlayer';
export default YoutubePlayer;
import Vue from 'vue';
import App from './App';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App
    }
});
