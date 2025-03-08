// ✅ انتظر تحميل الصفحة أولًا
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");

    if (!userId || userId.trim() === "") {
        document.getElementById("favorites-container").innerHTML = "<p>⚠️ يجب تسجيل الدخول لعرض المفضلة.</p>";
        return;
    }

    fetch("https://abdulrahmanantar.com/outbye/favorite/view.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id: userId }).toString()
    })
    .then(response => response.text()) // جلب الاستجابة كنص
    .then(text => {
        console.log("Favorite API Response:", text); // طباعة الاستجابة
        let data;
        try {
            data = JSON.parse(text); // محاولة تحويلها إلى JSON
        } catch (error) {
            console.error("❌ JSON Parsing Error:", error);
            document.getElementById("favorites-container").innerHTML = "<p>⚠️ حدث خطأ في تحميل المفضلة.</p>";
            return;
        }

        const container = document.getElementById("favorites-container");

        if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
            container.innerHTML = "";
            data.data.forEach(item => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("favorite-item");

                const img = document.createElement("img");
                img.src = item.items_image;
                img.alt = item.items_name;

                const name = document.createElement("h3");
                name.textContent = item.items_name;

                const price = document.createElement("p");
                price.textContent = `${item.items_price} EGP`;

                const removeButton = document.createElement("button");
                removeButton.classList.add("remove-favorite-btn");
                removeButton.dataset.favid = item.fav_id;
                removeButton.textContent = "❌ إزالة";
                
                // استدعاء removeFromFavorites عند النقر
                removeButton.addEventListener("click", () => {
                    removeFromFavorites(item.fav_id, itemElement);
                });

                itemElement.append(img, name, price, removeButton);
                container.appendChild(itemElement);
            });

        } else {
            container.innerHTML = "<p>🚫 لا توجد منتجات مفضلة.</p>";
        }
    })
    .catch(error => {
        console.error("❌ Error fetching favorites:", error);
        document.getElementById("favorites-container").innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المفضلة.</p>";
    });
});

function removeFromFavorites(itemId) {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch("https://abdulrahmanantar.com/outbye/favorite/remove.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            Swal.fire("✅ تمت الإزالة!", "تمت إزالة المنتج من المفضلة.", "success");
            document.querySelector(`.remove-favorite-btn[data-itemid="${itemId}"]`).parentElement.remove();
            updateFavoriteUI(itemId, false);
        } else {
            Swal.fire("❌ خطأ", "لم يتمكن السيرفر من حذف المنتج.", "error");
        }
    })
    .catch(error => console.error("❌ Error removing favorite:", error));
}
