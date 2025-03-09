document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("service_id");
    const itemId = urlParams.get("id");
    const userId = urlParams.get("userId");

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
        return;
    }
    let apiUrl = "https://abdulrahmanantar.com/outbye/items/items.php";
    if (serviceId) {
        apiUrl += `?id=${serviceId}`;
    }

    fetch(apiUrl, { method: "POST" })
    .then(response => response.json())
    .then(data => {
        console.log("✅ API Response:", data);
        const itemsContainer = document.getElementById("items-container");
        const serviceContainer = document.getElementById("service-details");

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
          const service = data.data[0];
            displayServiceDetails(service);
            itemsContainer.innerHTML = data.data.map(item => {
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

                        <!-- زر الإضافة إلى السلة -->
                        <button class="addItem-to-cart" data-itemid="${item.items_id}">
                            Add to Cart
                        </button>

                        <!-- زر الإضافة إلى المفضلة -->
                        <button class="favorite-btn" data-itemid="${item.items_id}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                `;
            }).join("");

            // ✅ إضافة Event Listener بعد تحميل العناصر
            addEventListeners();
        } else {
            itemsContainer.innerHTML = "<p>🚫 No items found.</p>";
        }
    })
  
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
                // إذا اختار المستخدم تسجيل الدخول
                window.location.href = "signup.html";  // توجهه لصفحة تسجيل الدخول
            } else if (result.isDismissed) {
                // إذا اختار المستخدم استمرار التصفح
                console.log("استمرار التصفح");
            }
        });
        return;
    }

    // هنا باقي الكود لإضافة المنتج إلى السلة



    fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId, quantity: 1 }).toString()
    })
    .then(response => response.json())
    .then(data => {
        console.log("🛒 Add to Cart Response:", data);
        if (data.success) {
            Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى السلة بنجاح.", "success");
            loadCart(); // ✅ تحديث السلة مباشرة بعد الإضافة
        } else {
            Swal.fire("❌ خطأ", data.message, "error");
        }
    })
    .catch(error => {
        console.error("❌ Error adding to cart:", error);
        Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى السلة.", "error");
    });
}

function addEventListeners() {
    document.querySelectorAll(".addItem-to-cart").forEach(button => {
        button.addEventListener("click", (event) => {
            const itemId = event.target.getAttribute("data-itemid");
            if (itemId) addToCart(itemId);
        });
    });
}
function addToFavorites(itemId, button) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        Swal.fire("⚠️ خطأ", "يجب تسجيل الدخول أولًا لإضافة المنتجات إلى المفضلة.", "warning");
        return;
    }document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("service_id");
    const itemId = urlParams.get("id");
    const userId = urlParams.get("userId");

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

    let apiUrl = "https://abdulrahmanantar.com/outbye/items/items.php";
    if (serviceId) {
        apiUrl += `?id=${serviceId}`;
    }

    fetch(apiUrl, { method: "POST" })
    .then(response => response.json())
    .then(data => {
        console.log("✅ API Response:", data);
        const itemsContainer = document.getElementById("items-container");

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            const service = data.data[0]; // ✅ استخراج بيانات الخدمة من أول عنصر
            displayServiceDetails(service); // ✅ عرض بيانات الخدمة

            itemsContainer.innerHTML = data.data.map(item => {
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

                        <button class="addItem-to-cart" data-itemid="${item.items_id}">Add to Cart</button>
                        <button class="favorite-btn" data-itemid="${item.items_id}">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                `;
            }).join("");

            addEventListeners();
        } else {
            document.getElementById("service-details").innerHTML = "<p>🚫 Service not found.</p>";
            itemsContainer.innerHTML = "<p>🚫 No items found.</p>";
        }
    })
    .catch(error => {
        console.error("❌ Error fetching items:", error);
        document.getElementById("service-details").innerHTML = "<p>🚫 Error loading service details.</p>";
        document.getElementById("items-container").innerHTML = "<p>🚫 Error loading items.</p>";
    });
});

function displayServiceDetails(service) {
    const serviceContainer = document.getElementById("service-details");
    serviceContainer.innerHTML = `
        <div class="service-card">
            <img src="${service.service_image}" alt="${service.service_name}">
            <h2>${service.service_name}</h2>
            <p>${service.service_description}</p>
        </div>
    `;
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

    fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId, quantity: 1 }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى السلة بنجاح.", "success");
            loadCart();
        } else {
            Swal.fire("❌ خطأ", data.message, "error");
        }
    })
    .catch(error => {
        console.error("❌ Error adding to cart:", error);
        Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى السلة.", "error");
    });
}

function addToFavorites(itemId, button) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        Swal.fire("⚠️ خطأ", "يجب تسجيل الدخول أولًا لإضافة المنتجات إلى المفضلة.", "warning");
        return;
    }

    fetch("https://abdulrahmanantar.com/outbye/favorite/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى المفضلة.", "success");
            updateFavoriteUI(itemId, true);
        } else if (data.status === "fail") {
            Swal.fire("⚠️ موجود بالفعل", "هذا المنتج موجود بالفعل في المفضلة.", "info");
        } else {
            Swal.fire("❌ خطأ", data.message, "error");
        }
    })
    .catch(error => {
        console.error("❌ Error adding to favorites:", error);
        Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى المفضلة.", "error");
    });
}

function updateFavoriteUI(itemId, isFavorited) {
    const button = document.querySelector(`.favorite-btn[data-itemid="${itemId}"]`);
    if (button) {
        const icon = button.querySelector("i");
        if (isFavorited) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "#F26B0A";
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
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

            if (!itemId) {
                console.error("❌ Error: `data-itemid` is missing!");
                return;
            }

            addToFavorites(itemId, buttonElement);
        });
    });
}


    fetch("https://abdulrahmanantar.com/outbye/favorite/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى المفضلة.", "success");
            updateFavoriteUI(itemId, true);
        } else if (data.status === "fail") {
            Swal.fire("⚠️ موجود بالفعل", "هذا المنتج موجود بالفعل في المفضلة.", "info");
        } else {
            Swal.fire("❌ خطأ", data.message, "error");
        }
    })
    .catch(error => {
        console.error("❌ Error adding to favorites:", error);
        Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى المفضلة.", "error");
    });
}
function updateFavoriteUI(itemId, isFavorited) {
    const button = document.querySelector(`.favorite-btn[data-itemid="${itemId}"]`);
    if (button) {
        const icon = button.querySelector("i");
        if (isFavorited) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");
            icon.style.color = "#F26B0A"; // اللون عند الإضافة
        } else {
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = ""; // يعود لحالته الافتراضية
        }
    }
}
document.querySelectorAll(".favorite-btn").forEach(button => {
    button.addEventListener("click", (event) => {
        const buttonElement = event.currentTarget;
        const itemId = buttonElement.getAttribute("data-itemid");

        if (!itemId) {
            console.error("❌ Error: `data-itemid` is missing!");
            return;
        }

        addToFavorites(itemId, buttonElement);
    });
});
