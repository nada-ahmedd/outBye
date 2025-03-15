const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ENDPOINTS = {
  VIEW: `${API_BASE_URL}cart/view.php`,
  ADD: `${API_BASE_URL}cart/add.php`,
  DELETE: `${API_BASE_URL}cart/delet.php`,
  COUPON: `${API_BASE_URL}coupon/checkcoupon.php`
};
const MESSAGES = {
  ACCESS_DENIED: "يجب تسجيل الدخول أولاً لعرض السلة أو إضافة منتجات!",
  CART_EMPTY: "🛒 السلة فارغة حالياً.",
  ERROR_FETCH: "⚠️ خطأ في جلب البيانات."
};

let appliedCouponDiscount = 0; // هنا بيحتفظ بالنسبة المئوية الديناميكية

function isLoggedIn() {
  return !!localStorage.getItem("userId");
}

function showAlert({ icon, title, text, confirmText, cancelText, onConfirm }) {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: confirmText || "موافق",
    showCancelButton: !!cancelText,
    cancelButtonText: cancelText || "إلغاء"
  }).then((result) => {
    if (result.isConfirmed && onConfirm) onConfirm();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  if (isLoggedIn()) {
    loadCart();
  } else {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const totalPrice = document.getElementById("total-price");
    if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>🚫 يجب تسجيل الدخول لعرض السلة.</td></tr>`;
    if (cartCount) cartCount.textContent = "0";
    if (totalPrice) totalPrice.textContent = "0 EGP";
  }

  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.addEventListener("click", (event) => {
      event.preventDefault();
      if (!isLoggedIn()) {
        showAlert({
          icon: "warning",
          title: "غير مسجل الدخول",
          text: MESSAGES.ACCESS_DENIED,
          confirmText: "تسجيل الدخول",
          cancelText: "إلغاء",
          onConfirm: () => window.location.href = "signin.html"
        });
      } else {
        loadCart();
      }
    });
  }

  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener("click", applyCoupon);
  }

  const updateCartBtn = document.querySelector(".cart-actions .btn-secondary");
  if (updateCartBtn) {
    updateCartBtn.addEventListener("click", () => {
      loadCart();
    });
  }
});

async function loadCart() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {
    const response = await fetch(ENDPOINTS.VIEW, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId }).toString()
    });
    const data = await response.json();
    console.log("Cart API Response:", data);

    if (data.status === "success" && Array.isArray(data.datacart) && data.datacart.length > 0) {
      updateCartUI(data);
      addCartEventListeners();
      updateCartTotals();
    } else {
      showEmptyCartMessage();
    }
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    const cartItems = document.getElementById("cart-items");
    if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>${MESSAGES.ERROR_FETCH}</td></tr>`;
  }
}

function updateCartUI(data) {
  const totalPrice = document.getElementById("total-price");
  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");

  if (!totalPrice || !cartCount || !cartItems) {
    console.error("❌ One or more cart UI elements not found:", {
      totalPrice: totalPrice,
      cartCount: cartCount,
      cartItems: cartItems
    });
    return;
  }

  cartCount.textContent = data.countprice.totalcount || '0';

  cartItems.innerHTML = data.datacart.map(item => {
    const originalPrice = parseFloat(item.items_price) || 0;
    const discount = parseFloat(item.items_discount) || 0;
    const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount / 100)) : originalPrice;
    const quantity = parseInt(item.cart_quantity) || 0;
    const totalPriceAfterDiscount = discountedPrice * quantity;

    console.log("Item:", item.items_name, "Original Price:", originalPrice, "Discount (%):", discount, "Discounted Price:", discountedPrice);

    return `
      <tr id="cart-item-${item.cart_itemsid}" data-price="${originalPrice}" data-discount="${discount}">
        <td><img src="${item.items_image}" alt="${item.items_name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
        <td>${item.items_name}</td>
        <td>
          ${discount > 0 ? `
            <span class="original-price text-muted text-decoration-line-through me-2">${originalPrice} EGP</span>
            <span class="discounted-price text-success">${discountedPrice.toFixed(2)} EGP</span>
          ` : `
            <span>${originalPrice} EGP</span>
          `}
        </td>
        <td class="d-flex align-items-center gap-2">
          <button class="btn btn-danger btn-sm decrease-item-btn" data-itemid="${item.cart_itemsid}">
            <i class="fas fa-minus"></i>
          </button>
          <span id="quantity-${item.cart_itemsid}" class="fs-5 fw-bold">${item.cart_quantity || '0'}</span>
          <button class="btn btn-success btn-sm increase-item-btn" data-itemid="${item.cart_itemsid}">
            <i class="fas fa-plus"></i>
          </button>
        </td>
        <td id="total-${item.cart_itemsid}">${totalPriceAfterDiscount.toFixed(2)} EGP</td>
      </tr>
    `;
  }).join("");
}

