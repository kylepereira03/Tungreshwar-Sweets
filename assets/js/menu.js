const menuIcon = document.getElementById('menu-icon');
const navLinks = document.querySelector('.navlinks');

menuIcon.addEventListener('click', function () {
    navLinks.classList.toggle('active');
});