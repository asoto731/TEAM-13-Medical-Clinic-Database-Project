document.getElementById('btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const message  = document.getElementById('message');

    if (!username || !password) {
        message.textContent = 'Please enter your username and password.';
        return;
    }

    try {
        const res = await fetch('/api/staff/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            message.style.color = '#1f6d45';
            message.textContent = 'Login successful. Redirecting...';
            localStorage.setItem('clinicUser', JSON.stringify(data.user));
            const role = data.user.role;
            let dest = '/client/portals/staff_dashboard.html';
            if (role === 'physician') dest = '/client/portals/physician_dashboard.html';
            if (role === 'admin')     dest = '/client/portals/admin_dashboard.html';
            setTimeout(() => {
                window.location.href = dest;
            }, 1000);
        } else {
            message.style.color = '#c0392b';
            message.textContent = data.message || 'Invalid username or password.';
        }
    } catch (err) {
        message.style.color = '#c0392b';
        message.textContent = 'Unable to connect to server. Please try again.';
    }
});
