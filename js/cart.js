document.addEventListener("DOMContentLoaded", () => {
    const userId = new URLSearchParams(window.location.search).get("user_id");
    if (!userId) {
        document.querySelector(".cart-container").innerHTML = "<p>Invalid user ID.</p>";
        return;
    }
    
    const cartApiUrl = `https://abdulrahmanantar.com/outbye/cart/view.php?usersid=${userId}`;
    const cartTableBody = document.querySelector(".cart-table tbody");
    const cartTotal = document.querySelector(".cart-total span");

    function fetchCart() {
        fetch(cartApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === "success" && Array.isArray(data.datacart)) {
                    cartTableBody.innerHTML = data.datacart.map(item => `
                        <tr data-itemid="${item.itemid}">
                            <td>
                                <div class="product">
                                    <img src="${item.itemimage || 'placeholder.jpg'}" alt="${item.itemname}">
                                    <span>${item.itemname}</span>
                                </div>
                            </td>
                            <td>$${item.itemsprice}</td>
                            <td>
                                <select class="quantity">
                                    ${[1, 2, 3, 4, 5].map(q => `
                                        <option value="${q}" ${q === item.countitems ? 'selected' : ''}>${q}</option>
                                    `).join('')}
                                </select>
                            </td>
                            <td class="subtotal">$${(item.itemsprice * item.countitems).toFixed(2)}</td>
                            <td>
                                <button class="remove-btn">Remove</button>
                            </td>
                        </tr>
                    `).join('');
                    cartTotal.textContent = `$${data.countprice.totalprice.toFixed(2)}`;
                } else {
                    cartTableBody.innerHTML = "<tr><td colspan='5'>No items in cart.</td></tr>";
                }
            })
            .catch(error => console.error("Error loading cart:", error));
    }

    fetchCart();

    cartTableBody.addEventListener("change", (event) => {
        if (event.target.classList.contains("quantity")) {
            const row = event.target.closest("tr");
            const itemId = row.dataset.itemid;
            const newQuantity = event.target.value;
            
            fetch("https://abdulrahmanantar.com/outbye/cart/add.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usersid: userId, itemsid: itemId, quantity: newQuantity })
            })
            .then(response => response.json())
            .then(() => fetchCart())
            .catch(error => console.error("Error updating quantity:", error));
        }
    });

    cartTableBody.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-btn")) {
            const row = event.target.closest("tr");
            const itemId = row.dataset.itemid;
            
            fetch("https://abdulrahmanantar.com/outbye/cart/delet.php", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usersid: userId, itemsid: itemId })
            })
            .then(response => response.json())
            .then(() => fetchCart())
            .catch(error => console.error("Error removing item:", error));
        }
    });
});