function showEmptyCartMessage() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPrice = document.getElementById("total-price");

  if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>${MESSAGES.CART_EMPTY}</td></tr>`;
  if (cartCount) cartCount.textContent = "0";
  if (totalPrice) totalPrice.textContent = "0 EGP";
}

function addCartEventListeners() {
  document.querySelectorAll(".decrease-item-btn").forEach(button => {
    button.removeEventListener("click", handleDecrease);
    button.addEventListener("click", handleDecrease);
  });

  document.querySelectorAll(".increase-item-btn").forEach(button => {
    button.removeEventListener("click", handleIncrease);
    button.addEventListener("click", handleIncrease);
  });
}

async function handleDecrease(event) {
  const itemId = event.target.closest("button").getAttribute("data-itemid");
  await decreaseItemQuantity(localStorage.getItem("userId"), itemId);
}

async function handleIncrease(event) {
  const itemId = event.target.closest("button").getAttribute("data-itemid");
  await increaseItemQuantity(localStorage.getItem("userId"), itemId);
}

async function decreaseItemQuantity(userId, itemId) {
  try {
    const response = await fetch(ENDPOINTS.DELETE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    });
    const data = await response.json();
    if (data.success) {
      updateCartItemLocally(itemId, "decrease");
    } else {
      showAlert({ icon: "error", title: "خطأ", text: data.message || "لم يتمكن النظام من تقليل الكمية!" });
      await loadCart();
    }
  } catch (error) {
    console.error("❌ Error decreasing item:", error);
    await loadCart();
  }
}

async function increaseItemQuantity(userId, itemId) {
  try {
    const response = await fetch(ENDPOINTS.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    });
    const data = await response.json();
    if (data.success) {
      updateCartItemLocally(itemId, "increase");
    } else {
      showAlert({ icon: "error", title: "خطأ", text: data.message || "لم يتمكن النظام من زيادة الكمية!" });
      await loadCart();
    }
  } catch (error) {
    console.error("❌ Error increasing item:", error);
    await loadCart();
  }
}

function updateCartItemLocally(itemId, action) {
  const row = document.getElementById(`cart-item-${itemId}`);
  if (!row) return;

  const quantityElement = row.querySelector(`#quantity-${itemId}`);
  const totalElement = row.querySelector(`#total-${itemId}`);
  const originalPrice = parseFloat(row.dataset.price) || 0;
  const discount = parseFloat(row.dataset.discount) || 0;
  const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount / 100)) : originalPrice;
  let quantity = parseInt(quantityElement.textContent) || 0;

  if (action === "increase") {
    quantity += 1;
  } else if (action === "decrease") {
    quantity -= 1;
  }

  if (quantity <= 0) {
    row.remove();
  } else {
    quantityElement.textContent = quantity;
    totalElement.textContent = `${(discountedPrice * quantity).toFixed(2)} EGP`;
  }

  updateCartTotals();
}

