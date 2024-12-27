document.addEventListener('DOMContentLoaded', function () {
    const stars = document.querySelectorAll('.custom-star-rating i');
    let selectedRating = 0;

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
    document.querySelectorAll('.client-boxes').forEach(section => {
        section.classList.toggle('active-section', section.id === sectionId);
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-section') === sectionId);
    });
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        showSection(button.getAttribute('data-section'));
    });
});


     function toggleMenu() {
        const navbarLeft = document.querySelector('.navbar-left');
        const navbarRight = document.querySelector('.navbar-right');

        navbarLeft.classList.toggle('show');  
        navbarRight.classList.toggle('show');  
    }

    const toggleButton = document.querySelector('.navbar-toggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleMenu);
    }
});
 let currentIndex = 0;
    const items = document.querySelectorAll('.offer-carousel-item');
    const dots = document.querySelectorAll('.offer-dot');

    function changeSlide(index) {
        if (index < 0) {
            currentIndex = items.length - 1;
        } else if (index >= items.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        document.querySelector('.offer-carousel-inner').style.transform = `translateX(-${currentIndex * 100}%)`;

        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentIndex].classList.add('active');
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            changeSlide(index);
        });
    });

    setInterval(() => {
        changeSlide(currentIndex + 1);
    }, 5000);