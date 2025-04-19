document.addEventListener("DOMContentLoaded", () => {
    async function fetchWithToken(url, options = {}) {
        const token = localStorage.getItem('token');
        const excludedAPIs = ["offers.php", "categories.php", "topselling.php", "services.php", "items.php", "search.php"];
        const isExcluded = excludedAPIs.some(api => url.includes(api));
        options.headers = {
            ...options.headers,
            ...(isExcluded ? {} : { 'Authorization': `Bearer ${token}` }),
            "Content-Type": options.headers?.["Content-Type"] || "application/x-www-form-urlencoded"
        };
        const response = await fetch(url, options);
        const text = await response.text();
        let data = { status: "success" };
        try {
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}") + 1;
            if (jsonStart !== -1 && jsonEnd > 0) {
                const jsonText = text.substring(jsonStart, jsonEnd);
                data = JSON.parse(jsonText);
            }
        } catch (e) {}
        return data;
    }

    function showLoader() {
        const loader = document.getElementById("loader");
        if (loader) loader.classList.remove("hidden");
    }

    function hideLoader() {
        const loader = document.getElementById("loader");
        if (loader) loader.classList.add("hidden");
    }

    function isLoggedIn() {
        return !!localStorage.getItem("userId") && !!localStorage.getItem("token");
    }

    function logout() {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("favoritesCache");
        localStorage.removeItem("profileData");
        document.querySelectorAll(".favorite-btn").forEach(button => {
            const icon = button.querySelector("i");
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
            delete button.dataset.favid;
        });
        window.location.href = "signin.html";
    }

    function updateNavbar() {
        const isLoggedInUser = isLoggedIn();
        const signupBtn = document.getElementById('signupBtn');
        const userNameSpan = document.getElementById('userName');
        const logoutBtn = document.getElementById('logoutBtn');
        const cartIcon = document.getElementById('cartIcon');

        if (!signupBtn || !userNameSpan || !logoutBtn || !cartIcon) {
            console.error("Navbar elements not found!", { signupBtn, userNameSpan, logoutBtn, cartIcon });
            return;
        }

        signupBtn.style.display = isLoggedInUser ? 'none' : 'block';
        logoutBtn.style.display = isLoggedInUser ? 'block' : 'none';
        cartIcon.style.display = 'block';

        if (isLoggedInUser) {
            const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
            const userName = profileData.users_name || localStorage.getItem('email')?.split('@')[0] || 'User';
            userNameSpan.textContent = `Welcome, ${userName}`;
            userNameSpan.style.display = 'block';
        } else {
            userNameSpan.style.display = 'none';
        }

        if (!isLoggedInUser) {
            localStorage.removeItem('favoritesCache');
            document.querySelectorAll(".favorite-btn").forEach(button => {
                const icon = button.querySelector("i");
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
                icon.style.color = "";
                delete button.dataset.favid;
            });
        }
    }

    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    function debounce(func, wait) {
        let timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), wait);
        };
    }

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
        updateNavbar();
    });

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

    function initNavbarToggler() {
        const toggler = document.querySelector('.navbar-toggler');
        const navbarContent = document.querySelector('.navbar-content');
        if (toggler && navbarContent) {
            toggler.addEventListener('click', () => {
                navbarContent.classList.toggle('show');
            });
            if (window.innerWidth > 991) navbarContent.classList.add('show');
            window.addEventListener('resize', () => {
                if (window.innerWidth > 991) navbarContent.classList.add('show');
                else if (!navbarContent.classList.contains('show')) navbarContent.classList.remove('show');
            });
        }
    }

    initNavbarToggler();

    let currentIndex = 0;
    const items = document.querySelectorAll('.offer-carousel-item');
    const offerDots = document.querySelectorAll('.offer-dot');

    function changeSlide(index) {
        if (items.length > 0 && offerDots.length > 0) {
            if (index < 0) currentIndex = items.length - 1;
            else if (index >= items.length) currentIndex = 0;
            else currentIndex = index;
            const carouselInner = document.querySelector('.offer-carousel-inner');
            if (carouselInner) carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
            offerDots.forEach(dot => dot.classList.remove('active'));
            offerDots[currentIndex].classList.add('active');
        }
    }

    offerDots.forEach((dot, index) => {
        dot.addEventListener('click', () => changeSlide(index));
    });

    setInterval(() => changeSlide(currentIndex + 1), 5000);

    const searchQueryInput = document.getElementById("searchQuery");
    const searchResultsContainer = document.getElementById("searchResults");
    const searchBtn = document.querySelector(".search-btn");
    const closeBtn = document.querySelector(".close-btn");

    if (searchQueryInput && searchResultsContainer && searchBtn && closeBtn) {
        closeBtn.addEventListener("click", () => {
            searchResultsContainer.classList.remove("show");
            searchQueryInput.value = "";
        });
        searchBtn.addEventListener("click", performSearch);
        searchQueryInput.addEventListener("input", debounce(performSearch, 500));

        function performSearch() {
            const query = searchQueryInput.value.trim().toLowerCase();
            if (query.length === 0) {
                searchResultsContainer.innerHTML = "";
                searchResultsContainer.classList.remove("show");
                return;
            }
            searchResultsContainer.innerHTML = "<p style='color: black;'>Searching...</p>";
            searchResultsContainer.classList.add("show");
            fetchWithToken("https://abdulrahmanantar.com/outbye/items/search.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search: query })
            })
                .then(response => response.json())
                .then(response => {
                    if (response.status !== "success" || (!response.items?.data && !response.services?.data)) {
                        searchResultsContainer.innerHTML = "<p style='color: red;'>No results found.</p>";
                        return;
                    }
                    let itemsHTML = "<h3>Items</h3>";
                    if (response.items?.data?.length > 0) {
                        const filteredItems = response.items.data.filter(item =>
                            (item.items_name?.toLowerCase()?.includes(query) || false) ||
                            (item.items_name_ar?.toLowerCase()?.includes(query) || false)
                        );
                        if (filteredItems.length) {
                            itemsHTML += filteredItems.map(item => `
                                <div class="search-result-item">
                                    <a href="item.html?id=${item.items_id}&service_id=${item.service_id}" class="search-result-link">
                                        <img src="${item.items_image || 'images/2920343.png'}" onerror="this.src='images/2920343.png'" alt="${item.items_name || 'Item'}" width="50">
                                        <span>${item.items_name || 'Unnamed Item'}</span>
                                    </a>
                                    <button class="add-to-cart-btn" data-item-id="${item.items_id}" data-service-id="${item.service_id}">Add to Cart</button>
                                    <button class="favorite-btn" data-item-id="${item.items_id}" data-service-id="${item.service_id}">
                                        <i class="fa-regular fa-heart"></i>
                                    </button>
                                </div>
                            `).join("");
                        } else itemsHTML += "<p>No items match your search.</p>";
                    } else itemsHTML += "<p>No items available.</p>";

                    let servicesHTML = "<h3>Services</h3>";
                    if (response.services?.data?.length > 0) {
                        const filteredServices = response.services.data.filter(service =>
                            (service.service_name?.toLowerCase()?.includes(query) || false) ||
                            (service.service_name_ar?.toLowerCase()?.includes(query) || false) ||
                            (service.service_description?.toLowerCase()?.includes(query) || false) ||
                            (service.service_description_ar?.toLowerCase()?.includes(query) || false)
                        );
                        if (filteredServices.length) {
                            servicesHTML += filteredServices.map(service => `
                                <div class="search-result-item">
                                    <a href="services.html?cat=${service.service_cat || ''}&id=${service.service_id || ''}" class="search-result-link" data-service-id="${service.service_id || ''}">
                                        <img src="${service.service_image || 'images/2920343.png'}" onerror="this.src='images/2920343.png'" alt="${service.service_name || 'Service'}" width="50">
                                        <span>${service.service_name || 'Unnamed Service'} (${service.service_name_ar || 'Unnamed'})</span>
                                    </a>
                                    <button class="favorite-btn" data-service-id="${service.service_id}">
                                        <i class="fa-regular fa-heart"></i>
                                    </button>
                                </div>
                            `).join("");
                        } else servicesHTML += "<p>No services match your search.</p>";
                    } else servicesHTML += "<p>No services available.</p>";

                    searchResultsContainer.innerHTML = `
                        <div class="search-result-column">${itemsHTML}</div>
                        <div class="search-result-column">${servicesHTML}</div>
                    `;
                    document.querySelectorAll(".search-result-link").forEach(link => {
                        link.addEventListener("click", function () {
                            const serviceId = this.dataset.serviceId;
                            if (serviceId) localStorage.setItem("highlightedService", serviceId);
                        });
                    });
                    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
                        button.addEventListener("click", () => {
                            const itemId = button.dataset.itemId;
                            const serviceId = button.dataset.serviceId;
                            addToCart(itemId, serviceId);
                        });
                    });
                    document.querySelectorAll(".search-result-item .favorite-btn").forEach(button => {
                        button.addEventListener("click", () => {
                            const itemId = button.dataset.itemId;
                            const serviceId = button.dataset.serviceId;
                            toggleFavorite(itemId || serviceId, button, null);
                        });
                    });
                });
        }
    }

    function setupEventListeners(glide, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const addToCartButtons = container.querySelectorAll('.addItem-to-cart');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const itemId = btn.getAttribute('data-itemid');
                addToCart(itemId);
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
        updateFavoritesUIAfterLoad();
    }

    function addToCart(itemId, serviceId = null) {
        if (!isLoggedIn()) {
            Swal.fire({
                icon: "warning",
                title: "⚠️ Error",
                text: "Please log in first to add the item to the cart.",
                confirmButtonText: "Log In",
                showCancelButton: true,
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) window.location.href = 'signin.html';
            });
            return;
        }
        showLoader();
        const userId = localStorage.getItem("userId");
        const bodyData = serviceId ? { usersid: userId, itemsid: itemId, quantity: 1, service_id: serviceId } : { usersid: userId, itemsid: itemId, quantity: 1 };
        fetchWithToken("https://abdulrahmanantar.com/outbye/cart/add.php", {
            method: "POST",
            body: new URLSearchParams(bodyData).toString()
        });
        hideLoader();
        Swal.fire({
            icon: "success",
            title: "✅ Added!",
            text: "Item added to cart successfully.",
            confirmButtonText: "OK"
        });
    }

    function getCachedData(key, expiryMinutes = 60) {
        const cached = localStorage.getItem(key);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const now = new Date().getTime();
            const expiry = expiryMinutes * 60 * 1000;
            if (now - timestamp < expiry) return data;
            else localStorage.removeItem(key);
        }
        return null;
    }

    function setCachedData(key, data) {
        const cacheEntry = { data, timestamp: new Date().getTime() };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    }

    async function fetchWithCache(url, cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) return cachedData;
        const data = await fetchWithToken(url);
        setCachedData(cacheKey, data);
        return data;
    }

    const apiUrl = "https://abdulrahmanantar.com/outbye/home.php";
    const topSellingUrl = "https://abdulrahmanantar.com/outbye/topselling.php";

    showLoader();
    fetchWithCache(apiUrl, "homeData").then(homeData => {
        const categoryWrapper = document.getElementById("category-items");
        if (!categoryWrapper) {
            console.error("Category wrapper not found in DOM");
            hideLoader();
            return;
        }

        if (homeData.status === "success" && homeData.categories && Array.isArray(homeData.categories.data)) {
            let categoryHTML = "";
            homeData.categories.data.forEach(category => {
                if (!category.categories_id || !category.categories_name || !category.categories_image) return;
                categoryHTML += `
                    <div class="category-item">
                        <a href="services.html?id=${encodeURIComponent(category.categories_id)}" class="category-link">
                            <div class="category-box">
                                <img data-src="${category.categories_image}" alt="${category.categories_name}" class="category-image">
                                <div class="category-description">
                                    <p class="category-name">${category.categories_name}</p>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
            categoryWrapper.innerHTML = categoryHTML || "<p>No categories available.</p>";

            const categoryObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('.category-image');
                        if (img && img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            categoryWrapper.querySelectorAll('.category-item').forEach(item => categoryObserver.observe(item));
        } else {
            categoryWrapper.innerHTML = "<p>Failed to load categories</p>";
        }
        hideLoader();

        const discountObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const discountContainer = document.getElementById('discount-items-container');
                    const discountedItems = homeData.items.data.filter(item => item.items_discount).slice(0, 10);
                    if (!discountContainer) return;
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
                            <img data-src="${item.items_image || 'images/2920343.png'}" onerror="this.src='images/2920343.png'" alt="${item.items_name}">
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

                    const discountImgObserver = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                const img = entry.target.querySelector('img');
                                if (img && img.dataset.src) {
                                    img.src = img.dataset.src;
                                    img.removeAttribute('data-src');
                                }
                            }
                        });
                    }, { threshold: 0.1 });

                    discountContainer.querySelectorAll('.glide__slide').forEach(slide => discountImgObserver.observe(slide));

                    const glideDiscount = new Glide('.discount-glide', {
                        type: 'carousel',
                        perView: 4,
                        gap: 20,
                        breakpoints: { 768: { perView: 2 }, 480: { perView: 1 } },
                        peek: 0,
                        bound: true, // إضافة bound عشان يبقى مقيد بحدود الكاردات
                        rewind: false,
                        swipeThreshold: true,
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
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0. });

        const discountSection = document.querySelector('.discount-section');
        if (discountSection) discountObserver.observe(discountSection);

        const topSellingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fetchWithCache(topSellingUrl, "topSellingData").then(topSellingData => {
                        const topSellingContainer = document.getElementById('top-selling-container');
                        if (!topSellingContainer) return;
                        if (!topSellingData.items || !topSellingData.items.data || !topSellingData.items.data.length) {
                            topSellingContainer.innerHTML = "<p>No top selling items available.</p>";
                            return;
                        }
                        const topSellingFragment = document.createDocumentFragment();
                        topSellingData.items.data.slice(0, 10).forEach(item => {
                            const slide = document.createElement('div');
                            slide.className = 'glide__slide';
                            slide.id = `item-${item.items_id}`;
                            slide.innerHTML = `
                                <img data-src="${item.items_image || 'images/2920343.png'}" onerror="this.src='images/2920343.png'" alt="${item.items_name}">
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

                        const topSellingImgObserver = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const img = entry.target.querySelector('img');
                                    if (img && img.dataset.src) {
                                        img.src = img.dataset.src;
                                        img.removeAttribute('data-src');
                                    }
                                }
                            });
                        }, { threshold: 0.1 });

                        topSellingContainer.querySelectorAll('.glide__slide').forEach(slide => topSellingImgObserver.observe(slide));

                        const glideTopSelling = new Glide('.top-selling-glide', {
                            type: 'carousel',
                            perView: 3,
                            gap: 10,
                            breakpoints: { 768: { perView: 2 }, 480: { perView: 1 } },
                            peek: 1,
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
                        observer.unobserve(entry.target);
                    });
                }
            });
        }, { threshold: 0.1 });

        const topSellingSection = document.querySelector('.top-selling-section');
        if (topSellingSection) topSellingObserver.observe(topSellingSection);
    }).catch(error => {
        console.error("Error fetching home data:", error);
        hideLoader();
    });

    async function checkInitialFavorites() {
        const userId = localStorage.getItem("userId");
        if (userId && isLoggedIn()) {
            const data = await fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/view.php", {
                method: "POST",
                body: new URLSearchParams({ id: userId }).toString()
            });
            if (data.status === "success" && Array.isArray(data.data)) {
                const uniqueFavorites = [];
                const seenItems = new Set();
                data.data.forEach(item => {
                    if (!seenItems.has(item.favorite_itemsid)) {
                        seenItems.add(item.favorite_itemsid);
                        uniqueFavorites.push(item);
                    }
                });
                localStorage.setItem("favoritesCache", JSON.stringify(uniqueFavorites));
                uniqueFavorites.forEach(fav => updateFavoriteUI(fav.favorite_itemsid, true, fav.favorite_id));
            } else localStorage.removeItem("favoritesCache");
        } else {
            localStorage.removeItem("favoritesCache");
            updateFavoriteUI(null, false);
        }
    }

    function updateFavoritesUIAfterLoad() {
        const cachedFavorites = JSON.parse(localStorage.getItem("favoritesCache") || "[]");
        if (isLoggedIn()) {
            cachedFavorites.forEach(fav => updateFavoriteUI(fav.favorite_itemsid, true, fav.favorite_id));
        } else {
            document.querySelectorAll(".favorite-btn").forEach(button => {
                const icon = button.querySelector("i");
                icon.classList.remove("fa-solid");
                icon.classList.add("fa-regular");
                icon.style.color = "";
                delete button.dataset.favid;
            });
        }
    }

    async function toggleFavorite(itemId, button, glide) {
        if (!isLoggedIn()) {
            if (glide) glide.disable();
            Swal.fire({
                icon: "warning",
                title: "⚠️ Error",
                text: "Please log in first to add items to favorites.",
                confirmButtonText: "Log In",
                showCancelButton: true,
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) window.location.href = 'signin.html';
                if (glide) glide.enable();
            });
            return;
        }
        showLoader();
        const userId = localStorage.getItem("userId");
        const cachedFavorites = JSON.parse(localStorage.getItem("favoritesCache") || "[]");
        const isAlreadyFavorited = cachedFavorites.some(fav => fav.favorite_itemsid === itemId);

        if (!isAlreadyFavorited) {
            const data = await fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/add.php", {
                method: "POST",
                body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
            });
            hideLoader();
            Swal.fire({
                icon: "success",
                title: "✅ Added!",
                text: "Item added to favorites successfully.",
                confirmButtonText: "OK"
            }).then(() => { if (glide) glide.enable(); });
            const newFavorite = { favorite_itemsid: itemId, favorite_id: data.favorite_id || null };
            cachedFavorites.push(newFavorite);
            localStorage.setItem("favoritesCache", JSON.stringify(cachedFavorites));
            updateFavoriteUI(itemId, true, data.favorite_id || null);
        } else {
            const data = await fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/remove.php", {
                method: "POST",
                body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
            });
            hideLoader();
            Swal.fire({
                icon: "success",
                title: "✅ Removed!",
                text: "Item removed from favorites successfully.",
                confirmButtonText: "OK"
            }).then(() => { if (glide) glide.enable(); });
            const updatedFavorites = cachedFavorites.filter(fav => fav.favorite_itemsid !== itemId);
            localStorage.setItem("favoritesCache", JSON.stringify(updatedFavorites));
            updateFavoriteUI(itemId, false);
        }
    }

    function updateFavoriteUI(itemId, isFavorited, favId = null) {
        const buttons = itemId ? document.querySelectorAll(`.favorite-btn[data-itemid="${itemId}"], .favorite-btn[data-service-id="${itemId}"]`) : document.querySelectorAll(".favorite-btn");
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

    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (event) => {
            event.preventDefault();
            if (!isLoggedIn()) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Not Logged In',
                    text: 'Please log in first to view the cart!',
                    confirmButtonText: 'Log In',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) window.location.href = 'signin.html';
                });
            } else {
                window.location.href = 'cart.html';
            }
        });
    }

    const logoutBtnNav = document.getElementById('logoutBtn');
    if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            localStorage.removeItem('token');
            localStorage.removeItem('profileData');
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('favoritesCache');

            updateNavbar();

            Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been logged out successfully. Redirecting to the login page.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'signin.html';
            });
        });
    }

    checkInitialFavorites();
});