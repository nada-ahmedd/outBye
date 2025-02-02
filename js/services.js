document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://abdulrahmanantar.com/outbye/services/services.php";
    const servicesContainer = document.getElementById("services-container");

    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("id");

    if (!categoryId || isNaN(categoryId)) {
        servicesContainer.innerHTML = "<p>Invalid category ID.</p>";
        return;
    }

    servicesContainer.innerHTML = "<p>Loading services...</p>";

    fetch(`${apiUrl}?id=${categoryId}`, {
        method: "POST",
        headers: {
            "Authorization": "24"
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);

            if (data.status !== "success") {
                servicesContainer.innerHTML = `<p>Error: ${data.message || "Failed to fetch services."}</p>`;
                return;
            }

            if (Array.isArray(data.data) && data.data.length > 0) {
               servicesContainer.innerHTML = data.data.map(service => `
    <div class="service-item">
        <img src="${service.service_image}" alt="${service.service_name}" class="service-image">
        <h3>${service.service_name}</h3>
        <p>${service.service_description}</p>
        <p class="secondary"><strong>Location:</strong> ${service.service_location}</p>
        <p class="secondary"><strong>Rating:</strong> ${service.service_rating}</p>
        <p class="secondary"><strong>Phone:</strong> ${service.service_phone}</p>
        <p class="secondary"><strong>Email:</strong> ${service.service_email}</p>
        <p class="secondary"><strong>Website:</strong> <a href="${service.service_website}" target="_blank">${service.service_website}</a></p>
        
        <button class="view-items-btn" onclick="fetchServiceItems(${service.service_id})">
            View Items
        </button>
    </div>
`).join('');

            } else {
                servicesContainer.innerHTML = "<p>No services found in this category.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching services:", error);
            servicesContainer.innerHTML = "<p>Error loading services. Please check your connection.</p>";
        });
});

function toggleFavorite(button) {
    const icon = button.querySelector("i");

    button.classList.toggle("active");

    if (button.classList.contains("active")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
    } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
    }
}
function fetchServiceItems(serviceId) {
    const userId = 10; 
    const apiUrl = `https://abdulrahmanantar.com/outbye/items/items.php?id=${serviceId}&userid=${userId}`;

    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": "Bearer your_token_here" 
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("API Response:", data); 

        if (data.success || data.status === "success") {
            if (data.data && data.data.length > 0) {
                window.location.href = `item.html?service_id=${serviceId}&user_id=${userId}`;
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
