const API_BASE_URL = "https://abdulrahmanantar.com/outbye/cart/";
const ENDPOINTS = {
  VIEW: `${API_BASE_URL}view.php`,
  ADD: `${API_BASE_URL}add.php`,
  DELETE: `${API_BASE_URL}delet.php`
};
const MESSAGES = {
  ACCESS_DENIED: "يجب تسجيل الدخول أولاً لعرض السلة أو إضافة منتجات!",
  CART_EMPTY: "🛒 السلة فارغة حالياً.",
  ERROR_FETCH: "⚠️ خطأ في جلب البيانات."
};

// دالة مساعدة للتحقق من تسجيل الدخول
function isLoggedIn() {
  return !!localStorage.getItem("userId");
}

// دالة لعرض التنبيهات باستخدام Swal
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

// تحميل الصفحة
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
});

// دالة تحميل السلة
async function loadCart() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const scrollPosition = window.scrollY;

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
    } else {
      showEmptyCartMessage();
    }

    window.scrollTo(0, scrollPosition);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    const cartItems = document.getElementById("cart-items");
    if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>${MESSAGES.ERROR_FETCH}</td></tr>`;
    window.scrollTo(0, scrollPosition);
  }
}

// تحديث واجهة السلة
function updateCartUI(data) {
  const totalPrice = document.getElementById("total-price");
  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");

  // التحقق من وجود العناصر
  if (!totalPrice || !cartCount || !cartItems) {
    console.error("❌ One or more cart UI elements not found:", {
      totalPrice: totalPrice,
      cartCount: cartCount,
      cartItems: cartItems
    });
    return;
  }

  // تحديث السعر والعدد
  totalPrice.textContent = `${data.countprice.totalprice || '0'} EGP`;
  cartCount.textContent = data.countprice.totalcount || '0';

  // تحديث العناصر
  cartItems.innerHTML = data.datacart.map(item => `
    <tr id="cart-item-${item.cart_itemsid}">
      <td><img src="${item.items_image}" alt="${item.items_name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
      <td>${item.items_name}</td>
      <td>${item.items_price || '0'} EGP</td>
      <td class="d-flex align-items-center gap-2">
        <button class="btn btn-danger btn-sm decrease-item-btn" data-itemid="${item.cart_itemsid}">
          <i class="fas fa-minus"></i>
        </button>
        <span id="quantity-${item.cart_itemsid}" class="fs-5 fw-bold">${item.cart_quantity || '0'}</span>
        <button class="btn btn-success btn-sm increase-item-btn" data-itemid="${item.cart_itemsid}">
          <i class="fas fa-plus"></i>
        </button>
      </td>
      <td id="total-${item.cart_itemsid}">${item.total_price || '0'} EGP</td>
    </tr>
  `).join("");
}

// رسالة السلة الفارغة
function showEmptyCartMessage() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const totalPrice = document.getElementById("total-price");

  if (cartItems) cartItems.innerHTML = `<tr><td colspan='5'>${MESSAGES.CART_EMPTY}</td></tr>`;
  if (cartCount) cartCount.textContent = "0";
  if (totalPrice) totalPrice.textContent = "0 EGP";
}

// إضافة Event Listeners للأزرار
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

// دوال مساعدة للتعامل مع الأحداث
async function handleDecrease(event) {
  const itemId = event.target.closest("button").getAttribute("data-itemid");
  console.log("Decrease clicked for item:", itemId);
  await decreaseItemQuantity(localStorage.getItem("userId"), itemId);
}

async function handleIncrease(event) {
  const itemId = event.target.closest("button").getAttribute("data-itemid");
  console.log("Increase clicked for item:", itemId);
  await increaseItemQuantity(localStorage.getItem("userId"), itemId);
}

// تقليل الكمية
async function decreaseItemQuantity(userId, itemId) {
  showAlert({
    icon: "warning",
    title: "هل تريد تقليل الكمية؟",
    text: "إذا وصلت الكمية إلى 1، سيتم حذف المنتج.",
    confirmText: "نعم، قلل الكمية!",
    cancelText: "إلغاء",
    onConfirm: async () => {
      try {
        const response = await fetch(ENDPOINTS.DELETE, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
        });
        const data = await response.json();
        console.log("Decrease API response:", data);
        if (data.success) {
          await loadCart();
        } else {
          showAlert({ icon: "error", title: "خطأ", text: data.message || "لم يتمكن النظام من تقليل الكمية!" });
        }
      } catch (error) {
        console.error("❌ Error decreasing item:", error);
      }
    }
  });
}

// زيادة الكمية
async function increaseItemQuantity(userId, itemId) {
  try {
    const response = await fetch(ENDPOINTS.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    });
    const data = await response.json();
    console.log("Increase API response:", data);
    if (data.success) {
      await loadCart();
    } else {
      showAlert({ icon: "error", title: "خطأ", text: data.message || "لم يتمكن النظام من زيادة الكمية!" });
    }
  } catch (error) {
    console.error("❌ Error increasing item:", error);
  }
}

// تسجيل الخروج
function logout() {
  localStorage.clear();
  window.location.reload();
  window.location.href = "login.html";
}

// تحديث الناف بار
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

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  if (isLoggedIn()) {
    loadCart();
  }
});