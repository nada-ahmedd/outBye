document.addEventListener("DOMContentLoaded", () => {
  const searchQueryInput = document.getElementById("searchQuery");
  const searchResultsContainer = document.getElementById("searchResults");

  if (!searchQueryInput || !searchResultsContainer) {
    console.error("Search input or results container not found!");
    return;
  }

  searchQueryInput.addEventListener("input", debounce(performSearch, 500));

  function performSearch() {
    const query = searchQueryInput.value.trim().toLowerCase();

    if (query.length === 0) {
      searchResultsContainer.innerHTML = "";
      searchResultsContainer.classList.remove("show");
      return;
    }

    searchResultsContainer.innerHTML = "<p style='color: black;'>Searching...</p>";
    searchResultsContainer.classList.add("show");

    fetch("https://abdulrahmanantar.com/outbye/items/search.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ search: query }) 
    })
      .then(response => response.json())
      .then(response => {
        console.log("Search API Response:", response);

        if (!response || (!response.items?.data?.length && !response.services?.data?.length)) {
          searchResultsContainer.innerHTML = "<p style='color: red;'>No results found.</p>";
          return;
        }

        let resultsHTML = "";
        if (response.items?.data) {
          const filteredItems = response.items.data.filter(item =>
            item.items_name.toLowerCase().includes(query) ||
            item.items_name_ar.toLowerCase().includes(query)
          );

          if (filteredItems.length > 0) {
            resultsHTML += `<h3>Items</h3>`;
            filteredItems.forEach(item => {
              resultsHTML += `
                <div class="search-result-item">
                  <a href="item.html?id=${item.items_id}&service_id=${item.service_id}" class="search-result-link">
                    <img src="${item.items_image}" alt="${item.items_name}" width="50">
                    <span>${item.items_name}</span>
                  </a>
                </div>
              `;
            });
          }
        }

        if (response.services?.data) {
          const filteredServices = response.services.data.filter(service =>
            service.service_name.toLowerCase().includes(query) ||
            service.service_name_ar.toLowerCase().includes(query)
          );

          if (filteredServices.length > 0) {
            resultsHTML += `<h3>Services</h3>`;
            filteredServices.forEach(service => {
              resultsHTML += `
                <div class="search-result-item">
                  <a href="services.html?id=${service.service_cat}&${service.service_id}" class="search-result-link" data-service-id="${service.service_id}">
                    <img src="${service.service_image}" alt="${service.service_name}" width="50">
                    <span>${service.service_name} (${service.service_name_ar})</span>
                  </a>
                </div>
              `;
            });
          }
        }

        searchResultsContainer.innerHTML = resultsHTML;

        document.querySelectorAll(".search-result-link").forEach(link => {
          link.addEventListener("click", function () {
            localStorage.setItem("highlightedService", this.dataset.serviceId);
          });
        });
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        searchResultsContainer.innerHTML = "<p style='color: red;'>Error loading results.</p>";
      });
  }

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const highlightedService = localStorage.getItem("highlightedService");
  if (highlightedService) {
    const targetService = document.querySelector(`.service-item[data-service-id="${highlightedService}"]`);
    if (targetService) {
      targetService.classList.add("highlight");
    }
    localStorage.removeItem("highlightedService"); 
  }
});
