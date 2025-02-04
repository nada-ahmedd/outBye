document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("submitEmail").addEventListener("click", function() {
        const email = document.getElementById("email").value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            document.getElementById("errorMessage").textContent = "Please enter your email.";
            return;
        }

        if (!emailPattern.test(email)) {
            document.getElementById("errorMessage").textContent = "Please enter a valid email address.";
            return;
        }
        fetch("https://abdulrahmanantar.com/outbye/forgetpassword/checkemail.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Email check passed. You will receive a verification code shortly.");
                window.location.href = "verify.html"; 
            } else {
                document.getElementById("errorMessage").textContent = data.message;
            }
        })
        .catch(error => console.error("Error:", error));
    });
});
