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
      if (data.status === "success" && data.data) { // ✅ التأكد أن البيانات موجودة
        Swal.fire({
          icon: 'success',
          title: 'تم تسجيل الدخول بنجاح!',
          text: 'جاري إعادة التوجيه...',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          // ✅ تخزين البيانات بشكل صحيح
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', data.data.users_id); // ✅ حفظ ID المستخدم
          localStorage.setItem('email', data.data.users_email); // ✅ حفظ البريد الإلكتروني

          window.location.href = "index.html"; // ✅ التوجيه للصفحة الرئيسية
        });
      } else {
        displayFormError(form, data.message);
        Swal.fire({
          icon: 'error',
          title: 'فشل تسجيل الدخول',
          text: data.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.',
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'خطأ في الشبكة',
        text: 'يرجى المحاولة لاحقًا.',
      });
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.textContent = "تسجيل الدخول";
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
