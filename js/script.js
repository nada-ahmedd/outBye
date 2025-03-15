document.addEventListener("DOMContentLoaded", () => {
    // الـ Carousel الأول
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');

    function showSlide(index) {
        if (slides.length > 0 && dots.length > 0) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                dots[i].classList.remove('active');
            });
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    window.addEventListener('load', () => {
        showSlide(currentSlide);
        setInterval(nextSlide, 3000);
    });

    // الـ Tabs
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

    // الـ Navbar Toggler
    function initNavbarToggler() {
        const toggler = document.querySelector('.navbar-toggler');
        const navbarContent = document.querySelector('.navbar-content');

        if (toggler && navbarContent) {
            toggler.addEventListener('click', () => {
                console.log('Toggler clicked!');
                navbarContent.classList.toggle('show');
            });

            if (window.innerWidth > 991) {
                navbarContent.classList.add('show');
            }

            window.addEventListener('resize', () => {
                if (window.innerWidth > 991) {
                    navbarContent.classList.add('show');
                } else if (!navbarContent.classList.contains('show')) {
                    navbarContent.classList.remove('show');
                }
            });
        } else {
            console.error('Toggler or Navbar Content not found!');
        }
    }

    initNavbarToggler();

    // الـ Offer Carousel
    let currentIndex = 0;
    const items = document.querySelectorAll('.offer-carousel-item');
    const offerDots = document.querySelectorAll('.offer-dot');

    function changeSlide(index) {
        if (items.length > 0 && offerDots.length > 0) {
            if (index < 0) {
                currentIndex = items.length - 1;
            } else if (index >= items.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            const carouselInner = document.querySelector('.offer-carousel-inner');
            if (carouselInner) {
                carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            offerDots.forEach(dot => dot.classList.remove('active'));
            offerDots[currentIndex].classList.add('active');
        }
    }

    offerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            changeSlide(index);
        });
    });

    setInterval(() => changeSlide(currentIndex + 1), 5000);

    // جلب بيانات الـ Categories
    const apiUrl = "https://abdulrahmanantar.com/outbye/home.php";
    const categoryWrapper = document.getElementById("category-items");

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && data.categories && Array.isArray(data.categories.data)) {
                let categoryHTML = "";
                data.categories.data.forEach(category => {
                    if (!category.categories_id || !category.categories_name || !category.categories_image) return;
                    categoryHTML += `
                        <div class="category-item">
                            <a href="services.html?id=${encodeURIComponent(category.categories_id)}" class="category-link">
                                <div class="category-box">
                                    <img src="${category.categories_image}" alt="${category.categories_name}" class="category-image">
                                    <div class="category-description">
                                        <p class="category-name">${category.categories_name}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `;
                });
                categoryWrapper.innerHTML = categoryHTML || "<p>No categories available.</p>";
            } else {
                categoryWrapper.innerHTML = "<p>Failed to load categories</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching categories:", error);
            categoryWrapper.innerHTML = "<p>Error loading categories</p>";
        });

    // دالة لإعداد Event Listeners
    function setupEventListeners(glide, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container ${containerSelector} not found!`);
            return;
        }

        const addToCartButtons = container.querySelectorAll('.addItem-to-cart');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const itemId = btn.getAttribute('data-itemid');
                if (!isLoggedIn()) {
                    glide.disable();
                    Swal.fire({
                        icon: "warning",
                        title: "⚠️ خطأ",
                        text: "يرجى تسجيل الدخول أولاً.",
                        confirmButtonText: "حسنًا"
                    }).then(() => glide.enable());
                } else {
                    const userId = localStorage.getItem("userId");
                    glide.disable();
                    fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({ usersid: userId, itemsid: itemId, quantity: 1 }).toString()
                    })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire({
                            icon: data.success ? "success" : "error",
                            title: data.success ? "✅ تمت الإضافة!" : "❌ خطأ",
                            text: data.success ? "تمت إضافة المنتج إلى السلة بنجاح." : (data.message || "فشل إضافة المنتج."),
                            confirmButtonText: "حسنًا"
                        }).then(() => glide.enable());
                    })
                    .catch(() => {
                        Swal.fire({
                            icon: "error",
                            title: "❌ خطأ",
                            text: "حدث خطأ أثناء الإضافة.",
                            confirmButtonText: "حسنًا"
                        }).then(() => glide.enable());
                    });
                }
            });
        });

        const favoriteButtons = container.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const itemId = btn.getAttribute('data-itemid');
                toggleFavorite(itemId, btn, glide);
            });
        });
    }

    // جلب بيانات الـ Discount Items
    fetch('https://abdulrahmanantar.com/outbye/home.php')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('discount-items-container');
            const discountedItems = data.items.data.filter(item => item.items_discount);

            if (!container) {
                console.error("Discount items container not found!");
                return;
            }
            if (!discountedItems.length) {
                container.innerHTML = "<p>No discounted items available.</p>";
                return;
            }

            discountedItems.forEach(item => {
                const slide = document.createElement('div');
                slide.className = 'glide__slide';
                slide.id = `item-${item.items_id}`;
                slide.innerHTML = `
                                    <h5>${item.service_name}</h5>
                    <img src="${item.items_image}" alt="${item.items_name}">
                    <h3>${item.items_name}</h3>
                    <h5>${item.service_name}</h5>
                    <p>${item.items_des}</p>
                    <p class="price">
                        ${item.items_discount ? `<span class="old-price">${item.items_price} EGP</span> <span class="new-price">${item.items_discount} EGP</span>` : `<span class="regular-price">${item.items_price} EGP</span>`}
                    </p>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                        <button class="addItem-to-cart" data-itemid="${item.items_id}">Add to Cart</button>
                        <button class="favorite-btn" data-itemid="${item.items_id}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                `;
                container.appendChild(slide);
            });

            const glideDiscount = new Glide('.discount-glide', {
                type: 'carousel',
                perView: 4,
                gap: 20,
                breakpoints: { 768: { perView: 2 }, 480: { perView: 1 } },
                peek: 0,
                rewind: false,
                swipeThreshold: false,
                dragThreshold: false,
            });

            glideDiscount.mount();
            setupEventListeners(glideDiscount, '.discount-glide');

            document.querySelector('.discount-glide').addEventListener('click', (e) => {
                if (!e.target.closest('.glide__arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });

            checkInitialFavorites();
        })
        .catch(error => console.error('Error fetching discount items:', error));

    // جلب بيانات الـ Top Selling
// جلب بيانات الـ Top Selling
fetch('https://abdulrahmanantar.com/outbye/topselling.php')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('top-selling-container'); // تغيير الـ ID
        if (!container) {
            console.error("Top selling items container not found!");
            return;
        }
        if (!data.items.data.length) {
            container.innerHTML = "<p>No top selling items available.</p>";
            return;
        }

        container.innerHTML = ''; // مسح الـ container قبل الإضافة
        data.items.data.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'glide__slide';
            slide.id = `item-${item.items_id}`;
            slide.innerHTML = `
                <img src="${item.items_image}" alt="${item.items_name}">
                <h3>${item.items_name}</h3>
                <p>${item.items_des}</p>
                <p class="price">
                    ${item.itemspricedisount ? `<span class="old-price">${item.items_price} EGP</span> <span class="new-price">${item.itemspricedisount} EGP</span>` : `<span class="regular-price">${item.items_price} EGP</span>`}
                </p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <button class="addItem-to-cart" data-itemid="${item.items_id}">Add to Cart</button>
                    <button class="favorite-btn" data-itemid="${item.items_id}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                </div>
            `;
            container.appendChild(slide);
        });

        const glideTopSelling = new Glide('.top-selling-glide', {
            type: 'carousel',
            perView: 4,
            gap: 20,
            breakpoints: { 768: { perView: 2 }, 480: { perView: 1 } },
            peek: 0,
            rewind: false,
            swipeThreshold: false,
            dragThreshold: false,
        });

        glideTopSelling.mount();
        setupEventListeners(glideTopSelling, '.top-selling-glide');

        document.querySelector('.top-selling-glide').addEventListener('click', (e) => {
            if (!e.target.closest('.glide__arrow')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        checkInitialFavorites();
    })
    .catch(error => console.error('Error fetching top selling items:', error));

// دالة للتحقق من الـ Favorites الابتدائية
function checkInitialFavorites() {
    const userId = localStorage.getItem("userId");
    if (userId) {
        fetch("https://abdulrahmanantar.com/outbye/favorite/view.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: userId }).toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" && Array.isArray(data.data)) {
                data.data.forEach(fav => {
                    updateFavoriteUI(fav.favorite_itemsid, true, fav.favorite_id);
                });
            }
        })
        .catch(error => console.error('Error fetching initial favorites:', error));
    }
}

