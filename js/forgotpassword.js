document.addEventListener("DOMContentLoaded", function() {
    // إرسال البريد للتحقق
    document.getElementById("sendCode").addEventListener("click", function() {
        const email = document.getElementById("forgotEmail").value.trim();
        if (!email) {
            document.getElementById("emailError").textContent = "Please enter your email.";
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
                localStorage.setItem("resetEmail", email);
                document.getElementById("forgotPasswordModal").style.display = "none";
                document.getElementById("verifyCodeModal").style.display = "block";
            } else {
                document.getElementById("emailError").textContent = data.message;
            }
        })
        .catch(error => console.error("Error:", error));
    });

    // التحقق من كود التفعيل
    document.getElementById("verifyCode").addEventListener("click", function() {
        const verifyCode = document.getElementById("verificationCode").value.trim();
        const email = localStorage.getItem("resetEmail");

        if (!verifyCode || verifyCode.length !== 5) {
            document.getElementById("codeError").textContent = "Please enter a valid 5-digit code.";
            return;
        }

        fetch("https://abdulrahmanantar.com/outbye/auth/verfiycode.php", {
            method: "POST",
            body: new URLSearchParams({ email: email, verifycode: verifyCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                document.getElementById("verifyCodeModal").style.display = "none";
                document.getElementById("resetPasswordModal").style.display = "block";
            } else {
                document.getElementById("codeError").textContent = data.message;
            }
        })
        .catch(error => console.error("Error:", error));
    });

    // إعادة تعيين كلمة المرور
    document.getElementById("resetPassword").addEventListener("click", function() {
        const newPassword = document.getElementById("newPassword").value.trim();
        const email = localStorage.getItem("resetEmail");

      

        fetch("https://abdulrahmanantar.com/outbye/forgetpassword/resetpassword.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                alert("Password reset successful! You can now log in.");
                window.location.href = "signin.html";
            } else {
                document.getElementById("passwordError").textContent = data.message;
            }
        })
        .catch(error => console.error("Error:", error));
    });
});
