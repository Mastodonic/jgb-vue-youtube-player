<template>
    <div id="app">
        <button @click="handleClick" :style="`transition-duration: ${transitionTime/1000}s`">Change Video</button>
        <YoutubePlayer v-if="showVideo" :options="firstVideo"/>
        <YoutubePlayer :options="videoData[1]"/>
        <YoutubePlayer :options="videoData[2]"/>
    </div>
</template>

<script>
import YoutubePlayer from './components/YoutubePlayer';

export default {
    data() {
        return {
            showVideo: true,
            transitionTime: 1000,
            firstVideo: {},
            videoData: [
                {
                    videoId: 'LCz8hUMOIxk',
                    coverImage: 'https://unsplash.it/1200/800'
                },
                {
                    videoId: 'XEgEVBQFh1k'
                },
                {
                    videoId: 'xV_L7kh08cE',
                    playerVars: {
                        rel: 0,
                        color: 'red',
                        showinfo: 1,
                        modestbranding: 0,
                        disablekb: 1
                    }
                }
            ]
        };
    },
    mounted() {
        setTimeout(() => {
            this.firstVideo = {
                videoId: 'LCz8hUMOIxk'
            };
        }, 500);
    },
    name: 'app',
    components: {
        YoutubePlayer
    },
    methods: {
        handleClick() {
            this.showVideo = !this.showVideo;
            // this.firstVideo = this.videoData[1];
        }
    }
};
</script>

<style lang="scss">
    @import 'assets/app';
</style>