// Favorite Functions
function toggleFavorite(itemId, button, glide) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        glide.disable();
        Swal.fire({
            icon: "warning",
            title: "⚠️ خطأ",
            text: "يجب تسجيل الدخول أولًا لإضافة المنتجات إلى المفضلة.",
            confirmButtonText: "حسنًا"
        }).then(() => glide.enable());
        return;
    }

    const icon = button.querySelector("i");
    const isFavorited = icon.classList.contains("fa-solid");

    if (!isFavorited) {
        updateFavoriteUI(itemId, true);
        glide.disable();
        fetch("https://abdulrahmanantar.com/outbye/favorite/add.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
        })
        .then(response => {
            console.log("Add Favorite Raw Response:", response);
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(text => {
            console.log("Add Favorite Text:", text);
            let data = text.trim() === "" ? { status: "success" } : JSON.parse(text) || { status: "error", message: text };
            if (data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "✅ تمت الإضافة!",
                    text: "تمت إضافة المنتج إلى المفضلة.",
                    confirmButtonText: "حسنًا"
                }).then(() => glide.enable());
                updateFavoriteUI(itemId, true, data.favorite_id || null);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "❌ خطأ",
                    text: data.message || "لم يتمكن السيرفر من إضافة المنتج.",
                    confirmButtonText: "حسنًا"
                }).then(() => {
                    glide.enable();
                    updateFavoriteUI(itemId, false);
                });
            }
        })
        .catch(error => {
            console.error("Error adding favorite:", error);
            Swal.fire({
                icon: "error",
                title: "❌ خطأ",
                text: "حدث خطأ أثناء الإضافة.",
                confirmButtonText: "حسنًا"
            }).then(() => {
                glide.enable();
                updateFavoriteUI(itemId, false);
            });
        });
    } else {
        updateFavoriteUI(itemId, false);
        glide.disable();
        fetch("https://abdulrahmanantar.com/outbye/favorite/remove.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
        })
        .then(response => {
            console.log("Remove Favorite Raw Response:", response);
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(text => {
            console.log("Remove Favorite Text:", text);
            let data = text.trim() === "" ? { status: "success" } : JSON.parse(text) || { status: "error", message: text };
            if (data.status === "success") {
                Swal.fire({
                    icon: "success",
                    title: "✅ تمت الإزالة!",
                    text: "تمت إزالة المنتج من المفضلة.",
                    confirmButtonText: "حسنًا"
                }).then(() => glide.enable());
            } else {
                Swal.fire({
                    icon: "error",
                    title: "❌ خطأ",
                    text: data.message || "لم يتمكن السيرفر من حذف المنتج.",
                    confirmButtonText: "حسنًا"
                }).then(() => {
                    glide.enable();
                    updateFavoriteUI(itemId, true);
                });
            }
        })
        .catch(error => {
            console.error("Error removing favorite:", error);
            Swal.fire({
                icon: "error",
                title: "❌ خطأ",
                text: "حدث خطأ أثناء الإزالة.",
                confirmButtonText: "حسنًا"
            }).then(() => {
                glide.enable();
                updateFavoriteUI(itemId, true);
            });
        });
    }
}

function updateFavoriteUI(itemId, isFavorited, favId = null) {
    const button = document.querySelector(`.favorite-btn[data-itemid="${itemId}"]`);
    if (button) {
        const icon = button.querySelector("i");
        if (isFavorited) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "#F26B0A";
            if (favId) button.dataset.favid = favId;
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
            delete button.dataset.favid;
        }
    }
}
    function isLoggedIn() {
        return !!localStorage.getItem("userId");
    }
});