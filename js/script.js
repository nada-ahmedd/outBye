document.addEventListener("DOMContentLoaded", () => {
    // اجبار الصفحة تروح لأعلى فورًا
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    // إعداد الـ Spinner باستخدام Spin.js
    const spinnerTarget = document.createElement("div");
    spinnerTarget.id = "spinner-container";
    document.body.appendChild(spinnerTarget);

    const spinner = new Spinner({
        lines: 13, // عدد الخطوط في الـ spinner
        length: 28, // طول كل خط
        width: 10, // عرض الخط
        radius: 42, // نص القطر
        scale: 1, // حجم الـ spinner
        corners: 1, // شكل الأطراف (مستديرة)
        color: '#ffffff', // لون الـ spinner (أبيض)
        speed: 1, // سرعة الدوران
        trail: 60, // الطول البعدي للخطوط
        shadow: true, // ظل للإحساس بالعمق
        hwaccel: true, // تسريع الأداء
        position: "fixed", // مكان الـ spinner في الصفحة
        top: "50%", // في النص رأسيًا
        left: "50%", // في النص أفقيًا
        zIndex: 9999 // فوق كل العناصر
    }).spin(spinnerTarget);

    // إضافة خلفية بسيطة للـ spinner
    const overlay = document.createElement("div");
    overlay.id = "spinner-overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9998;
    `;
    document.body.appendChild(overlay);

    // دالة إعادة بناء الجدول
    function renderTable() {
        productTable.innerHTML = "";
        products.forEach((product, index) => {
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.quantity}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="editProduct(${index})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Delete</button>
                    </td>
                </tr>
            `;
            productTable.innerHTML += row;
        });
    }

    // دالة إضافة منتج للسلة
    function addToCart(name, price) {
        const existingProduct = products.find(product => product.name === name);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            products.push({ name, price: parseFloat(price), quantity: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(products));
        localStorage.setItem("cartCount", products.length);
        renderTable();
    }

    // حدث النقر على أزرار Add-btn
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("Add-btn")) {
            const name = event.target.getAttribute("data-name");
            const price = event.target.getAttribute("data-price");
            addToCart(name, price);
        }
    });

    // دالة حذف منتج
    function deleteProduct(index) {
        products.splice(index, 1);
        renderTable();
    }

    // دالة تعديل الكمية
    function editProduct(index) {
        const product = products[index];
        const newQuantity = prompt(`Edit quantity for ${product.name}:`, product.quantity);
        if (newQuantity !== null) {
            products[index].quantity = parseInt(newQuantity);
            renderTable();
        }
    }

    // حدث النقر على أزرار Add-btn مع تحديث localStorage
    document.querySelectorAll(".Add-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const product = {
                name: btn.dataset.name,
                price: parseInt(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            };

            let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
            const existingItem = cartItems.find(item => item.name === product.name);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push(product);
            }

            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            showAddToCartNotification(product.name);
            alert("Item added to cart!");
        });
    });

    // دالة تحديث عدد عناصر السلة
    function updateCartCount() {
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector(".cart-count").textContent = totalItems;
    }

    // دالة عرض إشعار إضافة المنتج
    function showAddToCartNotification(productName) {
        const notification = document.createElement("div");
        notification.className = "add-to-cart-notification";
        notification.textContent = `${productName} has been added to your cart!`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // الـ Star Rating
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

    // أزرار الـ Client Boxes
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

    // جلب بيانات الـ Categories من الـ API
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
        })
        .finally(() => {
            // إيقاف الـ Spinner وإزالة الـ overlay بعد ما الـ fetch يخلّص
            spinner.stop();
            document.body.removeChild(spinnerTarget);
            document.body.removeChild(overlay);
            // التأكد من الـ scroll مرة تانية بعد تحميل الداتا
            window.scrollTo({
                top: 0,
                behavior: "instant"
            });
        });

    // بيانات الـ Offers
    const offers = [
        {
            items_name: "Large Koshary",
            items_price: "40",
            items_discount: "45",
            items_image: "https://abdulrahmanantar.com/outbye/upload/items/pyramid tour.webp",
            items_des: "A large portion of the traditional Egyptian koshary with extra toppings.",
            items_id: 1
        },
        {
            items_name: "Chicken Bucket",
            items_price: "150",
            items_discount: "10",
            items_image: "https://abdulrahmanantar.com/outbye/upload/items/chicken bucket.jpg",
            items_des: "A bucket of crispy fried chicken pieces, perfect for sharing.",
            items_id: 2
        },
        {
            items_name: "Breakfast Buffet",
            items_price: "200",
            items_discount: "55",
            items_image: "https://abdulrahmanantar.com/outbye/upload/items/breakfast buffet.jpg",
            items_des: "A rich breakfast buffet with a variety of local and international dishes.",
            items_id: 3
        },
        {
            items_name: "Pepperoni Pizza",
            items_price: "120",
            items_discount: "35",
            items_image: "https://abdulrahmanantar.com/outbye/upload/items/pepperoni pizza.jpg",
            items_des: "A classic pizza with pepperoni and mozzarella cheese.",
            items_id: 4
        },
    ];

    const carouselInner = document.getElementById("offer-carousel-inner");
    const dotsContainer = document.getElementById("offer-dots");

    offers.forEach((offer, index) => {
        const carouselItem = document.createElement("div");
        carouselItem.className = `offer-carousel-item ${index === 0 ? "active" : ""}`;
        carouselItem.innerHTML = `
            <div class="offer-item-content">
                <div class="offer-item-info">
                    <p class="offer-price">$${offer.items_price}</p>
                    <p class="offer-description">${offer.items_des}</p>
                </div>
                <div class="offer-discount-percentage">
                    <span>${offer.items_discount}% OFF</span>
                </div>
                <img src="${offer.items_image}" alt="${offer.items_name}" class="offer-image">
                <button class="offer-btn addItem-to-cart" data-itemid="${offer.items_id}">Add To Cart</button>
            </div>
        `;
        carouselInner.appendChild(carouselItem);

        const dot = document.createElement("span");
        dot.className = `offer-dot ${index === 0 ? "active" : ""}`;
        dotsContainer.appendChild(dot);
    });

    // إضافة مستمعات الأحداث لأزرار Add to Cart
    function addEventListeners() {
        const buttons = document.querySelectorAll(".addItem-to-cart");
        console.log("Found Add to Cart buttons:", buttons.length);
        buttons.forEach(button => {
            button.addEventListener("click", (event) => {
                const itemId = event.target.getAttribute("data-itemid");
                console.log("Clicked Add to Cart for item:", itemId);
                if (itemId) addToCart(itemId);
            });
        });
    }

    // دالة إضافة المنتج للسلة عبر الـ API
    function addToCart(itemId) {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            Swal.fire({
                title: "⚠️ تسجيل الدخول مطلوب",
                text: "يرجى تسجيل الدخول لإضافة المنتجات إلى السلة.",
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "استمرار التصفح",
                confirmButtonText: "تسجيل الدخول",
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "signup.html";
                }
            });
            return;
        }

        console.log("Sending to API:", { usersid: userId, itemsid: itemId, quantity: 1 });

        fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ usersid: userId, itemsid: itemId, quantity: 1 }).toString()
        })
            .then(response => response.json())
            .then(data => {
                console.log("🛒 Add to Cart Response:", data);
                if (data.success) {
                    Swal.fire({
                        title: "✅ تمت الإضافة!",
                        text: "تمت إضافة المنتج إلى السلة بنجاح. سيتم نقلك للسلة...",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "cart.html";
                    });
                    updateCartCount();
                } else {
                    Swal.fire("❌ خطأ", data.message || "فشل إضافة المنتج إلى السلة.", "error");
                }
            })
            .catch(error => {
                console.error("❌ Error adding to cart:", error);
                Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى السلة.", "error");
            });
    }

    // دالة تحديث عدد العناصر في السلة عبر الـ API
    function updateCartCount() {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        fetch("https://abdulrahmanantar.com/outbye/cart/view.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ usersid: userId }).toString()
        })
            .then(response => response.json())
            .then(data => {
                console.log("Cart Count Response:", data);
                if (data.status === "success") {
                    document.querySelector(".cart-count").textContent = data.countprice.totalcount || 0;
                }
            })
            .catch(error => console.error("Error updating cart count:", error));
    }

    // دالة تحديث الـ Navbar
    function updateNavbar() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const signupBtn = document.getElementById('signupBtn');
        const signinBtn = document.getElementById('signinBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (isLoggedIn === 'true') {
            signupBtn.style.display = 'none';
            signinBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            updateCartCount();
        } else {
            signupBtn.style.display = 'block';
            signinBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            document.querySelector(".cart-count").textContent = "0";
        }
    }

    // استدعاء الدوال الأساسية
    addEventListeners();
    updateNavbar();
    changeSlide(0);
});

// حدث تسجيل الخروج
document.getElementById('logoutBtn')?.addEventListener('click', function () {
    localStorage.clear();
    updateNavbar();
    window.location.href = 'signin.html';
});