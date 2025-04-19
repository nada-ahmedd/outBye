   const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
        const ENDPOINTS = {
            ARCHIVE_ORDERS: `${API_BASE_URL}orders/archive.php`
        };

        function isLoggedIn() {
            return !!localStorage.getItem("userId") && !!localStorage.getItem("token");
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

        async function loadArchiveOrders() {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                showAlert("error", "Error", "User ID not found, please log in again!", "Login")
                    .then(() => window.location.href = "signin.html");
                return;
            }

            const spinnerContainer = document.getElementById('spinner');
            const ordersContainer = document.getElementById('orders-container');
            spinnerContainer.classList.remove('d-none');
            ordersContainer.classList.add('d-none');
            ordersContainer.innerHTML = '';

            const spinner = new Spinner({ color: '#F26B0A', lines: 12 }).spin(spinnerContainer.querySelector('.spinner'));

            const formData = new URLSearchParams({ userid: userId });

            try {
                const response = await fetchWithToken(ENDPOINTS.ARCHIVE_ORDERS, {
                    method: "POST",
                    body: formData
                });

                console.log("Archive Orders Response:", response);

                if (response.status === "success" && response.data && response.data.length > 0) {
                    response.data.forEach(order => {
                        const orderCard = document.createElement('div');
                        orderCard.className = 'archive-card';
                        orderCard.innerHTML = `
                          
                            <div class="order-details">
                                <p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${order.orders_datetime ? new Date(order.orders_datetime).toLocaleString('en-US') : 'N/A'}</p>
                                <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${order.address_city || 'N/A'}, ${order.address_street || 'N/A'}</p>
                                <p><i class="fas fa-money-bill"></i> <strong>Price:</strong> ${order.orders_price ? order.orders_price + ' EGP' : 'N/A'}</p>
                                <p><i class="fas fa-truck"></i> <strong>Delivery Fee:</strong> ${order.orders_pricedelivery ? order.orders_pricedelivery + ' EGP' : 'N/A'}</p>
                                <p><i class="fas fa-wallet"></i> <strong>Total:</strong> ${order.orders_totalprice ? order.orders_totalprice + ' EGP' : 'N/A'}</p>
                            </div>
                        `;
                        ordersContainer.appendChild(orderCard);
                    });
                } else {
                    ordersContainer.innerHTML = '<div class="no-orders">No orders found in archive</div>';
                }
            } catch (error) {
                console.error("Error loading archive orders:", error);
                ordersContainer.innerHTML = '<div class="no-orders">Error loading orders</div>';
            } finally {
                spinner.stop();
                spinnerContainer.classList.add('d-none');
                ordersContainer.classList.remove('d-none');
            }
        }

        function getStatusText(status) {
            const statusMap = {
                '0': 'Pending',
                '1': 'Processing',
                '2': 'Completed',
                '3': 'Cancelled'
            };
            return statusMap[status] || 'Unknown';
        }

        document.addEventListener("DOMContentLoaded", () => {
            if (!isLoggedIn()) {
                showAlert("warning", "Not Logged In", "You need to log in first!", "Login")
                    .then(() => window.location.href = "signin.html");
                return;
            }
            loadArchiveOrders();
        });