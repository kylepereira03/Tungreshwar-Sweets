var swiper = new Swiper(".hero", {
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false
    },

    pagination: {
        el: ".swiper-pagination",
        clickable: true
    },
});

var shortcutSwiper = new Swiper('.shortcut-container', {
    slidesPerView: 'auto',
    spaceBetween: 12.5,
    grabCursor: true,

    scrollbar: {
        el: ".swiper-scrollbar",
        hide: true,
    },
});

var slideSwiper = new Swiper('.slide-container', {
    slidesPerView: 'auto',
    spaceBetween: 25,
    grabCursor: true,

    pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true,
    },

    freeMode: {
        enabled: true,
        momentum: true,
    },
});