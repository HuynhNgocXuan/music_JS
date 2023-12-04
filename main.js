// 
//  * 1. Render songs
//  * 2. Scroll top
//  * 3. Play / pause / seek
//  * 4. CD rotate
//  * 5. Next- Prev
//  * 6. Random
//  * 7. Next / Repeat when ended
//  * 8. Active song
//  * 9. Scroll active song into view
//  * 10. Play when song when click



const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playToggle = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevSongBtn = $('.btn-prev');
const nextSongBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,

    isPlaying: false,

    isRandom: false,

    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Túy Âm",
            singer: "Ma sew",
            path: "./assets/music/TuyAm.mp4",
            image: "./assets/img/tuy_am.png"
        },
        {
            name: "Cùng Anh",
            singer: "Ngọc",
            path: "./assets/music/cung_anh.mp4",
            image: "./assets/img/cung_anh.png"
        },
        {
            name: "Thuyền Quyên",
            singer: "Diệu Kiên",
            path: "./assets/music/thuyen_vien.mp4",
            image: "./assets/img/thuyen_quyen.png"
        },
        {
            name: "Ngẫu Hứng",
            singer: "HOA PROX",
            path: "./assets/music/ngau_hung.mp4",
            image: "./assets/img/ngau_hung.png"
        },
        {
            name: "Thằng Điên",
            singer: "Phương Ly",
            path: "./assets/music/thang_dien.mp4",
            image: "./assets/img/thang_dien.png"
        },
        {
            name: "Em Đồng Ý",
            singer: "Đức Phúc",
            path: "./assets/music/em_dong_y.mp4",
            image: "./assets/img/em_dong_y.png"
        },
        {
            name: "Bật Tình Yên Lên",
            singer: "Tăng Duy Tân",
            path: "./assets/music/bat_tinh_yeu_len.mp4",
            image: "./assets/img/bat_tinh_yeu_len.png"
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}');">
                    </div>

                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                        
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>

            `
        })

        $('.playlist').innerHTML = html.join('');
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function () {
        const _this = this;

        // Xử lí scroll phóng to thu nhỏ CD
        const cdWidth = cd.offsetWidth;

        document.onscroll = function () {
            const scrollWidth = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollWidth;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        //  Xử lí click vào nút play
        playToggle.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        }

        // Xử lí CD quay / dừng 
        const cdRotate = cdThumb.animate(
            [
                {
                    transform: 'rotate(360deg)'
                }
            ],
            {
                duration: 8000,
                iterations: Infinity
            }
        );

        cdRotate.pause();

        // Khi song được play 
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdRotate.play();
        }

        // Khi song được pause 
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdRotate.pause();
        }

        // Khi tiến độ bài hát thay đổi 
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        // xử lí khi tua (song)
        progress.onchange = function (e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // Khi next (song)
        nextSongBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev (song)
        prevSongBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Bật / tắt random 
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // Xử lí lặp lại một (song)
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // Xử lí next song khi song ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            }
            else {
                nextSongBtn.click();
            }
        
        }

        // Lắng nghe hành vi click vào playList
        playList.onclick = function(e) {
            const clickSong = e.target.closest('.song:not(.active)');
            const clickOption = e.target.closest('.option');

            if (clickSong || clickOption) {
                // Xử lí khi click vào (song )
                if (clickSong) {
                    _this.currentIndex = Number(clickSong.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                
                // Xử lí khi click vào option 
                if (clickOption) {
    
                }
            }

        }
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    randomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 100)
    },

    start: function () {
        // Gán cấu hình từ Config vào ứng dụng
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object 
        this.defineProperties();

        // Lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng 
        this.loadCurrentSong();

        // Render playList
        this.render();

        // Hiển thị trạng thái ban đầu của button repeat & radom 
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}

app.start();