// js/order-details.js
const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ENDPOINTS = {
    ORDER_DETAILS: `${API_BASE_URL}orders/details.php`,
    DELETE_ORDER: `${API_BASE_URL}orders/delete.php`
};

function isLoggedIn() {
    return !!localStorage.getItem("userId");
}

function showAlert(icon, title, text, confirmText = "OK") {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonText: confirmText,
        confirmButtonColor: '#F26B0A',
        background: '#1a1a1a',
        color: '#fff',
        iconColor: icon === 'success' ? '#28a745' : '#ff5e62',
    });
}

async function fetchWithToken(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found, redirecting to login');
            window.location.href = 'signin.html';
            throw new Error('No authentication token found. Please log in again.');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error! Status: ${response.status} - ${errorText}`);
            if (response.status === 401 || response.status === 403) {
                console.error('Unauthorized, clearing localStorage and redirecting');
                localStorage.clear();
                window.location.href = 'signin.html';
                throw new Error('Unauthorized: Please log in again.');
            }
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const text = await response.text();
        console.log("Raw Response:", text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            if (text.includes('SQLSTATE[42000]') || text.includes('Undefined array key')) {
                return { status: "failure", message: "Server error, please try again later." };
            }
            throw new Error(`Unexpected response format: ${text}`);
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to the server.');
        }
        throw error;
    }
}

async function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    if (!orderId) {
        showAlert("error", "Error", "Order ID not found!", "Back").then(() => window.location.href = "pending-orders.html");
        return;
    }

    const formData = new URLSearchParams({
        ordersid: orderId
    });

    try {
        const response = await fetchWithToken(ENDPOINTS.ORDER_DETAILS, {
            method: "POST",
            body: formData
        });

        console.log("Order Details Response:", response);

        const itemsList = document.getElementById("items-list");
        if (response.status === "success" && response.data && response.data.length > 0) {
            itemsList.innerHTML = "";
            response.data.forEach(item => {
                const itemElement = document.createElement("div");
                itemElement.className = "item";
                itemElement.innerHTML = `
                    <img src="${item.items_image || 'images/default-item.png'}" alt="${item.items_name}">
                    <div class="item-info">
                        <p><strong>Product Name:</strong> ${item.items_name}</p>
                        <p><strong>Price:</strong> ${item.items_price} EGP</p>
                        <p><strong>Quantity:</strong> ${item.cart_quantity}</p>
                        <p><strong>Description:</strong> ${item.items_des}</p>
                    </div>
                `;
                itemsList.appendChild(itemElement);
            });
        } else {
            itemsList.innerHTML = "<p class='no-items'>No items found in this order.</p>";
        }
    } catch (error) {
        console.error("Error loading order details:", error);
        showAlert("error", "Error", error.message || "Failed to load order details!");
    }
}

async function deleteOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    if (!orderId) {
        showAlert("error", "Error", "Order ID not found!", "Back").then(() => window.location.href = "pending-orders.html");
        return;
    }

    const formData = new URLSearchParams({
        ordersid: orderId
    });

    try {
        const response = await fetchWithToken(ENDPOINTS.DELETE_ORDER, {
            method: "POST",
            body: formData
        });

        if (response.status === "success") {
            showAlert("success", "Success", "Order deleted successfully!", "Back").then(() => window.location.href = "pending-orders.html");
        } else {
            showAlert("error", "Error", response.message || "Failed to delete the order!");
        }
    } catch (error) {
        console.error("Error deleting order:", error);
        showAlert("error", "Error", error.message || "Failed to delete the order!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        showAlert("warning", "Not Logged In", "You need to log in first!", "Login").then(() => window.location.href = "signin.html");
        return;
    }

    loadOrderDetails();

    const deleteButton = document.getElementById("deleteOrderBtn");
    deleteButton.addEventListener("click", deleteOrder);
});