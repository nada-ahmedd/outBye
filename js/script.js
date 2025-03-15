document.addEventListener("DOMContentLoaded", () => {
    // دالة لإظهار الـ Loader
    function showLoader() {
        const loader = document.getElementById("loader");
        if (loader) loader.classList.remove("hidden");
    }

    // دالة لإخفاء الـ Loader
    function hideLoader() {
        const loader = document.getElementById("loader");
        if (loader) loader.classList.add("hidden");
    }

    // إخفاء الـ Loader تلقائيًا بعد تحميل الصفحة (حل عام لكل الصفحات)
    window.addEventListener('load', hideLoader);

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

    // تحميل الـ Carousel فورًا
    showSlide(currentSlide);
    setInterval(nextSlide, 3000);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // دالة للتحقق من الـ Cache
    function getCachedData(key, expiryMinutes = 60) {
        const cached = localStorage.getItem(key);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const now = new Date().getTime();
            const expiry = expiryMinutes * 60 * 1000;
            if (now - timestamp < expiry) return data;
            localStorage.removeItem(key);
        }
        return null;
    }

    // دالة لحفظ البيانات في الـ Cache
    function setCachedData(key, data) {
        const cacheEntry = { data, timestamp: new Date().getTime() };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    }

    // جلب البيانات باستخدام Cache أو API
    async function fetchWithCache(url, cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return cachedData;
        const response = await fetch(url);
        const data = await response.json();
        setCachedData(cacheKey, data);
        return data;
    }

    // تحميل الـ Categories أولًا
    const apiUrl = "https://abdulrahmanantar.com/outbye/home.php";
    showLoader();
    fetchWithCache(apiUrl, "homeData")
        .then(homeData => {
            // معالجة الـ Categories
            const categoryWrapper = document.getElementById("category-items");
            if (homeData.status === "success" && homeData.categories && Array.isArray(homeData.categories.data)) {
                let categoryHTML = "";
                homeData.categories.data.forEach(category => {
                    if (!category.categories_id || !category.categories_name || !category.categories_image) return;
                    categoryHTML += `
                        <div class="category-item">
                            <a href="services.html?id=${encodeURIComponent(category.categories_id)}" class="category-link">
                                <div class="category-box">
                                    <img loading="lazy" src="${category.categories_image}" alt="${category.categories_name}" class="category-image">
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

            // إخفاء الـ Loader بعد تحميل الـ Categories
            hideLoader();

            // Lazy Load للـ Discount وTop Selling باستخدام IntersectionObserver
            const discountSection = document.querySelector('.discount-section');
            const topSellingSection = document.querySelector('.top-selling-section');

            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const loadDiscountItems = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const discountContainer = document.getElementById('discount-items-container');
                        const discountedItems = homeData.items.data.filter(item => item.items_discount).slice(0, 10); // رجوع لـ 10 عناصر

                        if (!discountedItems.length) {
                            discountContainer.innerHTML = "<p>No discounted items available.</p>";
                            return;
                        }

                        const discountFragment = document.createDocumentFragment();
                        discountedItems.forEach(item => {
                            const slide = document.createElement('div');
                            slide.className = 'glide__slide';
                            slide.id = `item-${item.items_id}`;
                            slide.innerHTML = `
                                <h5 class="service-name">${item.service_name}</h5>
                                <img loading="lazy" src="${item.items_image}" alt="${item.items_name}">
                                <h3>${item.items_name}</h3>
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
                            discountFragment.appendChild(slide);
                        });
                        discountContainer.appendChild(discountFragment);

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

                        observer.unobserve(entry.target);
                    }
                });
            };

            const loadTopSellingItems = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fetchWithCache("https://abdulrahmanantar.com/outbye/topselling.php", "topSellingData")
                            .then(topSellingData => {
                                const topSellingContainer = document.getElementById('top-selling-container');
                                if (!topSellingData.items || !topSellingData.items.data || !topSellingData.items.data.length) {
                                    topSellingContainer.innerHTML = "<p>No top selling items available.</p>";
                                    return;
                                }

                                const topSellingFragment = document.createDocumentFragment();
                                topSellingData.items.data.slice(0, 10).forEach(item => { // رجوع لـ 10 عناصر
                                    const slide = document.createElement('div');
                                    slide.className = 'glide__slide';
                                    slide.id = `item-${item.items_id}`;
                                    slide.innerHTML = `
                                        <img loading="lazy" src="${item.items_image}" alt="${item.items_name}">
                                        <h3>${item.items_name}</h3>
                                        <p>${item.items_des}</p>
                                        <p class="price">
                                            ${item.itemspricedisount && parseFloat(item.itemspricedisount) > 0 ? `
                                                <span class="old-price text-muted text-decoration-line-through">${item.items_price} EGP</span>
                                                <span class="new-price text-success">${item.itemspricedisount} EGP</span>
                                            ` : `
                                                <span class="regular-price">${item.items_price} EGP</span>
                                            `}
                                        </p>
                                        <div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                                            <button class="addItem-to-cart" data-itemid="${item.items_id}">Add to Cart</button>
                                            <button class="favorite-btn" data-itemid="${item.items_id}">
                                                <i class="fa-regular fa-heart"></i>
                                            </button>
                                        </div>
                                    `;
                                    topSellingFragment.appendChild(slide);
                                });
                                topSellingContainer.appendChild(topSellingFragment);

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

                                observer.unobserve(entry.target);
                            })
                            .catch(error => {
                                console.error('Error fetching top selling data:', error);
                                document.getElementById('top-selling-container').innerHTML = "<p>Error loading top selling items</p>";
                            });
                    }
                });
            };

            const discountObserver = new IntersectionObserver(loadDiscountItems, observerOptions);
            const topSellingObserver = new IntersectionObserver(loadTopSellingItems, observerOptions);

            discountObserver.observe(discountSection);
            topSellingObserver.observe(topSellingSection);
        })
        .catch(error => {
            console.error('Error fetching home data:', error);
            document.getElementById("category-items").innerHTML = "<p>Error loading data</p>";
            hideLoader();
        });

    // دالة لإعداد Event Listeners
    function setupEventListeners(glide, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

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

        const isFavorited = button.querySelector("i").classList.contains("fa-solid");

        if (!isFavorited) {
            updateFavoriteUI(itemId, true);
            glide.disable();
            fetch("https://abdulrahmanantar.com/outbye/favorite/add.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
            })
                .then(response => response.text())
                .then(text => {
                    let data = text.trim() === "" ? { status: "success" } : JSON.parse(text);
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
                .then(response => response.text())
                .then(text => {
                    let data = text.trim() === "" ? { status: "success" } : JSON.parse(text);
                    if (data.status === "success") {
                        Swal.fire({
                            icon: "success",
                            title: "✅ تمت الإزالة!",
                            text: "تمت إزالة المنتج من المفضلة.",
                            confirmButtonText: "حسنًا"
                        }).then(() => glide.enable());
                        updateFavoriteUI(itemId, false);
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
        const buttons = document.querySelectorAll(`.favorite-btn[data-itemid="${itemId}"]`);
        buttons.forEach(button => {
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
        });
    }

    function isLoggedIn() {
        return !!localStorage.getItem("userId");
    }
});