function updateCartTotals() {
  const cartItems = document.querySelectorAll("#cart-items tr");
  const totalPriceElement = document.getElementById("total-price");
  const cartCountElement = document.getElementById("cart-count");

  if (!totalPriceElement || !cartCountElement) {
    console.error("❌ Total price or cart count element not found:", {
      totalPriceElement: totalPriceElement,
      cartCountElement: cartCountElement
    });
    return;
  }

  let totalPrice = 0;
  let totalCount = 0;

  cartItems.forEach(row => {
    const quantityElement = row.querySelector(".fs-5.fw-bold");
    const totalElement = row.querySelector(`td:last-child`);
    const quantity = parseInt(quantityElement ? quantityElement.textContent : "0") || 0;
    const total = parseFloat(totalElement ? totalElement.textContent.replace(" EGP", "").trim() : "0") || 0;

    totalPrice += total;
    totalCount += quantity;
  });

  // حساب الخصم بناءً على النسبة المئوية الديناميكية من الـ API
  const calculatedCouponDiscount = (totalPrice * appliedCouponDiscount) / 100;
  const finalPrice = totalPrice - calculatedCouponDiscount > 0 ? totalPrice - calculatedCouponDiscount : 0;

  totalPriceElement.textContent = `${finalPrice.toFixed(2)} EGP`;
  cartCountElement.textContent = totalCount;

  if (cartItems.length === 0) {
    showEmptyCartMessage();
  }
}

async function applyCoupon() {
  const couponInput = document.getElementById("coupon-input").value.trim();
  if (!couponInput) {
    showAlert({ icon: "warning", title: "خطأ", text: "يرجى إدخال كود الخصم!" });
    return;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    showAlert({ icon: "error", title: "خطأ", text: "يجب تسجيل الدخول أولاً!" });
    return;
  }

  try {
    const response = await fetch(ENDPOINTS.COUPON, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ couponname: couponInput, usersid: userId }).toString()
    });
    const data = await response.json();
    console.log("Coupon API Response:", data); // للتحقق من الـ Response

    if (data.status === "success" && data.data) {
      const discountPercentage = parseFloat(data.data.coupon_discount) || 0; // النسبة المئوية (مثل 50)
      const expireDate = new Date(data.data.coupon_expiredate);
      const now = new Date();
      const remainingCount = parseInt(data.data.coupon_count) || 0;

      if (expireDate < now) {
        showAlert({ icon: "error", title: "خطأ", text: "كود الخصم منتهي الصلاحية!" });
        appliedCouponDiscount = 0;
      } else if (remainingCount <= 0) {
        showAlert({ icon: "error", title: "خطأ", text: "كود الخصم مستخدم بالكامل!" });
        appliedCouponDiscount = 0;
      } else {
        appliedCouponDiscount = discountPercentage; // احتفظ بالنسبة المئوية الديناميكية
        showAlert({
          icon: "success",
          title: "نجاح",
          text: `تم تطبيق كود الخصم "${data.data.coupon_name}" بنسبة ${discountPercentage}%! باقي ${remainingCount} استخدامات حتى ${data.data.coupon_expiredate}`
        });
      }
    } else {
      appliedCouponDiscount = 0;
      showAlert({ icon: "error", title: "كود غير صالح", text: data.message || "الكوبون غير متاح أو منتهي!" });
    }

    updateCartTotals();
  } catch (error) {
    console.error("Fetch Error:", error);
    appliedCouponDiscount = 0;
    showAlert({ icon: "error", title: "خطأ", text: "حدث خطأ أثناء فحص كود الخصم!" });
    updateCartTotals();
  }
}

function logout() {
  localStorage.clear();
  window.location.reload();
  window.location.href = "login.html";
}

function updateNavbar() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const signupBtn = document.getElementById('signupBtn');
  const signinBtn = document.getElementById('signinBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (isLoggedIn === 'true') {
    signupBtn.style.display = 'none';
    signinBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    signupBtn.style.display = 'block';
    signinBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    document.querySelector(".cart-count").textContent = "0";
  }
}