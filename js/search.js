document.addEventListener("DOMContentLoaded", () => {
  const searchQueryInput = document.getElementById("searchQuery");
  const searchResultsContainer = document.getElementById("searchResults");
  const closeBtn = document.querySelector(".close-btn");

  if (!searchQueryInput || !searchResultsContainer) {
    console.error("Search input or results container not found!");
    return;
  }

  // Close button functionality
  closeBtn.addEventListener("click", () => {
    searchResultsContainer.classList.remove("show");
    searchQueryInput.value = "";
  });

  searchQueryInput.addEventListener("input", debounce(performSearch, 500));

  function performSearch() {
    const query = searchQueryInput.value.trim().toLowerCase();
    console.log("Search Query:", query); // Log the search query to debug

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

        // Create two columns for Items and Services
        let itemsHTML = "";
        let servicesHTML = "";

        // Items Section
        if (response.items?.data) {
          console.log("Items Data:", response.items.data);
          const filteredItems = response.items.data.filter(item =>
            (item.items_name && item.items_name.toLowerCase().includes(query)) ||
            (item.items_name_ar && item.items_name_ar.toLowerCase().includes(query))
          );

          if (filteredItems.length > 0) {
            itemsHTML += `<h3>Items</h3>`;
            filteredItems.forEach(item => {
              itemsHTML += `
                <div class="search-result-item">
                  <a href="item.html?id=${item.items_id}&service_id=${item.service_id}" class="search-result-link">
                    <img src="${item.items_image}" alt="${item.items_name}" width="50">
                    <span>${item.items_name}</span>
                  </a>
                </div>
              `;
            });
          } else {
            itemsHTML += `<h3>Items</h3><p>No items found.</p>`;
          }
        } else {
          itemsHTML += `<h3>Items</h3><p>No items data available.</p>`;
        }

        // Services Section
        if (response.services?.data) {
          console.log("Services Data:", response.services.data);
          const filteredServices = response.services.data.filter(service => {
            console.log("Service:", service);
            return (
              (service.service_name && service.service_name.toLowerCase().includes(query)) ||
              (service.service_name_ar && service.service_name_ar.toLowerCase().includes(query)) ||
              (service.service_description && service.service_description.toLowerCase().includes(query)) || // Search in description
              (service.service_description_ar && service.service_description_ar.toLowerCase().includes(query)) // Search in Arabic description
            );
          });

          if (filteredServices.length > 0) {
            servicesHTML += `<h3>Services</h3>`;
            filteredServices.forEach(service => {
              const serviceId = service.service_id || ''; // Fallback if service_id is missing
              const serviceCat = service.service_cat || ''; // Fallback if service_cat is missing
              servicesHTML += `
                <div class="search-result-item">
                  <a href="services.html?cat=${serviceCat}&id=${serviceId}" class="search-result-link" data-service-id="${serviceId}">
                    <img src="${service.service_image}" alt="${service.service_name || 'Service'}" width="50">
                    <span>${service.service_name || 'Unnamed Service'} (${service.service_name_ar || 'غير مسمى'})</span>
                  </a>
                </div>
              `;
            });
          } else {
            servicesHTML += `<h3>Services</h3><p>No services found for query: "${query}".</p>`;
          }
        } else {
          servicesHTML += `<h3>Services</h3><p>No services data available.</p>`;
        }

        // Combine the two columns
        searchResultsContainer.innerHTML = `
          <div class="search-result-column">${itemsHTML}</div>
          <div class="search-result-column">${servicesHTML}</div>
        `;

        document.querySelectorAll(".search-result-link").forEach(link => {
          link.addEventListener("click", function () {
            const serviceId = this.dataset.serviceId;
            if (serviceId) {
              localStorage.setItem("highlightedService", serviceId);
            } else {
              console.error("No service ID found for this link!");
            }
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