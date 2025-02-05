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
               servicesContainer.innerHTML = data.data.map(service => {
                    const isFavorited = localStorage.getItem(`favorite-${service.service_id}`) === 'true';
                    return `
                    <div class="service-item">
                        <img src="${service.service_image}" alt="${service.service_name}" class="service-image">

                        <div class="service-content">
                            <h3>${service.service_name}</h3>

                            <p class="service-description">${service.service_description}</p>

                            <div class="service-details">
                                <p class="secondary"><strong>Location:</strong> ${service.service_location}</p>
                                <div class="rating">
                                    <i class="fa fa-star"></i>
                                    <span>${service.service_rating}</span>
                                </div>
                                <p class="secondary"><strong>Phone:</strong> ${service.service_phone}</p>
                                <p class="secondary"><strong>Email:</strong> ${service.service_email}</p>
                                <p class="secondary"><strong>Website:</strong> <a href="${service.service_website}" target="_blank">${service.service_website}</a></p>
                            </div>

                            <div class="service-actions">
                                <button class="favorite-btn ${isFavorited ? 'active' : ''}" onclick="toggleFavorite(this, ${service.service_id})">
                                    <i class="fa ${isFavorited ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                                </button>
                                <button class="view-items-btn" onclick="fetchServiceItems(${service.service_id})">View Items</button>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');

            } else {
                servicesContainer.innerHTML = "<p>No services found in this category.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching services:", error);
            servicesContainer.innerHTML = "<p>Error loading services. Please check your connection.</p>";
        });
});

function toggleFavorite(button, serviceId) {
    const icon = button.querySelector("i");

    // تبديل الكلاس active لتفعيل أو إلغاء تفعيل اللون البرتقالي
    button.classList.toggle("active");

    // تغيير الأيقونة إلى حالة مليئة (fa-solid) أو فارغة (fa-regular)
    if (button.classList.contains("active")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");

        // احصل على تفاصيل الخدمة
        const serviceItem = button.closest('.service-item');
        if (serviceItem) {
            const service = {
                service_id: serviceId,
                service_name: serviceItem.querySelector('h3') ? serviceItem.querySelector('h3').textContent : '',
                service_image: serviceItem.querySelector('.service-image') ? serviceItem.querySelector('.service-image').src : '',
                service_description: serviceItem.querySelector('.service-description') ? serviceItem.querySelector('.service-description').textContent : ''
            };

            // حفظ تفاصيل المنتج في localStorage
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            favorites.push(service);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        } else {
            console.error('Service item not found');
        }
    } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");

        // إزالة المنتج من المفضلات
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(fav => fav.service_id !== serviceId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
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
