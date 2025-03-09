document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://abdulrahmanantar.com/outbye/services/services.php";
    const servicesContainer = document.getElementById("services-container");
    const categoryContainer = document.getElementById("category-container");

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("id");
    const highlightedService = localStorage.getItem("highlightedService");

    if (!categoryId || isNaN(categoryId)) {
        servicesContainer.innerHTML = "<p>Invalid category ID.</p>";
        return;
    }
    servicesContainer.innerHTML = "<p>Loading services...</p>";
    fetch(`${apiUrl}?id=${categoryId}`, {
        method: "GET",
    })
    .then(response => response.json())
    .then(data => {
        console.log("API Response:", data);

        if (data.status !== "success") {
            servicesContainer.innerHTML = `<p>Error: ${data.message || "Failed to fetch services."}</p>`;
            return;
        }
        if (Array.isArray(data.data) && data.data.length > 0) {
             const category = data.data[0];

            // عرض تفاصيل الكاتيجوري
            categoryContainer.innerHTML = `
                <div class="category-header">
                    <h2>${category.categories_name}</h2>
                </div>
            `;
            servicesContainer.innerHTML = data.data.map(service => {
                const isHighlighted = highlightedService == service.service_id ? "highlight" : ""; 

                return `
                    <div class="service-item ${isHighlighted}" data-service-id="${service.service_id}">
                        <img src="${service.service_image}" alt="${service.service_name}" class="service-image">

                        <div class="service-content">
                            <h3 class="service-title" onclick="setHighlightedService(${service.service_id})">
                                ${service.service_name}
                            </h3>
                            <p class="service-description">${service.service_description}</p>

                            <div class="service-details">
                                <p class="secondary"><strong>Location:</strong> ${service.service_location}</p>
                                <div class="rating">
                                    <i class="fa fa-star"></i>
                                    <span>${service.service_rating}</span>
                                </div>
                                <p class="secondary"><strong>Phone:</strong> ${service.service_phone}</p>
                                <p class="secondary"><strong>Email:</strong> ${service.service_email}</p>
                            </div>

                            <div class="service-actions">
                                <button class="view-items-btn" onclick="fetchServiceItems(${service.service_id})">View Items</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            localStorage.removeItem("highlightedService");
        } else {
            servicesContainer.innerHTML = "<p>No services found in this category.</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching services:", error);
        servicesContainer.innerHTML = "<p>Error loading services. Please check your connection.</p>";
    });
});

function setHighlightedService(serviceId) {
    localStorage.setItem("highlightedService", serviceId);
}

function fetchServiceItems(serviceId) {
    const apiUrl = `https://abdulrahmanantar.com/outbye/items/items.php?id=${serviceId}`;

    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": "Bearer your_token_here"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("API Response:", data);

        if (data.success || data.status === "success") {
            if (data.data && data.data.length > 0) {
                window.location.href = `item.html?service_id=${serviceId}`;
            } else {
                alert("لا توجد عناصر لهذه الخدمة.");
            }
        } else {
            alert("حدث خطأ أثناء جلب البيانات.");
        }
    })
    .catch(error => {
        console.error("Error fetching service items:", error);
        alert("حدث خطأ في الاتصال بالسيرفر.");
    });
}
