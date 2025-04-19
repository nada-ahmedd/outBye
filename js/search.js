document.addEventListener("DOMContentLoaded", () => {
  const searchQueryInput = document.getElementById("searchQuery");
  const searchResultsContainer = document.getElementById("searchResults");
  const searchBtn = document.querySelector(".search-btn");
  const closeBtn = document.querySelector(".close-btn");

  if (!searchQueryInput || !searchResultsContainer || !searchBtn || !closeBtn) {
    console.error("Search elements not found!", { searchQueryInput, searchResultsContainer, searchBtn, closeBtn });
    return;
  }

  // Function to hide search results
  const hideSearchResults = () => {
    searchResultsContainer.classList.remove("show");
    searchQueryInput.value = "";
  };

  // Add focusout event on the input
  searchQueryInput.addEventListener("focusout", (e) => {
    // Ensure the click is not inside the results card
    setTimeout(() => {
      if (!searchResultsContainer.contains(document.activeElement)) {
        hideSearchResults();
      }
    }, 100); // Small delay to ensure click on the card is registered
  });

  // Add click event on the document to hide results if clicked outside the input or card
  document.addEventListener("click", (e) => {
    const isClickInsideInput = searchQueryInput.contains(e.target);
    const isClickInsideResults = searchResultsContainer.contains(e.target);

    if (!isClickInsideInput && !isClickInsideResults) {
      hideSearchResults();
    }
  });

  // Event for the close button
  closeBtn.addEventListener("click", () => {
    hideSearchResults();
  });

  // Rest of the code remains the same
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
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        return response.text();
      })
      .then(text => {
        console.log("Raw API Response:", text);
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        let response;

        try {
          if (jsonStart === -1 || jsonEnd === 0) throw new Error("No valid JSON found");
          const jsonText = text.substring(jsonStart, jsonEnd);
          console.log("Extracted JSON:", jsonText);
          response = JSON.parse(jsonText);
          console.log("Parsed API Response:", response);
        } catch (e) {
          console.error("Error parsing response:", e);
          throw e;
        }

        let itemsHTML = "<h3>Items</h3>";
        if (response.items?.data?.length) {
          const filteredItems = response.items.data.filter(item => 
            (item.items_name?.toLowerCase().includes(query)) || 
            (item.items_name_ar?.toLowerCase().includes(query))
          );
          itemsHTML += filteredItems.length
            ? filteredItems.map(item => `
                <div class="search-result-item">
                  <a href="item.html?id=${item.items_id}&service_id=${item.service_id}" class="search-result-link">
                    <img src="${item.items_image || 'default.jpg'}" alt="${item.items_name || 'Item'}" width="50">
                    <span>${item.items_name || 'Unnamed Item'}</span>
                  </a>
                </div>
              `).join("")
            : "<p>No items match your search.</p>";
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
          servicesHTML += filteredServices.length
            ? filteredServices.map(service => `
                <div class="search-result-item">
                  <a href="item.html?service_id=${service.service_id}" class="search-result-link">
                    <img src="${service.service_image || 'default.jpg'}" alt="${service.service_name || 'Service'}" width="50">
                    <span>${service.service_name || 'Unnamed Service'} (${service.service_name_ar || 'N/A'})</span>
                  </a>
                </div>
              `).join("")
            : "<p>No services match your search.</p>";
        } else {
          servicesHTML += "<p>No services available.</p>";
        }

        searchResultsContainer.innerHTML = `
          <div class="search-result-column">${itemsHTML}</div>
          <div class="search-result-column">${servicesHTML}</div>
        `;

        document.querySelectorAll(".search-result-link").forEach(link => {
          link.addEventListener("click", function () {
            const serviceId = this.getAttribute("href").match(/service_id=(\d+)/)?.[1];
            if (serviceId) localStorage.setItem("highlightedService", serviceId);
          });
        });
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        searchResultsContainer.innerHTML = "<p style='color: red;'>Error: Server issue</p>";
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