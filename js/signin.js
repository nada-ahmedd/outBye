document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();
  
  const form = this;
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Processing...";

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => (data[key] = value));

  fetch(form.action, {
    method: form.method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(data).toString(),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        alert("Login successful! Redirecting...");
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = "index.html";
      } else {
        displayFormError(form, data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Network error. Please try again later.");
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "Log In";
    });
});

function displayFormError(form, message) {
  form.querySelectorAll(".form-error").forEach((div) => (div.textContent = ""));
  if (message.includes("email")) {
    form.querySelector('input[name="email"] + .form-error').textContent = message;
  }
  if (message.includes("password")) {
    form.querySelector('input[name="password"] + .form-error').textContent = message;
  }
}
