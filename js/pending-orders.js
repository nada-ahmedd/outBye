// js/pending-orders.js
const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ENDPOINTS = {
    PENDING_ORDERS: `${API_BASE_URL}orders/pending.php`
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
        background: '#fff',
        color: '#333',
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

async function loadPendingOrders() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        showAlert("error", "Error", "User ID not found, please log in again!", "Login").then(() => window.location.href = "signin.html");
        return;
    }

    const formData = new URLSearchParams({
        userid: userId
    });

    try {
        const response = await fetchWithToken(ENDPOINTS.PENDING_ORDERS, {
            method: "POST",
            body: formData
        });

        console.log("Pending Orders Response:", response);

        const ordersList = document.getElementById("orders-list");
        const noOrdersMessage = document.getElementById("noOrdersMessage");

        if (response.status === "success" && response.data && response.data.length > 0) {
            noOrdersMessage.style.display = "none";
            ordersList.innerHTML = "";

            response.data.forEach(order => {
                const orderItem = document.createElement("div");
                orderItem.className = "order-card";
                orderItem.innerHTML = `
                    <div class="order-info">
                        <p><strong>Order ID:</strong> ${order.orders_id}</p>
                        <p><strong>Total Price:</strong> ${order.orders_totalprice} EGP</p>
                        <p><strong>Order Date:</strong> ${order.orders_datetime}</p>
                        <p><strong>Status:</strong> ${order.orders_status === "0" ? "Processing" : "Completed"}</p>
                    </div>
                    <div class="order-actions">
                        <button class="btn">View Details</button>
                    </div>
                `;
                orderItem.querySelector(".btn").addEventListener("click", () => {
                    window.location.href = `order-details.html?orderId=${order.orders_id}`;
                });
                ordersList.appendChild(orderItem);
            });
        } else {
            noOrdersMessage.style.display = "block";
            ordersList.innerHTML = "";
        }
    } catch (error) {
        console.error("Error loading pending orders:", error);
        showAlert("error", "Error", error.message || "Failed to load pending orders!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        showAlert("warning", "Not Logged In", "You need to log in first!", "Login").then(() => window.location.href = "signin.html");
        return;
    }

    loadPendingOrders();
});