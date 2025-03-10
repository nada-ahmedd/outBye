// document.addEventListener("DOMContentLoaded", () => {
//     const userId = localStorage.getItem("userId");

//     if (!userId || userId.trim() === "") {
//         document.getElementById("favorites-container").innerHTML = "<p>⚠️ يجب تسجيل الدخول لعرض المفضلة.</p>";
//         return;
//     }

//     // جلب المفضلة
//     fetch("https://abdulrahmanantar.com/outbye/favorite/view.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ id: userId }).toString()
//     })
//     .then(response => response.text())
//     .then(text => {
//         console.log("Favorite API Response:", text);
//         let data;
//         try {
//             data = JSON.parse(text);
//         } catch (error) {
//             console.error("❌ JSON Parsing Error:", error);
//             document.getElementById("favorites-container").innerHTML = "<p>⚠️ حدث خطأ في تحميل المفضلة.</p>";
//             return;
//         }

//         const container = document.getElementById("favorites-container");

//         if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
//             container.innerHTML = "";
//             data.data.forEach(item => {
//                 const itemElement = document.createElement("div");
//                 itemElement.classList.add("favorite-item");

//                 const img = document.createElement("img");
//                 img.src = item.items_image;
//                 img.alt = item.items_name;

//                 const name = document.createElement("h3");
//                 name.textContent = item.items_name;

//                 const price = document.createElement("p");
//                 price.textContent = `${item.items_price} EGP`;

//                 const removeButton = document.createElement("button");
//                 removeButton.classList.add("remove-favorite-btn");
//                 removeButton.dataset.itemid = item.items_id; // تغيير fav_id لـ items_id
//                 removeButton.textContent = "❌ إزالة";
                
//                 removeButton.addEventListener("click", () => {
//                     removeFromFavorites(item.items_id, itemElement); // استخدام items_id
//                 });

//                 itemElement.append(img, name, price, removeButton);
//                 container.appendChild(itemElement);
//             });
//         } else {
//             container.innerHTML = "<p>🚫 لا توجد منتجات مفضلة.</p>";
//         }
//     })
//     .catch(error => {
//         console.error("❌ Error fetching favorites:", error);
//         document.getElementById("favorites-container").innerHTML = "<p>⚠️ حدث خطأ أثناء تحميل المفضلة.</p>";
//     });

//     // إضافة Event Listeners للـ Buttons
//     addEventListeners();
// });

// function addToFavorites(itemId, button) {
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//         Swal.fire("⚠️ خطأ", "يجب تسجيل الدخول أولًا لإضافة المنتجات إلى المفضلة.", "warning");
//         return;
//     }

//     fetch("https://abdulrahmanantar.com/outbye/favorite/add.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Add Favorite Response:", data); // للتأكد من الـ Response
//         if (data.status === "success") {
//             Swal.fire("✅ تمت الإضافة!", "تمت إضافة المنتج إلى المفضلة.", "success");
//             updateFavoriteUI(itemId, true);
//         } else if (data.status === "fail") {
//             Swal.fire("⚠️ موجود بالفعل", "هذا المنتج موجود بالفعل في المفضلة.", "info");
//         } else {
//             Swal.fire("❌ خطأ", data.message || "حدث خطأ غير معروف.", "error");
//         }
//     })
//     .catch(error => {
//         console.error("❌ Error adding to favorites:", error);
//         Swal.fire("❌ خطأ", "حدث خطأ أثناء إضافة المنتج إلى المفضلة.", "error");
//     });
// }

// function removeFromFavorites(itemId, itemElement) {
//     const userId = localStorage.getItem("userId");
//     if (!userId) return;

//     fetch("https://abdulrahmanantar.com/outbye/favorite/remove.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: new URLSearchParams({ usersid: userId, itemsid: itemId }).toString()
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("Remove Favorite Response:", data); // للتأكد من الـ Response
//         if (data.status === "success") {
//             Swal.fire("✅ تمت الإزالة!", "تمت إزالة المنتج من المفضلة.", "success");
//             itemElement.remove(); // إزالة العنصر من الصفحة
//             updateFavoriteUI(itemId, false);
//         } else {
//             Swal.fire("❌ خطأ", data.message || "لم يتمكن السيرفر من حذف المنتج.", "error");
//         }
//     })
//     .catch(error => {
//         console.error("❌ Error removing favorite:", error);
//         Swal.fire("❌ خطأ", "حدث خطأ أثناء إزالة المنتج من المفضلة.", "error");
//     });
// }

// function updateFavoriteUI(itemId, isFavorited) {
//     const button = document.querySelector(`.favorite-btn[data-itemid="${itemId}"]`);
//     if (button) {
//         const icon = button.querySelector("i");
//         if (isFavorited) {
//             icon.classList.remove("fa-regular");
//             icon.classList.add("fa-solid");
//             icon.style.color = "#F26B0A";
//         } else {
//             icon.classList.remove("fa-solid");
//             icon.classList.add("fa-regular");
//             icon.style.color = "";
//         }
//     }
// }

// function addEventListeners() {
//     document.querySelectorAll(".favorite-btn").forEach(button => {
//         button.addEventListener("click", (event) => {
//             const buttonElement = event.currentTarget;
//             const itemId = buttonElement.getAttribute("data-itemid");

//             if (!itemId) {
//                 console.error("❌ Error: `data-itemid` is missing!");
//                 return;
//             }

//             addToFavorites(itemId, buttonElement);
//         });
//     });

//     // لو عندك Add to Cart، ضيفي Event Listeners بتاعته هنا
// }