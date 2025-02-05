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
            itemsContainer.innerHTML = data.data.map(item => {
                const price = item.items_price;
                const discount = item.items_discount;
                const discountedPrice = price - (price * discount / 100);
                return `
                    <div class="item">
                        <h3>${item.items_name}</h3>
                        <p>${item.items_des}</p>
                        <p class="price">
                            ${discount > 0 ? `<span class="old-price">${price} EGP</span>` : ''} 
                            ${discount > 0 ? `<span class="new-price">${discountedPrice} EGP</span>` : `<span class="regular-price">${price} EGP</span>`}
                        </p>
                        <p class="discount">${discount > 0 ? `Discount: ${discount}%` : ''}</p>
                        <img src="${item.items_image}" alt="${item.items_name}">
                        <button class="addItem-to-cart" 
                            data-itemid="${item.items_id}" 
                            data-itemname="${item.items_name}" 
                            data-itemprice="${item.items_price}" 
                            data-itemimage="${item.items_image}">
                            Add to Cart
                        </button>
                    </div>
                `;
            }).join(''); 
            
            // Add event listener for "Add to Cart"
            document.querySelectorAll(".addItem-to-cart").forEach(button => {
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

// Function to add items to the cart
function addToCart(userId, itemId) {
    // Add the item to the cart logic here (e.g., saving to cart in localStorage)
    alert("Item added to cart!");
}
