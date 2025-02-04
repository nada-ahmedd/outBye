document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("service_id");
    const userId = urlParams.get("user_id");

    if (!serviceId || !userId) {
        document.getElementById("items-container").innerHTML = "<p>Invalid service or user ID.</p>";
        return;
    }

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
        const itemsContainer = document.getElementById("items-container");

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            itemsContainer.innerHTML = data.data.map(item => `
                <div class="item">
                    <h3>${item.items_name}</h3>
                    <p>${item.items_des}</p>
                    <p>Price: ${item.items_price} EGP</p>
                    <p>Discount: ${item.items_discount}%</p>
                    <img src="${item.items_image}" alt="${item.items_name}">
                    <button class="add-to-cart" data-itemid="${item.items_id}">Add to Cart</button>
                </div>
            `).join('');
            
            document.querySelectorAll(".add-to-cart").forEach(button => {
                button.addEventListener("click", (event) => {
                    const itemId = event.target.getAttribute("data-itemid");
                    addToCart(userId, itemId);
                });
            });
        } else {
            itemsContainer.innerHTML = "<p>No items found for this service.</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching items:", error);
        document.getElementById("items-container").innerHTML = "<p>Error loading items. Please check your connection.</p>";
    });
});

// ✅ إضافة منتج إلى السلة
function addToCart(userId, itemId) {
    const cartApiUrl = "https://abdulrahmanantar.com/outbye/cart/add.php";

    fetch(cartApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usersid: userId,
            itemsid: itemId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Item added to cart successfully!");
        } else {
            alert("Failed to add item to cart.");
        }
    })
    .catch(error => {
        console.error("Error adding to cart:", error);
        alert("Error adding to cart. Please try again.");
    });
}
