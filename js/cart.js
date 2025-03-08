document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showEmptyCartMessage();
        return;
    }

    loadCart();
});

function loadCart() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        showEmptyCartMessage();
        return;
    }

    fetch("https://abdulrahmanantar.com/outbye/cart/view.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        console.log("Cart API Response:", data);

        if (data.status === "success" && Array.isArray(data.datacart) && data.datacart.length > 0) {
            document.getElementById("total-price").textContent = `${data.countprice.totalprice} EGP`;
            document.getElementById("cart-count").textContent = data.countprice.totalcount;

            const cartItemsContainer = document.getElementById("cart-items");
            cartItemsContainer.innerHTML = data.datacart.map(item => `
                <tr id="cart-item-${item.cart_itemsid}">
                    <td><img src="${item.items_image}" alt="${item.items_name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${item.items_name}</td>
                    <td>${item.items_price} EGP</td>
                    <td class="d-flex align-items-center gap-2">
                        <button class="btn btn-danger btn-sm decrease-item-btn" data-itemid="${item.cart_itemsid}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span id="quantity-${item.cart_itemsid}" class="fs-5 fw-bold">${item.cart_quantity}</span>
                        <button class="btn btn-success btn-sm increase-item-btn" data-itemid="${item.cart_itemsid}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </td>
                    <td id="total-${item.cart_itemsid}">${item.total_price} EGP</td>
                </tr>
            `).join("");

            addCartEventListeners();
        } else {
            showEmptyCartMessage();
        }
    })
    .catch(error => {
        console.error("❌ Error fetching cart:", error);
        document.getElementById("cart-items").innerHTML = "<tr><td colspan='6'>⚠️ خطأ في جلب البيانات.</td></tr>";
    });
}

function showEmptyCartMessage() {
    document.getElementById("cart-items").innerHTML = "<tr><td colspan='6'>🚫 لا توجد منتجات في السلة.</td></tr>";
    document.getElementById("cart-count").textContent = "0";
    document.getElementById("total-price").textContent = "0 EGP";
}

function addCartEventListeners() {
    document.querySelectorAll(".decrease-item-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const userId = localStorage.getItem("userId");
            const itemId = event.currentTarget.getAttribute("data-itemid");
            if (!userId || !itemId) return;
            decreaseItemQuantity(userId, itemId);
        });
    });

    document.querySelectorAll(".increase-item-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const userId = localStorage.getItem("userId");
            const itemId = event.currentTarget.getAttribute("data-itemid");
            if (!userId || !itemId) return;
            increaseItemQuantity(userId, itemId);
        });
    });
}

function decreaseItemQuantity(userId, itemId) {
    Swal.fire({
        title: "هل تريد تقليل الكمية؟",
        text: "إذا وصلت الكمية إلى 1، سيتم حذف المنتج.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، قلل الكمية!",
        cancelButtonText: "إلغاء"
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("https://abdulrahmanantar.com/outbye/cart/delet.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadCart();
                } else {
                    Swal.fire("خطأ", data.message || "لم يتمكن النظام من تقليل الكمية!", "error");
                }
            })
            .catch(error => console.error("❌ Error decreasing item:", error));
        }
    });
}

function increaseItemQuantity(userId, itemId) {
    fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCart();
        } else {
            Swal.fire("خطأ", data.message || "لم يتمكن النظام من زيادة الكمية!", "error");
        }
    })
    .catch(error => console.error("❌ Error increasing item:", error));
}
