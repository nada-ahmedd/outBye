// دالة مساعدة لجلب البيانات باستخدام الـ token
async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        console.error('No token or userId found');
        return null;
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
        const response = await fetch(url, {
            ...options,
            method: options.method || 'POST',
            body: options.body || new URLSearchParams({ users_id: userId }),
        });
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null;
        }
        const text = await response.text();
        console.log("Raw Response:", text);

        try {
            const data = JSON.parse(text);
            return data;
        } catch (e) {
            console.error("Error parsing response:", e);
            return null;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

// دالة لجلب بيانات البروفايل
async function fetchUserProfile() {
    // محاولة جلب البيانات من localStorage أولاً
    const profileData = localStorage.getItem('profileData');
    if (profileData) {
        return JSON.parse(profileData);
    }

    // لو مفيش بيانات في localStorage، نجيبها من الـ API
    const data = await fetchWithToken('https://abdulrahmanantar.com/outbye/profile/view.php');
    if (data && data.status === 'success' && data.data) {
        localStorage.setItem('profileData', JSON.stringify(data.data));
        return data.data;
    }
    return null;
}

// دالة تحديث الناف بار
async function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
    const signupBtn = document.getElementById('signupBtn');
    const userNameSpan = document.getElementById('userName');
    const userImage = document.getElementById('nav-user-image'); // الصورة في النافبار
    const logoutBtn = document.getElementById('logoutBtn');
    const cartIcon = document.getElementById('cartIcon');
    const dashboardBtn = document.getElementById('dashboardBtn');

    // التحقق من وجود العناصر في الـ DOM
    if (!signupBtn || !userNameSpan || !logoutBtn || !cartIcon || !dashboardBtn || !userImage) {
        console.error("Navbar elements not found!", { signupBtn, userNameSpan, logoutBtn, cartIcon, dashboardBtn, userImage });
        return;
    }

    // إظهار/إخفاء العناصر بناءً على حالة تسجيل الدخول
    signupBtn.style.display = isLoggedIn ? 'none' : 'block';
    logoutBtn.style.display = isLoggedIn || isAdminLoggedIn ? 'block' : 'none';
    cartIcon.style.display = 'block';
    dashboardBtn.style.display = isAdminLoggedIn ? 'inline-block' : 'none';

    // تحديث الصورة والاسم في الناف بار
    if (isLoggedIn || isAdminLoggedIn) {
        const profile = await fetchUserProfile();
        if (profile) {
            // إظهار الاسم
            const userName = profile.users_name || localStorage.getItem('email')?.split('@')[0] || 'User';
            userNameSpan.textContent = `Welcome, ${userName}`;
            userNameSpan.style.display = 'block';

            // إظهار الصورة فقط إذا كانت موجودة
            if (profile.users_image && profile.users_image.trim() !== '') {
                const imageUrl = `${profile.users_image}?t=${Date.now()}`; // إضافة cache-busting
                console.log("Attempting to load navbar image:", imageUrl); // للتأكد من الرابط
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    console.log("Navbar image loaded successfully:", imageUrl);
                    userImage.src = imageUrl;
                    userImage.style.display = 'block';
                };
                img.onerror = () => {
                    console.error("Failed to load navbar image:", imageUrl);
                    userImage.style.display = 'none';
                };
            } else {
                console.log("No image found in profile data");
                userImage.style.display = 'none';
            }
        } else {
            userNameSpan.style.display = 'none';
            userImage.style.display = 'none';
        }
    } else {
        userNameSpan.style.display = 'none';
        userImage.style.display = 'none';
    }

    // تفريغ حالة القلوب عند تسجيل الخروج
    if (!isLoggedIn && !isAdminLoggedIn) {
        localStorage.removeItem('favoritesCache');
        document.querySelectorAll(".favorite-btn").forEach(button => {
            const icon = button.querySelector("i");
            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");
            icon.style.color = "";
            delete button.dataset.favid;
        });
    }
}

// تحديث الناف بار عند تحميل الصفحة
window.addEventListener('load', async () => {
    await updateNavbar();

    // حدث الـ Cart Icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (event) => {
            event.preventDefault();
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Not Logged In',
                    text: 'You need to log in to view your cart!',
                    confirmButtonText: 'Login',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) window.location.href = 'signin.html';
                });
            } else {
                window.location.href = 'cart.html';
            }
        });
    } else {
        console.error("❌ Cart icon (#cartIcon) not found in the DOM");
    }

    // حدث الـ Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            localStorage.removeItem('token');
            localStorage.removeItem('profileData');
            localStorage.removeItem('resetEmail');
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminToken');
            await updateNavbar();

            Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been logged out successfully. Redirecting to login page.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = 'signin.html';
            });
        });
    }
});