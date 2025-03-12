const API_BASE_URL = "https://abdulrahmanantar.com/outbye/";
const ADDRESS_ENDPOINTS = {
  ADD: `${API_BASE_URL}address/add.php`,
  VIEW: `${API_BASE_URL}address/view.php`,
  DELETE: `${API_BASE_URL}address/delet.php`,
  EDIT: `${API_BASE_URL}address/edit.php`
};
const MESSAGES = {
  ACCESS_DENIED: "You must log in first to manage addresses!",
  ERROR_FETCH: "⚠️ Error fetching data."
};

function isLoggedIn() {
  return !!localStorage.getItem("userId");
}

function showAlert({ icon, title, text, confirmText, cancelText, onConfirm }) {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: confirmText || "OK",
    showCancelButton: !!cancelText,
    cancelButtonText: cancelText || "Cancel"
  }).then((result) => {
    if (result.isConfirmed && onConfirm) onConfirm();
  });
}

// Navbar Events
function initNavbarEvents() {
  document.getElementById("logout-btn").addEventListener("click", logout);
  updateNavbar();
}

// Address Functions
async function loadAddresses() {
  const userId = localStorage.getItem("userId");
  const addressList = document.getElementById("address-list");

  if (!userId) {
    addressList.innerHTML = "<p>Please log in to view addresses.</p>";
    return;
  }

  try {
    const response = await fetch(ADDRESS_ENDPOINTS.VIEW, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId }).toString()
    });
    const data = await response.json();
    console.log("Addresses API Response:", data);

    if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
      addressList.innerHTML = data.data.map(address => `
        <div class="address-item">
          <p><strong>Name:</strong> ${address.name}</p>
          <p><strong>City:</strong> ${address.city}</p>
          <p><strong>Street:</strong> ${address.street}</p>
          <p><strong>Latitude:</strong> ${address.lat}</p>
          <button class="btn btn-primary edit-address" data-addressid="${address.addressid}">Edit</button>
          <button class="btn btn-danger delete-address" data-addressid="${address.addressid}">Delete</button>
        </div>
      `).join("");
      addAddressEventListeners();
    } else {
      addressList.innerHTML = "<p>No addresses found.</p>";
    }
  } catch (error) {
    console.error("❌ Error fetching addresses:", error);
    addressList.innerHTML = "<p>Error loading addresses.</p>";
  }
}

async function addAddress() {
  const userId = localStorage.getItem("userId");
  const name = document.getElementById("address-name").value;
  const city = document.getElementById("address-city").value;
  const street = document.getElementById("address-street").value;
  const lat = document.getElementById("address-lat").value;

  if (!name || !city || !street || !lat) {
    showAlert({ icon: "warning", title: "Missing Fields", text: "Please fill all fields!" });
    return;
  }

  try {
    const response = await fetch(ADDRESS_ENDPOINTS.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, name, city, street, lat }).toString()
    });
    const data = await response.json();
    if (data.success) {
      document.getElementById("address-form").reset();
      loadAddresses();
    } else {
      showAlert({ icon: "error", title: "Error", text: data.message || "Failed to add address!" });
    }
  } catch (error) {
    console.error("❌ Error adding address:", error);
    showAlert({ icon: "error", title: "Error", text: "Failed to add address!" });
  }
}

async function deleteAddress(addressId) {
  const userId = localStorage.getItem("userId");

  showAlert({
    icon: "warning",
    title: "Delete Address?",
    text: "Are you sure you want to delete this address?",
    confirmText: "Yes, Delete!",
    cancelText: "Cancel",
    onConfirm: async () => {
      try {
        const response = await fetch(ADDRESS_ENDPOINTS.DELETE, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ usersid: userId, addressid: addressId }).toString()
        });
        const data = await response.json();
        if (data.success) {
          loadAddresses();
        } else {
          showAlert({ icon: "error", title: "Error", text: data.message || "Failed to delete address!" });
        }
      } catch (error) {
        console.error("❌ Error deleting address:", error);
        showAlert({ icon: "error", title: "Error", text: "Failed to delete address!" });
      }
    }
  });
}

async function editAddress(addressId) {
  const userId = localStorage.getItem("userId");
  const name = document.getElementById("address-name").value;
  const city = document.getElementById("address-city").value;
  const street = document.getElementById("address-street").value;
  const lat = document.getElementById("address-lat").value;

  if (!name || !city || !street || !lat) {
    showAlert({ icon: "warning", title: "Missing Fields", text: "Please fill all fields!" });
    return;
  }

  try {
const response = await fetch(ADDRESS_ENDPOINTS.EDIT, {      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ usersid: userId, addressid: addressId, name, city, street, lat }).toString()
    });
    const data = await response.json();
    if (data.success) {
      document.getElementById("address-form").reset();
      loadAddresses();
      document.getElementById("save-address").onclick = addAddress; // Reset to Add mode
    } else {
      showAlert({ icon: "error", title: "Error", text: data.message || "Failed to edit address!" });
    }
  } catch (error) {
    console.error("❌ Error editing address:", error);
    showAlert({ icon: "error", title: "Error", text: "Failed to edit address!" });
  }
}

function addAddressEventListeners() {
  document.querySelectorAll(".delete-address").forEach(button => {
    button.addEventListener("click", () => {
      const addressId = button.getAttribute("data-addressid");
      deleteAddress(addressId);
    });
  });

  document.querySelectorAll(".edit-address").forEach(button => {
    button.addEventListener("click", () => {
      const addressId = button.getAttribute("data-addressid");
      const addressItem = button.closest(".address-item");
      document.getElementById("address-name").value = addressItem.querySelector("p:nth-child(1)").textContent.replace("Name: ", "");
      document.getElementById("address-city").value = addressItem.querySelector("p:nth-child(2)").textContent.replace("City: ", "");
      document.getElementById("address-street").value = addressItem.querySelector("p:nth-child(3)").textContent.replace("Street: ", "");
      document.getElementById("address-lat").value = addressItem.querySelector("p:nth-child(4)").textContent.replace("Latitude: ", "");
      document.getElementById("save-address").onclick = () => editAddress(addressId);
    });
  });

  document.getElementById("save-address").addEventListener("click", addAddress);
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

function updateNavbar() {
  const isLoggedInUser = localStorage.getItem('isLoggedIn');
  const logoutBtn = document.getElementById('logout-btn');
  if (isLoggedInUser === 'true') {
    logoutBtn.style.display = 'block';
  } else {
    logoutBtn.style.display = 'none';
    document.querySelector(".cart-count").textContent = "0";
  }
}