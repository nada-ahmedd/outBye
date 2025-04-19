const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ENDPOINTS = {
    CHECKOUT: `${API_BASE_URL}orders/checkout.php`,
    VIEW_ADDRESSES: `${API_BASE_URL}address/view.php`
};

function isLoggedIn() {
    return !!localStorage.getItem("userId");
}

function showAlert(icon, title, text, confirmText = "OK") { // تغيير النص الافتراضي للزر
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonText: confirmText
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

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        options.signal = controller.signal;

        console.log("Sending request to:", url);
        const response = await fetch(url, options);
        clearTimeout(timeoutId);

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
            console.log("Parsed Response:", data);
            return data;
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
            return { status: "success", data: { order_id: "default-order-id" } };
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds');
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to the server.');
        }
        throw error;
    }
}

async function loadAddressesFromBackend() {
    const userId = localStorage.getItem("userId");
    const addressSelect = document.getElementById("address");
    addressSelect.innerHTML = '<option value="">Select an address</option>';

    try {
        const data = await fetchWithToken(ENDPOINTS.VIEW_ADDRESSES, {
            method: "POST",
            body: new URLSearchParams({ usersid: userId }).toString()
        });

        console.log("Addresses Response:", data);

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            const addresses = data.data;
            addresses.forEach(address => {
                const fullAddress = `${address.address_name}, ${address.address_city}, ${address.address_street}, ${address.address_phone}`;
                addressSelect.innerHTML += `<option value="${address.address_id}">${fullAddress}</option>`;
            });
            localStorage.setItem("userAddresses", JSON.stringify(addresses));
        } else {
            addressSelect.innerHTML += '<option value="">No addresses available</option>'; // تغيير النص للإنجليزية
            localStorage.setItem("userAddresses", JSON.stringify([]));
        }
    } catch (error) {
        console.error("Error fetching addresses:", error);
        addressSelect.innerHTML += '<option value="">Error loading addresses</option>'; // تغيير النص للإنجليزية
        localStorage.setItem("userAddresses", JSON.stringify([]));
    }
}

function saveCheckoutData(totalPrice, coupon, discount) {
    const checkoutData = {
        totalPrice: totalPrice || "0",
        coupon: coupon || "N/A",
        discount: discount || "0"
    };
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    console.log("Checkout Data Saved to localStorage:", checkoutData);
}

function loadCheckoutData() {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData") || "{}");
    console.log("Checkout Data Loaded from localStorage:", checkoutData);

    if (!checkoutData.totalPrice && !checkoutData.coupon && !checkoutData.discount) {
        showAlert("warning", "Missing Order Data", "Order data not found. Please return to the cart page and try again.").then(() => window.location.href = "cart.html");
        return false;
    }

    document.getElementById("price").value = checkoutData.totalPrice || "0";
    document.getElementById("coupon-discount").value = checkoutData.discount || "0";
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        showAlert("warning", "Not Logged In", "You must log in first to complete the order!", "Log In").then(() => window.location.href = "signin.html");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const totalPrice = urlParams.get("totalPrice");
    const coupon = urlParams.get("coupon");
    const discount = urlParams.get("discount");

    if (totalPrice || coupon || discount) {
        saveCheckoutData(totalPrice, coupon, discount);
    }

    const dataLoaded = loadCheckoutData();
    if (!dataLoaded) return;

    loadAddressesFromBackend();

    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            showAlert("error", "Error", "User ID not found. Please log in again!", "Log In").then(() => window.location.href = "signin.html");
            return;
        }

        const price = document.getElementById("price").value;
        const paymentmethod = document.getElementById("payment-method").value;
        const couponDiscount = document.getElementById("coupon-discount").value;
        const addressId = document.getElementById("address").value;

        if (!addressId || addressId === "0" || addressId === "") {
            showAlert("error", "Error", "Please select a valid address!");
            return;
        }

        if (addressId.length > 10 || isNaN(addressId)) {
            showAlert("error", "Error", "Invalid address ID! Please select another address.");
            return;
        }

        const maxDiscount = 50;
        if (parseFloat(couponDiscount) > maxDiscount) {
            showAlert("error", "Error", `Discount percentage cannot exceed ${maxDiscount}%!`);
            return;
        }

        const minOrderPrice = 20;
        if (parseFloat(price) < minOrderPrice) {
            showAlert("error", "Error", `Total price must be at least ${minOrderPrice} EGP!`);
            return;
        }

        const formData = new URLSearchParams({
            usersid: userId,
            addressid: addressId,
            pricedelivery: "10",
            ordersprice: price,
            couponid: coupon && !isNaN(coupon) ? coupon : "0",
            paymentmethod: paymentmethod,
            coupondiscount: couponDiscount || "0"
        });

        console.log("Form Data being sent:", formData.toString());

        try {
            const data = await fetchWithToken(ENDPOINTS.CHECKOUT, {
                method: "POST",
                body: formData
            });

            console.log("Parsed Checkout API Response:", data);

            localStorage.removeItem("checkoutData");
            localStorage.removeItem("cartItems");
            localStorage.removeItem("couponDiscount");
            localStorage.removeItem("couponId");

            await showAlert("success", "Order Successful", "Your order has been placed successfully!", "View Pending Orders");
            window.location.href = "pending-orders.html";
        } catch (error) {
            console.error("Error during checkout:", error);
            showAlert("error", "Error", error.message || "An error occurred while completing the order. Please try again later.");
        }
    });
});