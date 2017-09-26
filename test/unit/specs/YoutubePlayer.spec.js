import Vue from 'vue';
import YoutubePlayer from '@/components/YoutubePlayer';

describe('YoutubePlayer.vue', () => {
    it('should render', () => {
        const Constructor = Vue.extend(YoutubePlayer);
        const vm = new Constructor({
            propsData: {
                options: {
                    videoId: 'LCz8hUMOIxk'
                }
            }
        }).$mount();
        expect(vm.$el.querySelectorAll('.c-youtube-player__inner').length).to.equal(1);
    });

    it('should create iframe api script', () => {
        const Constructor = Vue.extend(YoutubePlayer);
        const vm = new Constructor({
            propsData: {
                options: {
                    videoId: 'LCz8hUMOIxk'
                }
            }
        });

        vm.loadYoutubeApi();

        expect(document.getElementsByTagName('script')[0].src).to.equal('https://www.youtube.com/iframe_api');
    });

    it('should call iframe api callback', (done) => {
        const Constructor = Vue.extend(YoutubePlayer);
        const vm = new Constructor({
            propsData: {
                options: {
                    videoId: 'LCz8hUMOIxk'
                }
            }
        });

        const cb = sinon.spy();

        vm.loadYoutubeApi();

        window.YTPEvent = new Vue();
        window.YTPEvent.$on('iframe-api-loaded', cb);

        setTimeout(() => {
            cb.should.have.been.called;
            done();
        }, 1000);
    });
});
