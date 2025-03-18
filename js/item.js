document.addEventListener("DOMContentLoaded", () => {
    // دالة لإظهار الـ Loader
    function showLoader() {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.classList.remove("hidden");
        }
    }

    // دالة لإخفاء الـ Loader
    function hideLoader() {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.classList.add("hidden");
        }
    }

    // دالة مساعدة لإضافة الـ token
    function fetchWithToken(url, options = {}) {
        const token = localStorage.getItem('token');
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };
        return fetch(url, options);
    }

    // متغير لتتبع تحميل البيانات
    let dataLoaded = 0;
    const totalSections = 2; // Service Details + Items

    function checkAllDataLoaded() {
        dataLoaded++;
        if (dataLoaded === totalSections) {
            hideLoader();
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("service_id");
    const itemId = urlParams.get("id");
    const userId = localStorage.getItem("userId");

    console.log("Service ID:", serviceId);
    console.log("Current URL:", window.location.href);

    let returnUrl = "item.html";
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (serviceId) params.append("service_id", serviceId);
    if (itemId) params.append("id", itemId);

    if (params.toString()) {
        returnUrl += `?${params.toString()}`;
    }

    if (document.getElementById("returnToShop")) {
        document.getElementById("returnToShop").href = returnUrl;
    }

    if (!serviceId) {
        console.error("❌ No service ID found!");
        hideLoader(); // إخفاء الـ Loader لو الـ Service ID مش موجود
        return;
    }

    showLoader(); // إظهار الـ Loader من البداية
    let apiUrl = "https://abdulrahmanantar.com/outbye/items/items.php";
    if (serviceId) {
        apiUrl += `?id=${serviceId}&t=${new Date().getTime()}`;
    }
    console.log("Request URL:", apiUrl);

    // استخدام fetch عادي لأن هذا الـ API عام (لا يحتاج توكن)
    fetch(apiUrl, { method: "POST", cache: "no-cache" })
    .then(response => {
        console.log("Fetch Response Status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("✅ Raw API Response:", data);
        console.log("Data Details:", data.data);
        const itemsContainer = document.getElementById("items-container");
        const serviceContainer = document.getElementById("service-details");

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            const service = data.data[0];
            displayServiceDetails(service);
            checkAllDataLoaded(); // زيادة العداد بعد تحميل Service Details

            itemsContainer.innerHTML = '';

            // فلترة إضافية في الـ frontend للتأكد من service_id
            const items = data.data.filter(item => item && item.items_id && item.service_id === serviceId);
            console.log("Items to display:", items);

            if (items.length === 0) {
                itemsContainer.innerHTML = "<p>🚫 No items found for this service.</p>";
                checkAllDataLoaded(); // زيادة العداد لو مفيش Items
                return;
            }

            itemsContainer.innerHTML = items.map(item => {
                const price = item.items_price;
                const discount = item.items_discount;
                const discountedPrice = price - (price * discount / 100);
                const isHighlighted = itemId && item.items_id === itemId ? "highlight" : "";

                return `
                    <div class="item ${isHighlighted}" id="item-${item.items_id}">
                        <h3>${item.items_name}</h3>
                        <p>${item.items_des}</p>
                        <p class="price">
                            ${discount > 0 ? `<span class="old-price">${price} EGP</span>` : ''} 
                            ${discount > 0 ? `<span class="new-price">${discountedPrice} EGP</span>` : `<span class="regular-price">${price} EGP</span>`}
                        </p>
                        <p class="discount">${discount > 0 ? `Discount: ${discount}%` : ''}</p>
                        <img src="${item.items_image}" alt="${item.items_name}">
                        <button class="addItem-to-cart" data-itemid="${item.items_id}">
                            Add to Cart
                        </button>
                        <button class="favorite-btn" data-itemid="${item.items_id}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                `;
            }).join("");

            fetchFavorites(userId);
            addEventListeners();
            checkAllDataLoaded(); // زيادة العداد بعد تحميل الـ Items
        } else {
            itemsContainer.innerHTML = "<p>🚫 No items found.</p>";
            checkAllDataLoaded(); // زيادة العداد لو مفيش بيانات
        }
    })
    .catch(error => {
        console.error("❌ Error fetching items:", error);
        document.getElementById("items-container").innerHTML = "<p>⚠️ Error loading items.</p>";
        checkAllDataLoaded(); // زيادة العداد حتى لو فيه خطأ
    });
});

