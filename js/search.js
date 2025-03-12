document.addEventListener("DOMContentLoaded", () => {
  const searchQueryInput = document.getElementById("searchQuery");
  const searchResultsContainer = document.getElementById("searchResults");
  const searchBtn = document.querySelector(".search-btn");
  const closeBtn = document.querySelector(".close-btn");

  if (!searchQueryInput || !searchResultsContainer || !searchBtn) {
    console.error("Search elements not found!");
    return;
  }

  closeBtn.addEventListener("click", () => {
    searchResultsContainer.classList.remove("show");
    searchQueryInput.value = "";
  });

  searchBtn.addEventListener("click", performSearch);
  searchQueryInput.addEventListener("input", debounce(performSearch, 500));

  function performSearch() {
    const query = searchQueryInput.value.trim().toLowerCase();
    console.log("Search Query:", query);

    if (query.length === 0) {
      searchResultsContainer.innerHTML = "";
      searchResultsContainer.classList.remove("show");
      return;
    }

    searchResultsContainer.innerHTML = "<p style='color: black;'>Searching...</p>";
    searchResultsContainer.classList.add("show");

    fetch("https://abdulrahmanantar.com/outbye/items/search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query })
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(response => {
        console.log("Search API Response:", response);

        if (response.status !== "success" || (!response.items?.data && !response.services?.data)) {
          searchResultsContainer.innerHTML = "<p style='color: red;'>No results found.</p>";
          return;
        }

        let itemsHTML = "<h3>Items</h3>";
        if (response.items?.data?.length) {
          const filteredItems = response.items.data.filter(item => 
            (item.items_name?.toLowerCase().includes(query)) || 
            (item.items_name_ar?.toLowerCase().includes(query))
          );
          if (filteredItems.length) {
            itemsHTML += filteredItems.map(item => `
              <div class="search-result-item">
                <a href="item.html?id=${item.items_id}&service_id=${item.service_id}" class="search-result-link">
                  <img src="${item.items_image || 'default.jpg'}" alt="${item.items_name || 'Item'}" width="50">
                  <span>${item.items_name || 'Unnamed Item'}</span>
                </a>
              </div>
            `).join("");
          } else {
            itemsHTML += "<p>No items match your search.</p>";
          }
        } else {
          itemsHTML += "<p>No items available.</p>";
        }

        let servicesHTML = "<h3>Services</h3>";
        if (response.services?.data?.length) {
          const filteredServices = response.services.data.filter(service => 
            (service.service_name?.toLowerCase().includes(query)) || 
            (service.service_name_ar?.toLowerCase().includes(query)) || 
            (service.service_description?.toLowerCase().includes(query)) || 
            (service.service_description_ar?.toLowerCase().includes(query))
          );
          if (filteredServices.length) {
            servicesHTML += filteredServices.map(service => `
              <div class="search-result-item">
                <a href="services.html?cat=${service.service_cat || ''}&id=${service.service_id || ''}" class="search-result-link" data-service-id="${service.service_id || ''}">
                  <img src="${service.service_image || 'default.jpg'}" alt="${service.service_name || 'Service'}" width="50">
                  <span>${service.service_name || 'Unnamed Service'} (${service.service_name_ar || 'غير مسمى'})</span>
                </a>
              </div>
            `).join("");
          } else {
            servicesHTML += "<p>No services match your search.</p>";
          }
        } else {
          servicesHTML += "<p>No services available.</p>";
        }

        searchResultsContainer.innerHTML = `
          <div class="search-result-column">${itemsHTML}</div>
          <div class="search-result-column">${servicesHTML}</div>
        `;

        document.querySelectorAll(".search-result-link").forEach(link => {
          link.addEventListener("click", function () {
            const serviceId = this.dataset.serviceId;
            if (serviceId) localStorage.setItem("highlightedService", serviceId);
          });
        });
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        searchResultsContainer.innerHTML = `<p style='color: red;'>Error: ${error.message}</p>`;
      });
  }

  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
  }
});