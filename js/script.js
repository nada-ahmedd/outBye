document.addEventListener('DOMContentLoaded', function () {
    const stars = document.querySelectorAll('.custom-star-rating i');
    let selectedRating = 0;

    // التحقق من وجود النجوم
    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('click', function () {
                selectedRating = parseInt(star.getAttribute('data-value')); 

                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
                        s.classList.remove('empty-star'); 
                        s.classList.add('filled-star');   
                    } else {
                        s.classList.remove('filled-star'); 
                        s.classList.add('empty-star');    
                    }
                });

                Swal.fire({
                    title: "Thank you for your rating!",
                    text: `You gave us a rating of ${selectedRating} stars!`,
                    icon: "success",
                    confirmButtonText: "Close"
                });
            });
        });
    }

    const leftBtn = document.querySelector('.left-btn');
    const rightBtn = document.querySelector('.right-btn');
    const clientBoxes = document.getElementById('client-boxes');

    if (leftBtn && rightBtn && clientBoxes) {
        leftBtn.addEventListener('click', () => {
            clientBoxes.scrollBy({ left: -clientBoxes.offsetWidth / 3, behavior: 'smooth' });
        });

        rightBtn.addEventListener('click', () => {
            clientBoxes.scrollBy({ left: clientBoxes.offsetWidth / 3, behavior: 'smooth' });
        });
    }

    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = 'none';
            dots[i].classList.remove('active');
        });
        slides[index].style.display = 'block';
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    setInterval(nextSlide, 3000);
    showSlide(currentSlide);

    function showSection(sectionId) {
        const sections = document.querySelectorAll('.client-boxes');
        sections.forEach(section => {
            section.classList.remove('active-section');
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.add('active-section');
        }

        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => button.classList.remove('active'));

        const activeButton = document.querySelector(`.tab-button[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });
});
