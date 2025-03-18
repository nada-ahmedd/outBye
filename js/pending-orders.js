// js/pending-orders.js
const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";

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
  if (!isLoggedIn()) {
    showAlert({
      icon: "warning",
      title: "غير مسجل الدخول",
      text: "يجب تسجيل الدخول لعرض الطلبات!",
      confirmText: "تسجيل الدخول",
      onConfirm: () => window.location.href = "signin.html"
    });
    return;
  }

  const userId = localStorage.getItem("userId");
  console.log("Sending userId:", userId);

  fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(API_BASE_URL + 'orders/pending.php')}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json"
  },
  body: new URLSearchParams({ usersid: userId }).toString()
})
  .then(response => {
    console.log("Raw Response Status:", response.status);
    console.log("Raw Response Headers:", response.headers);
    return response.text().then(text => {
      try {
        return JSON.parse(text); // نحاول نحلل الـ Response كـ JSON
      } catch (e) {
        throw new Error(`Invalid JSON Response: ${text}`); // لو مش JSON، نرمي خطأ مع النص
      }
    });
  })
  .then(data => {
    const ordersTableBody = document.querySelector("#orders-table tbody");
    if (!ordersTableBody) {
      console.error("orders-table tbody element not found!");
      return;
    }

    console.log("Pending Orders API Response:", data);

    if (data.status === "success" && data.data && data.data.length > 0) {
      let ordersHTML = "";
      data.data.forEach(order => {
        const address = order.address_name
          ? `${order.address_name}, ${order.address_city}, ${order.address_street}`
          : "غير محدد";
        const status = order.orders_status === "0" ? "Pending" : "Unknown";
        ordersHTML += `
          <tr>
            <td>${order.orders_id || "N/A"}</td>
            <td>${order.orders_totalprice || "0"} EGP</td>
            <td>${new Date(order.orders_datetime || Date.now()).toLocaleString()}</td>
            <td>${address}</td>
            <td>${status}</td>
          </tr>
        `;
      });
      ordersTableBody.innerHTML = ordersHTML;
    } else if (data.status === "failure") {
      ordersTableBody.innerHTML = `<tr><td colspan="5">فشل في جلب الطلبات: ${data.message || "لا توجد طلبات معلقة"}</td></tr>`;
    } else {
      ordersTableBody.innerHTML = `<tr><td colspan="5">لا توجد طلبات معلقة لهذا المستخدم.</td></tr>`;
    }
  })
  .catch(error => {
    console.error("Fetch Error:", error);
    const ordersTableBody = document.querySelector("#orders-table tbody");
    if (ordersTableBody) {
      ordersTableBody.innerHTML = `<tr><td colspan="5">خطأ في الاتصال بالخادم: ${error.message}</td></tr>`;
    }
  });
});