async function fetchWithToken(url, options = {}) {
    try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
            console.error('No authentication token or userId found, redirecting to login', { token, userId });
            window.location.href = 'signin.html';
            throw new Error('No authentication token or userId found. Please log in again.');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        console.log("Sending request to:", url, "with options:", options);
        const response = await fetch(url, options);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Unauthorized, clearing localStorage and redirecting', { status: response.status });
                localStorage.clear();
                window.location.href = 'signin.html';
                throw new Error(`Unauthorized: ${response.statusText}. Please log in again.`);
            }
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const text = await response.text();
        console.log("Raw Profile API Response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Error parsing JSON response:", e, "Raw response:", text);
            throw new Error("Invalid JSON response from server");
        }

        console.log("Parsed Profile API Response:", data);
        return data;
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to the server. This might be due to CORS or network issues.');
        }
        throw error;
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    } else {
        console.error(`Error element with id '${elementId}' not found in the DOM.`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const form = this;
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => (data[key] = value));

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(data).toString(),
                });
                const result = await response.json();

                console.log("Signin API Response:", result);
                console.log("Status:", result.status);
                console.log("Message:", result.message);
                console.log("Data:", result.data);

                if (result.status === "success") {
                    const userId = result.user_id;
                    const token = result.token;

                    if (!userId || !token) {
                        console.error("Invalid login response:", { userId, token, response: result });
                        Swal.fire({
                            icon: 'error',
                            title: 'Login Failed',
                            text: 'Invalid response from server: Missing userId or token.',
                        });
                        submitButton.disabled = false;
                        submitButton.textContent = "Log In";
                        return;
                    }

                    console.log("User ID to be stored:", userId);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userId', userId);
                    localStorage.setItem('email', data.email || '');
                    localStorage.setItem('token', token);
                    localStorage.removeItem('resetEmail');

                    let profileResponse = null;
                    let retryCount = 0;
                    const maxRetries = 2;

                    while (retryCount < maxRetries) {
                        try {
                            profileResponse = await fetchWithToken('https://abdulrahmanantar.com/outbye/profile/view.php', {
                                method: 'POST',
                                body: new URLSearchParams({ users_id: userId })
                            });
                            break;
                        } catch (error) {
                            retryCount++;
                            console.error(`Attempt ${retryCount} failed:`, error);
                            if (retryCount === maxRetries) {
                                console.error("Max retries reached. Could not fetch profile data.");
                                throw error;
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    console.log("Profile API Response (Final):", profileResponse);

                    if (profileResponse && profileResponse.status === 'success' && profileResponse.data) {
                        localStorage.setItem('profileData', JSON.stringify(profileResponse.data));
                        console.log("Profile data stored:", profileResponse.data);
                    } else {
                        console.error("Failed to fetch profile data after login. Response:", profileResponse);
                        localStorage.setItem('profileData', JSON.stringify({ users_name: 'User' }));
                    }

                    if (typeof updateNavbar === 'function') {
                        await updateNavbar();
                        const signinBtn = document.getElementById('signinBtn');
                        const signupBtn = document.getElementById('signupBtn');
                        if (signinBtn && signupBtn) {
                            signinBtn.style.display = 'none';
                            signupBtn.style.display = 'none';
                        }
                    }

                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Login Successful!',
                            text: 'Redirecting to your profile...',
                            showConfirmButton: false,
                            timer: 2000
                        }).then((result) => {
                            if (result.dismiss === Swal.DismissReason.timer || result.dismiss === Swal.DismissReason.close) {
                                console.log('Timer or manual close finished, redirecting to profile.html');
                                window.location.href = "profile.html";
                            }
                        }).catch((error) => {
                            console.error('Error in SweetAlert:', error);
                            console.log('Forced redirect to profile.html due to error');
                            window.location.href = "profile.html";
                        });
                    } else {
                        console.error('SweetAlert2 is not loaded, performing direct redirect');
                        window.location.href = "profile.html";
                    }
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Login Failed',
                            text: result.message || 'Incorrect email or password.',
                        });
                    } else {
                        showError('form-error', result.message || 'Incorrect email or password.');
                    }
                }
            } catch (error) {
                console.error("Error:", error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Network Error',
                        text: 'Please try again later.',
                    });
                } else {
                    showError('form-error', 'Network Error: Please try again later.');
                }
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Log In";
            }
        });
    } else {
        console.error("Element with id 'loginForm' not found in the DOM.");
    }

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Forgot Password link clicked");
            document.getElementById('forgotPasswordModal').style.display = 'flex';
        });
    } else {
        console.error("Element with id 'forgotPasswordLink' not found in the DOM.");
    }

    const submitEmail = document.getElementById('submitEmail');
    if (submitEmail) {
        submitEmail.addEventListener('click', async () => {
            console.log("Submit Email button clicked");
            const email = document.getElementById('forgotEmail').value;

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError('emailError', 'Please enter a valid email.');
                return;
            }

            try {
                const response = await fetch('https://abdulrahmanantar.com/outbye/forgetpassword/checkemail.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ email })
                });
                const data = await response.json();
                console.log("Check Email API Response:", data);

                if (data.success) {
                    localStorage.setItem('resetEmail', email);
                    document.getElementById('forgotPasswordModal').style.display = 'none';
                    window.location.href = 'verify-code.html';
                } else {
                    showError('emailError', data.message || 'Email not found.');
                }
            } catch (error) {
                console.error('Error in checkEmail:', error);
                showError('emailError', 'Network Error: Please try again later.');
            }
        });
    } else {
        console.error("Element with id 'submitEmail' not found in the DOM.");
    }

    if (window.location.search.includes('reset=true')) {
        console.log("Reset Password modal triggered by URL");
        const resetPasswordModal = document.getElementById('resetPasswordModal');
        if (resetPasswordModal) {
            resetPasswordModal.style.display = 'flex';
        } else {
            console.error("Element with id 'resetPasswordModal' not found in the DOM.");
        }
    }

    const resetPassword = document.getElementById('resetPassword');
    if (resetPassword) {
        resetPassword.addEventListener('click', async () => {
            console.log("Reset Password button clicked");
            const email = localStorage.getItem('resetEmail');
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!email) {
                showError('passwordError', 'Email not found in storage.');
                return;
            }

            if (newPassword !== confirmPassword) {
                showError('passwordError', 'Passwords do not match.');
                return;
            }

            if (!newPassword || newPassword.length < 3) {
                showError('passwordError', 'Password must be at least 3 characters.');
                return;
            }

            try {
                const response = await fetch('https://abdulrahmanantar.com/outbye/forgetpassword/resetpassword.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ email, password: newPassword })
                });
                const data = await response.json();
                console.log("Reset Password API Response:", data);

                if (data.status === 'success') {
                    document.getElementById('resetPasswordModal').style.display = 'none';
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Password reset successfully',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        alert('Password reset successfully');
                    }
                    localStorage.removeItem('resetEmail');
                    window.location.href = 'signin.html';
                } else {
                    showError('passwordError', data.message || 'Failed to reset password.');
                }
            } catch (error) {
                console.error('Error in resetPassword:', error);
                showError('passwordError', 'Network Error: Please try again later.');
            }
        });
    } else {
        console.error("Element with id 'resetPassword' not found in the DOM.");
    }

    const googleSignupBtn = document.getElementById('googleSignupBtn');
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('https://abdulrahmanantar.com/outbye/auth/google_login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Google login response:", data);

                if (data.status && data.auth_url) {
                    let modifiedAuthUrl = data.auth_url;
                    if (!modifiedAuthUrl.includes('format=html')) {
                        modifiedAuthUrl = modifiedAuthUrl.includes('?')
                            ? `${modifiedAuthUrl}&format=html`
                            : `${modifiedAuthUrl}?format=html`;
                    }
                    console.log("Modified Auth URL:", modifiedAuthUrl);

                    const popup = window.open(modifiedAuthUrl, 'googleSignInPopup', 'width=600,height=600');

                    if (!popup) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Popup Blocked',
                            text: 'Please allow popups for this website and try again.',
                        });
                        return;
                    }

                    // الاستماع إلى رسالة postMessage من النافذة المنبثقة
                    window.addEventListener('message', function messageHandler(event) {
                        if (event.data && event.data.type === 'googleLoginSuccess') {
                            const { token, users_id, email } = event.data;
                            console.log("Received postMessage:", { token, users_id, email });

                            if (token && users_id) {
                                // حفظ البيانات في localStorage
                                localStorage.setItem('isLoggedIn', 'true');
                                localStorage.setItem('userId', users_id);
                                localStorage.setItem('token', token);
                                localStorage.setItem('email', email || '');
                                console.log("Set localStorage from postMessage:", { userId: users_id, token, email });

                                // عرض إشعار النجاح وإعادة التوجيه
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Login Successful!',
                                    text: 'Redirecting to your profile...',
                                    timer: 2000,
                                    showConfirmButton: false
                                }).then(() => {
                                    window.location.replace('profile.html');
                                });

                                // إزالة المستمع بعد النجاح
                                window.removeEventListener('message', messageHandler);
                            } else {
                                console.error("Missing token or users_id in postMessage data");
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Login Failed',
                                    text: 'Invalid authentication data received.',
                                });
                            }
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Google Login Failed',
                        text: data.message || 'Unable to start Google login.',
                    });
                }
            } catch (error) {
                console.error('Error during Google login:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Connection Error',
                    text: 'Unable to connect to the server. Please try again later.',
                });
            }
        });
    } else {
        console.error("Element with id 'googleSignupBtn' not found in the DOM.");
    }
});