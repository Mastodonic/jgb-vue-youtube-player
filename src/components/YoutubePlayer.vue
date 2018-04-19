<template>
    <div :class="classList">
        <div :class="cssClasses.wrapperInner">
            <div :id="data.videoId" :class="cssClasses.video"></div>
            <div v-if="!helpers.isMobile.any()" @click="handleCoverClick"
                :class="cssClasses.cover" :style="`background-image:url(${data.coverImage})`">
                <div :class="cssClasses.icons">
                    <div :class="cssClasses.playButtonWrapper" v-html="data.playIcon"></div>
                    <div :class="cssClasses.spinnerWrapper" v-html="data.spinnerIcon"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* global YT */
import helpers from '../helpers';

export default {
    props: ['options'],
    data() {
        return {
            coverIsHidden: true,
            data: {},
            defaults: {
                coverImage: '',
                cssClasses: {
                    wrapper: 'c-youtube-player',
                    wrapperInner: 'c-youtube-player__inner',
                    video: 'c-youtube-player__video',
                    cover: 'c-youtube-player__cover',
                    icons: 'c-youtube-player__icons',
                    spinnerWrapper: 'c-youtube-player__spinner-wrapper',
                    playButtonWrapper: 'c-youtube-player__play-button-wrapper'
                },
                playIcon: '<svg class="c-youtube-player__play-button" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 300 300" xml:space="preserve"><path d="M281.9,144.5L24.5,1.4c-3-1.7-5.5-1.9-7.7-0.6c-2.1,1.3-3.2,3.6-3.2,7v285.3c0,3.4,1.1,5.7,3.2,7c2.1,1.3,4.7,1.1,7.7-0.6l257.4-143c3-1.7,4.5-3.7,4.5-6C286.3,148.1,284.9,146.1,281.9,144.5L281.9,144.5z"></path></svg>',
                spinnerIcon: '<svg class="c-youtube-player__spinner" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 300 300" xml:space="preserve"> <circle cx="150" cy="150" r="120"></circle></svg>',
                playerVars: {
                    rel: 0,
                    color: 'white',
                    showinfo: 0,
                    modestbranding: 1,
                    iv_load_policy: 3,
                    disablekb: 1
                }
            },
            helpers,
            isLoading: false,
            player: {},
            playerCreated: false,
            videoStarted: false
        };
    },
    created() {
        this.setData();

        if (this.options.videoId) {
            this.setCoverImage();
        }
    },
    mounted() {
        if (this.options.videoId) {
            this.loadYoutubeApi();
            this.coverIsHidden = false;
        }
    },
    beforeDestroy() {
        // Delete Player from players array

        if (window.YTPPlayers) {
            let index = window.YTPPlayers.indexOf(this.player);
            if (index > -1) {
                window.YTPPlayers.splice(index, 1);
            }
        }
    },
    watch: {
        /**
         * Update Component when the options prop changes
         */
        options (newVal) {
            if (newVal) {
                this.setData();
                this.setCoverImage();

                if (this.playerCreated) {
                    this.player.cueVideoById(newVal.videoId);
                    this.coverIsHidden = false;
                    this.isLoading = false;
                    this.videoStarted = false;
                } else {
                    if (newVal.videoId) {
                        this.loadYoutubeApi();
                        this.coverIsHidden = false;
                    }
                }
            }
        }
    },
    computed: {
        cssClasses() {
            return this.data.cssClasses;
        },
        classList() {
            let classList = {};
            classList[this.cssClasses.wrapper] = true;
            classList[`${this.cssClasses.wrapper}--is-loading`] = this.isLoading;
            classList[`${this.cssClasses.wrapper}--cover-is-hidden`] = this.coverIsHidden;
            classList[`${this.cssClasses.wrapper}--is-ready`] = window.iframeApiCreated;
            return classList;
        }
    },
    methods: {
        /**
         * Set component data by mixing options and default settings
         */
        setData() {
            let prop;

            for (prop in this.defaults) {
                if (Object.prototype.hasOwnProperty.call(
                        this.defaults, prop)) {
                    this.$set(this.data, prop, this.defaults[prop]);
                }
            }

            for (prop in this.options) {
                if (Object.prototype.hasOwnProperty.call(
                        this.options, prop)) {
                    this.$set(this.data, prop, this.options[prop]);
                }
            }
        },

        /**
         * Set the default thumbnail
         */
        setCoverImage() {
            if (!this.options.coverImage) {
                let src = `https://img.youtube.com/vi/${this.data.videoId}/maxresdefault.jpg`;
                let img = new Image();

                img.src = src;

                img.onload = () => {
                    let size = img.width > 300 ? 'maxresdefault' : '0';
                    this.data.coverImage = `https://img.youtube.com/vi/${this.data.videoId}/${size}.jpg`;
                };
            }
        },

        /**
         * handle click on cover video
         */
        handleCoverClick() {
            this.isLoading = true;

            if (this.playerCreated) {
                this.player.playVideo();
            } else {
                this.createPlayer();
            }

            this.pauseOtherVideos();
        },

        /**
         * Create youtube api script
         */
        loadYoutubeApi() {
            let tag,
                firstScriptTag;

            if (!window.iframeApiCreated) {
                tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.iframeApiCreated = true;
            }

            if (window.YT) {
                this.onYouTubeIframeAPIReady();
            } else {
                window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady;
            }
        },

        /**
         * Callback function once the iframe api is loaded
         */
        onYouTubeIframeAPIReady() {
            if (this.helpers.isMobile.any()) {
                this.handleCoverClick();
            }
        },

        /**
         * Create youtube player and attach it to the vue instance
         */
        createPlayer() {
            let player = new YT.Player(this.data.videoId, {
                videoId: this.data.videoId,
                playerVars: this.data.playerVars,
                events: {
                    onReady: this.onPlayerReady,
                    onStateChange: this.onPlayerStateChange
                }
            });

            this.player = player;

            // Create an array of all YT players
            if (!window.YTPPlayers) {
                window.YTPPlayers = [];
            }

            window.YTPPlayers.push(this.player);
        },

        /**
         * Pause other videos on the same page
         */
        pauseOtherVideos() {
            let players = window.YTPPlayers;

            players.forEach((player) => {
                if (player !== this.player) {
                    player.pauseVideo();
                }
            });
        },

        /**
         * This method is executed once the player has been created
         * @param  {object} e event object from iframe api
         */
        onPlayerReady(e) {
            // This will set the player state to -1 (unstarted);
            if (!this.helpers.isMobile.any()) {
                this.player.stopVideo();
                this.player.playVideo();
            }

            this.playerCreated = true;
        },

        /**
         * Custom cover image and spinner based on player state
         * @param {object} e event object from iframe api
         */
        onPlayerStateChange(e) {
            let state = e.data;

            switch (state) {

            // Unstarted
            case -1:
                this.videoStarted = true;
                break;

            // Ended
            case 0:
                this.coverIsHidden = false;
                this.isLoading = false;
                this.videoStarted = false;
                break;

            // Playing
            case 1:
                this.coverIsHidden = true;
                this.isLoading = false;
                this.pauseOtherVideos();
                break;

            // Buffering
            case 3:
                if (!this.videoStarted) {
                    this.coverIsHidden = false;
                    this.isLoading = true;
                }
                break;

            // Cued
            case 5:
                break;
            }
        }
    }
};
</script>
