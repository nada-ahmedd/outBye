document.addEventListener("DOMContentLoaded", function () {
    const cartTable = document.querySelector(".cart-table tbody");
    const cartTotal = document.querySelector(".cart-total span");
    const cartCount = document.querySelector(".cart-count");
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cartTable || !cartTotal || !cartCount) {
        console.error("Required elements not found in the DOM!");
        return;
    }

    function renderCart() {
        cartTable.innerHTML = "";

        if (cartItems.length === 0) {
            cartTable.innerHTML = "<tr><td colspan='5'>Your cart is empty!</td></tr>";
            calculateTotal();
            updateCartCount();
            return;
        }

        cartItems.forEach((item, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-id", index);
            row.innerHTML = `
                <td>
                    <div class="product">
                        <img src="${item.image}" alt="${item.name}">
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>$${item.price}</td>
                <td>
                    <input type="number" class="quantity" value="${item.quantity}" min="1">
                </td>
                <td class="subtotal">$${item.price * item.quantity}</td>
                <td><button class="remove-btn">Remove</button></td>
            `;
            cartTable.appendChild(row);
        });

        calculateTotal();
        updateCartCount();
    }

    function calculateTotal() {
        let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.textContent = `$${total}`;
    }

    function updateLocalStorage() {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }

    function updateCartCount() {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems; 
    }

    cartTable.addEventListener("input", function (e) {
        if (e.target.classList.contains("quantity")) {
            const row = e.target.closest("tr");
            const itemId = row.getAttribute("data-id");
            const newQuantity = parseInt(e.target.value);

            if (newQuantity > 0) {
                cartItems[itemId].quantity = newQuantity;
                row.querySelector(".subtotal").textContent = `$${cartItems[itemId].price * newQuantity}`;
                calculateTotal();
                updateLocalStorage();
                updateCartCount();
            }
        }
    });

    cartTable.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-btn")) {
            const row = e.target.closest("tr");
            const itemId = row.getAttribute("data-id");
            cartItems.splice(itemId, 1);
            renderCart();
            updateLocalStorage();
            updateCartCount();
        }
    });

    document.querySelectorAll(".Add-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const productBox = btn.closest(".client-box");
            const productName = productBox.querySelector(".details h3").textContent;

            const existingProduct = cartItems.find(item => item.name === productName);
            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                const product = {
                    image: productBox.querySelector("img").src,
                    name: productName,
                    price: parseInt(productBox.querySelector(".details h5").textContent.replace(/\D/g, "")),
                    quantity: 1
                };
                cartItems.push(product);
            }

            renderCart();
            updateLocalStorage();
            updateCartCount(); 
        });
    });

    renderCart();
});
