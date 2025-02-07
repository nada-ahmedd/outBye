document.addEventListener('DOMContentLoaded', function () {
    const userId = 10; 
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    async function fetchCartItems() {
        try {
            const response = await fetch('https://abdulrahmanantar.com/outbye/cart/view.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usersid: userId })
            });
            const data = await response.json();

            if (data.status === 'success') {
                displayCartItems(data.datacart);
                updateTotalPrice(data.countprice.totalprice);
            } else {
                console.error('Error fetching cart items:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function displayCartItems(items) {
        cartItemsContainer.innerHTML = ''; 
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemname}</td>
                <td>${item.itemsprice} EGP</td>
                <td>${item.countitems}</td>
                <td>${item.itemsprice * item.countitems} EGP</td>
                <td><button onclick="removeFromCart(${item.itemid})">Remove</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    function updateTotalPrice(totalPrice) {
        totalPriceElement.textContent = `${totalPrice} EGP`;
    }

    async function addToCart(itemId) {
        try {
            const response = await fetch('https://abdulrahmanantar.com/outbye/cart/add.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usersid: userId, itemsid: itemId })
            });
            const data = await response.json();

            if (data.status === 'success') {
                fetchCartItems(); 
            } else {
                console.error('Error adding item to cart:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function removeFromCart(itemId) {
        try {
            const response = await fetch('https://abdulrahmanantar.com/outbye/cart/delet.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usersid: userId, itemsid: itemId })
            });
            const data = await response.json();

            if (data.status === 'success') {
                fetchCartItems(); 
            } else {
                console.error('Error removing item from cart:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateCart() {
        fetchCartItems();
    }
    document.querySelectorAll('.addItem-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = this.getAttribute('data-itemid');
            addToCart(itemId);
        });
    });

    fetchCartItems();
});