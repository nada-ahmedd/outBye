document.addEventListener("DOMContentLoaded", function () {
    const searchQueryInput = document.getElementById("searchQuery");
    const searchButton = document.querySelector(".btn-search");
    const searchResultsContainer = document.getElementById("searchResults");

    if (searchButton && searchQueryInput && searchResultsContainer) {
        searchButton.addEventListener("click", performSearch);
        searchQueryInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                performSearch();
            }
        });
    }

    function performSearch() {
        const query = searchQueryInput.value.trim();

        if (query.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="alert alert-warning">
                    الرجاء إدخال كلمة البحث
                </div>
            `;
            searchResultsContainer.classList.remove("show");
            return;
        }

        searchResultsContainer.innerHTML = "<p>جاري البحث...</p>";
        searchResultsContainer.classList.add("show");

        const formData = new FormData();
        formData.append('search', query);

        fetch("https://abdulrahmanantar.com/outbye/items/search.php", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            if (!response.data) {
                throw new Error('No data received');
            }

            const data = response.data;

            if (data.length === 0) {
                searchResultsContainer.innerHTML = `
                    <div class="alert alert-info">
                        لا توجد نتائج للبحث
                    </div>
                `;
                return;
            }

            let resultsHtml = '<div class="row">';

            data.forEach(item => {
                resultsHtml += `
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-body">
                                ${item.service_name ? 
                                    // Service card template
                                    `<h5 class="card-title">${item.service_name}</h5>
                                    ${item.service_image ? 
                                        `<img src="${item.service_image}" class="card-img-top mb-2" alt="${item.service_name}" onerror="this.style.display='none'">` : ''}
                                    <p class="card-text">${item.service_description || ''}</p>
                                    <div class="service-info">
                                        <p>📍 ${item.service_location || ''}</p>
                                        <p>⭐ ${item.service_rating || ''}</p>
                                        <p>📞 ${item.service_phone || ''}</p>
                                    </div>` :
                                    // Product card template
                                    `<h5 class="card-title">${item.items_name || ''}</h5>
                                    ${item.items_image ? 
                                        `<img src="${item.items_image}" class="card-img-top mb-2" alt="${item.items_name}" onerror="this.style.display='none'">` : ''}
                                    <p class="card-text">${item.items_des || ''}</p>
                                    <p class="price">السعر: ${item.items_price || ''} جنيه</p>
                                    ${item.items_discount ? 
                                        `<p class="discount">الخصم: ${item.items_discount}%</p>` : ''}
                                    <button class="btn btn-primary mt-2" onclick="addToCart(${item.items_id})">
                                        إضافة للسلة
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            });

            resultsHtml += '</div>';
            searchResultsContainer.innerHTML = resultsHtml;
        })
        .catch(error => {
            console.error("Search error:", error);
            searchResultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    حدث خطأ في البحث
                </div>
            `;
        });
    }
});

function addToCart(itemId) {
    console.log("Adding to cart:", itemId);
}
function closeSearchResults() {
    document.getElementById("searchResults").classList.remove("show");
}
document.getElementById("searchQuery").addEventListener("input", function () {
    if (this.value.trim() === "") {
        closeSearchResults();
    }
});
