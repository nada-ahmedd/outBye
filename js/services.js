document.addEventListener("DOMContentLoaded", () => {
    // Scroll to top on page load
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

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

                categoryContainer.innerHTML = `
                    <div class="category-header">
                        <h2>${category.categories_name}</h2>
                    </div>
                `;
                servicesContainer.innerHTML = data.data.map(service => {
                    const isHighlighted = highlightedService == service.service_id ? "highlight" : "";

                    return `
                        <div class="service-item ${isHighlighted}" data-service-id="${service.service_id}" onclick="fetchServiceItems(${service.service_id})">
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
                                    <p class="secondary"><strong>Website:</strong> 
                                        <a href="${service.service_website}" target="_blank" rel="noopener noreferrer">
                                            ${service.service_website}
                                        </a>
                                    </p>
                                </div>
                                <div class="service-actions">
                                    <button class="view-items-btn">View Items</button>
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

// Set highlighted service in localStorage
function setHighlightedService(serviceId) {
    localStorage.setItem("highlightedService", serviceId);
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}

// Fetch service items and redirect if items exist
function fetchServiceItems(serviceId) {
    const apiUrl = "https://abdulrahmanantar.com/outbye/items/items.php";
    fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id: serviceId }).toString()
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
                    alert("No items found for this service.");
                }
            } else {
                alert("An error occurred while fetching data.");
            }
        })
        .catch(error => {
            console.error("Error fetching service items:", error);
            alert("An error occurred while connecting to the server.");
        });
}

// Inline CSS for clickable service card
const style = document.createElement("style");
style.textContent = `
    .service-item {
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .service-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    .service-item .service-actions .view-items-btn {
        pointer-events: none; /* Prevent button from intercepting clicks */
    }
    .service-item .service-title {
        cursor: pointer;
    }
    .service-item a {
        pointer-events: auto; /* Allow website link to remain clickable */
    }
`;
document.head.appendChild(style);