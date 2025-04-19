const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ENDPOINTS = {
  VIEW: `${API_BASE_URL}cart/view.php`,
  ADD: `${API_BASE_URL}cart/add.php`,
  DELETE: `${API_BASE_URL}cart/delet.php`,
  COUPON: `${API_BASE_URL}coupon/checkcoupon.php`
};
const MESSAGES = {
  ACCESS_DENIED: "Please log in first to view or add items to the cart!",
  CART_EMPTY: "🛒 Cart is empty.",
  ERROR_FETCH: "⚠️ Error fetching data."
};

let appliedCouponDiscount = 0;

function isLoggedIn() {
  return !!localStorage.getItem("userId");
}

function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem('token');
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  return fetch(url, options);
}

function showAlert({ icon, title, text, confirmText, cancelText, onConfirm }) {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: confirmText || "OK",
    showCancelButton: !!cancelText,
    cancelButtonText: cancelText || "Cancel"
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
    if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>🚫 Please log in to view the cart.</td></tr>`;
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
          title: "Not Logged In",
          text: MESSAGES.ACCESS_DENIED,
          confirmText: "Log In",
          cancelText: "Cancel",
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

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        showAlert({
          icon: "warning",
          title: "Not Logged In",
          text: MESSAGES.ACCESS_DENIED,
          confirmText: "Log In",
          cancelText: "Cancel",
          onConfirm: () => window.location.href = "signin.html"
        });
        return;
      }

      const totalPrice = document.getElementById("total-price").textContent.replace(" EGP", "").trim();
      const couponInput = document.getElementById("coupon-input").value.trim();
      const cartCount = document.getElementById("cart-count").textContent;

      if (parseInt(cartCount) === 0) {
        showAlert({
          icon: "warning",
          title: "Cart is Empty",
          text: "Please add items to the cart first!"
        });
        return;
      }

      window.location.href = `checkout.html?totalPrice=${totalPrice}&coupon=${couponInput}&discount=${appliedCouponDiscount}`;
    });
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
    const response = await fetchWithToken(ENDPOINTS.VIEW, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId }).toString()
    });
    const data = await response.json();
    console.log("Cart API Response:", data);

    if (data.status === "success") {
      updateCartUI(data);
      addCartEventListeners();
      updateCartTotals(data);
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
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPrice = document.getElementById("total-price");

  if (!cartItems || !cartCount || !totalPrice) {
    console.error("❌ One or more cart UI elements not found");
    return;
  }

  let cartHTML = "";
  let hasItems = false;

  // قسم Restaurants & Cafes
  if (data.rest_cafe.datacart.length > 0) {
    hasItems = true;
    cartHTML += `
      <tr class="section-divider">
        <td colspan="5" class="section-title">Restaurants & Cafes</td>
      </tr>
      ${data.rest_cafe.datacart.map(item => {
        const originalPrice = parseFloat(item.items_price) || 0;
        const discount = parseFloat(item.items_discount) || 0;
        const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount / 100)) : originalPrice;
        const quantity = parseInt(item.cart_quantity) || 0;
        const totalPriceAfterDiscount = discountedPrice * quantity;

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
      }).join("")}
    `;
  }

  // قسم Hotels & Tourist Places
  if (data.hotel_tourist.datacart.length > 0) {
    hasItems = true;
    cartHTML += `
      <tr class="section-divider">
        <td colspan="5" class="section-title">Hotels & Tourist Places</td>
      </tr>
      ${data.hotel_tourist.datacart.map(item => {
        const originalPrice = parseFloat(item.items_price) || 0;
        const discount = parseFloat(item.items_discount) || 0;
        const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount / 100)) : originalPrice;
        const quantity = parseInt(item.cart_quantity) || 0;
        const totalPriceAfterDiscount = discountedPrice * quantity;

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
      }).join("")}
    `;
  }

  // قسم Other Categories (Object بدل Array)
  if (data.other_categories && Object.keys(data.other_categories).length > 0) {
    Object.values(data.other_categories).forEach(category => {
      if (category.datacart && category.datacart.length > 0) {
        hasItems = true;
        cartHTML += `
          <tr class="section-divider">
            <td colspan="5" class="section-title">${category.cat_name || 'Other Categories'}</td>
          </tr>
          ${category.datacart.map(item => {
            const originalPrice = parseFloat(item.items_price) || 0;
            const discount = parseFloat(item.items_discount) || 0;
            const discountedPrice = discount > 0 ? (originalPrice - (originalPrice * discount / 100)) : originalPrice;
            const quantity = parseInt(item.cart_quantity) || 0;
            const totalPriceAfterDiscount = discountedPrice * quantity;

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
          }).join("")}
        `;
      }
    });
  }

  // لو مفيش أي عناصر في أي قسم، نعرض رسالة "Cart is empty"
  if (!hasItems) {
    cartHTML = `<tr><td colspan="5" class="empty-section">${MESSAGES.CART_EMPTY}</td></tr>`;
  }

  cartItems.innerHTML = cartHTML;

  // تحديث عدد العناصر الكلي
  const restCafeCount = parseInt(data.rest_cafe.countprice.totalcount) || 0;
  const hotelTouristCount = parseInt(data.hotel_tourist.countprice.totalcount) || 0;
  let otherCategoriesCount = 0;

  if (data.other_categories && Object.keys(data.other_categories).length > 0) {
    otherCategoriesCount = Object.values(data.other_categories).reduce((sum, category) => {
      return sum + (category.datacart ? category.datacart.reduce((acc, item) => acc + (parseInt(item.cart_quantity) || 0), 0) : 0);
    }, 0);
  }

  cartCount.textContent = restCafeCount + hotelTouristCount + otherCategoriesCount;
}

function showEmptyCartMessage() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPrice = document.getElementById("total-price");

  if (cartItems) {
    cartItems.innerHTML = `<tr><td colspan="5" class="empty-section">${MESSAGES.CART_EMPTY}</td></tr>`;
  }
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
    const response = await fetchWithToken(ENDPOINTS.DELETE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    });
    const data = await response.json();
    if (data.success) {
      updateCartItemLocally(itemId, "decrease");
    } else {
      showAlert({ icon: "error", title: "Error", text: data.message || "Unable to decrease quantity!" });
      await loadCart();
    }
  } catch (error) {
    console.error("❌ Error decreasing item:", error);
    await loadCart();
  }
}

async function increaseItemQuantity(userId, itemId) {
  try {
    const response = await fetchWithToken(ENDPOINTS.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    });
    const data = await response.json();
    if (data.success) {
      updateCartItemLocally(itemId, "increase");
    } else {
      showAlert({ icon: "error", title: "Error", text: data.message || "Unable to increase quantity!" });
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

function updateCartTotals(data) {
  const cartItems = document.querySelectorAll("#cart-items tr[id^='cart-item-']");
  const totalPriceElement = document.getElementById("total-price");
  const cartCountElement = document.getElementById("cart-count");

  if (!totalPriceElement || !cartCountElement) {
    console.error("❌ Total price or cart count element not found");
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
    showAlert({ icon: "warning", title: "Error", text: "Please enter a coupon code!" });
    return;
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    showAlert({ icon: "error", title: "Error", text: "Please log in first!" });
    return;
  }

  try {
    const response = await fetchWithToken(ENDPOINTS.COUPON, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ couponname: couponInput, usersid: userId }).toString()
    });
    const data = await response.json();
    console.log("Coupon API Response:", data);

    if (data.status === "success" && data.data) {
      const discountPercentage = parseFloat(data.data.coupon_discount) || 0;
      const expireDate = new Date(data.data.coupon_expiredate);
      const now = new Date();
      const remainingCount = parseInt(data.data.coupon_count) || 0;

      if (expireDate < now) {
        showAlert({ icon: "error", title: "Error", text: "Coupon code has expired!" });
        appliedCouponDiscount = 0;
      } else if (remainingCount <= 0) {
        showAlert({ icon: "error", title: "Error", text: "Coupon code has been fully used!" });
        appliedCouponDiscount = 0;
      } else {
        appliedCouponDiscount = discountPercentage;
        showAlert({
          icon: "success",
          title: "Success",
          text: `Coupon applied successfully! ${discountPercentage}% discount`
        });
      }
    } else {
      appliedCouponDiscount = 0;
      showAlert({ icon: "error", title: "Invalid Coupon", text: data.message || "Coupon is not available or has expired!" });
    }

    updateCartTotals();
  } catch (error) {
    console.error("Fetch Error:", error);
    appliedCouponDiscount = 0;
    showAlert({ icon: "error", title: "Error", text: "An error occurred while checking the coupon!" });
    updateCartTotals();
  }
}

function logout() {
  localStorage.clear();
  showAlert({
    icon: "success",
    title: "Logged Out",
    text: "You have been logged out successfully.",
    onConfirm: () => {
      window.location.href = "login.html";
    }
  });
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