function displayServiceDetails(service) {
    const serviceContainer = document.getElementById("service-details");
    serviceContainer.innerHTML = `
        <div class="service-card">
            <div class="service-header">
                <img src="${service.service_image}" alt="${service.service_name}" class="service-img">
                <h2>${service.service_name}</h2>
            </div>
            <p>${service.service_description}</p>
            <p><i class="fas fa-map-marker-alt"></i> Location: ${service.service_location}</p>
            <p class="rating">⭐ Rating: ${service.service_rating}</p>
            <p><i class="fas fa-phone"></i> Phone: <a href="tel:${service.service_phone}">${service.service_phone}</a></p>
        </div>
    `;
}

function fetchFavorites(userId) {
    if (!userId) return;

    fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/view.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id: userId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        console.log("✅ Favorites Response:", data);
        if (data.status === "success" && Array.isArray(data.data)) {
            data.data.forEach(item => {
                updateFavoriteUI(item.favorite_itemsid, true, item.favorite_id);
            });
        }
    })
    .catch(error => console.error("❌ Error fetching favorites:", error));
}

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

    fetchWithToken("https://abdulrahmanantar.com/outbye/cart/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId, quantity: 1 }).toString()
    })
    .then(response => response.json())
    .then(data => {
        console.log("🛒 Add to Cart Response:", data);
        if (data.success) {
            Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى السلة بنجاح.", "success");
        } else {
            Swal.fire("❌ خطأ", data.message, "error");
        }
    })
    .catch(error => {
        console.error("❌ Error adding to cart:", error);
        Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى السلة.", "error");
    });
}

function toggleFavorite(itemId, button) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        Swal.fire("⚠️ خطأ", "يجب تسجيل الدخول أولًا لإضافة المنتجات إلى المفضلة.", "warning");
        return;
    }

    const icon = button.querySelector("i");
    const isFavorited = icon.classList.contains("fa-solid");

    if (!isFavorited) {
        console.log("Adding to favorites with usersid:", userId, "and itemsid:", itemId);
        fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/add.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
        })
        .then(response => {
            console.log("Raw Add Response:", response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            console.log("Add Response Text:", text);
            let data;
            try {
                data = text ? JSON.parse(text) : { status: "success" };
            } catch (e) {
                console.warn("⚠️ Response is not valid JSON, assuming success:", text);
                data = { status: "success" };
            }
            if (data.status === "success") {
                Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى المفضلة.", "success");
                updateFavoriteUI(itemId, true);
                fetchFavorites(userId);
            } else if (data.status === "fail") {
                Swal.fire("⚠️ موجود بالفعل", "هذا المنتج موجود بالفعل في المفضلة.", "info");
            } else {
                Swal.fire("❌ خطأ", data.message || "لم يتمكن السيرفر من إضافة المنتج.", "error");
            }
        })
        .catch(error => {
            console.error("❌ Error adding to favorites:", error);
            Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى المفضلة: " + error.message, "error");
        });
    } else {
        const favId = button.dataset.favid;
        if (!favId) {
            Swal.fire("❌ خطأ", "معرف المفضلة غير متاح، جاري إعادة التحميل.", "error");
            fetchFavorites(userId);
            return;
        }

        console.log("Removing from favorites with favorite_id:", favId);
        fetchWithToken("https://abdulrahmanantar.com/outbye/favorite/deletefromfavroite.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ id: favId }).toString()
        })
        .then(response => {
            console.log("Raw Delete Response:", response);
            return response.text();
        })
        .then(text => {
            console.log("Delete Response Text:", text);
            if (!text) {
                throw new Error("Empty response from server");
            }
            const data = JSON.parse(text);
            if (data.status === "success") {
                Swal.fire("✅ تمت الإزالة!", "تمت إزالة المنتج من المفضلة.", "success");
                updateFavoriteUI(itemId, false);
            } else {
                Swal.fire("❌ خطأ", data.message || "لم يتمكن السيرفر من حذف المنتج.", "error");
            }
        })
        .catch(error => {
            console.error("❌ Error deleting favorite:", error);
            Swal.fire("❌ خطأ", "حدث خطأ أثناء إزالة المنتج: " + error.message, "error");
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

function addEventListeners() {
    document.querySelectorAll(".addItem-to-cart").forEach(button => {
        button.addEventListener("click", (event) => {
            const itemId = event.target.getAttribute("data-itemid");
            if (itemId) addToCart(itemId);
        });
    });

    document.querySelectorAll(".favorite-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const buttonElement = event.currentTarget;
            const itemId = buttonElement.getAttribute("data-itemid");
            if (itemId) toggleFavorite(itemId, buttonElement);
        });
    });
}