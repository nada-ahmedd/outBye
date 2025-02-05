document.addEventListener("DOMContentLoaded", () => {
    const favoritesContainer = document.getElementById("favorites-container");

    // الحصول على الـ Favorites من API (مثال على الجلب من الـ API)
    const userId = 1; // استبدل بـ ID المستخدم الفعلي
    const apiUrl = `https://abdulrahmanantar.com/outbye/favorite/view.php`;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `id=${userId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success" && Array.isArray(data.data)) {
            favoritesContainer.innerHTML = data.data.map(item => {
                return `
                    <div class="favorite-item">
                        <img src="${item.image_url}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <div class="favorite-actions">
                            <button class="remove-btn" onclick="removeFromFavorites(${item.item_id})">حذف من المفضلة</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            favoritesContainer.innerHTML = "<p>لا توجد منتجات مفضلة.</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching favorite items:", error);
        favoritesContainer.innerHTML = "<p>حدث خطأ أثناء تحميل المنتجات.</p>";
    });
});

function removeFromFavorites(itemId) {
    // هنا يمكن إضافة الكود الخاص بحذف العنصر من المفضلة عبر الـ API
    alert(`تم حذف المنتج برقم ${itemId}`);
}
