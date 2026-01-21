/**
 * Auth Helper for Kids Portal
 * - Checks if user is logged in
 * - Updates Sidebar with Profile Pic & Name
 * - Changes Login link to Logout
 */

document.addEventListener("DOMContentLoaded", () => {
    const userStr = localStorage.getItem('kidsUser');
    const sidebar = document.getElementById('sidebar');

    if (userStr && sidebar) {
        const user = JSON.parse(userStr);

        // Find the Login Link
        const loginLink = sidebar.querySelector('a[href="auth.html"]');

        if (loginLink) {
            // Create Profile Container
            const profileDiv = document.createElement('div');
            profileDiv.style.textAlign = 'center';
            profileDiv.style.marginBottom = '20px';
            profileDiv.style.padding = '10px';
            profileDiv.style.borderBottom = '1px solid #eee';

            // Profile Image
            if (user.profileImage) {
                const img = document.createElement('img');
                img.src = user.profileImage;
                img.style.width = '80px';
                img.style.height = '80px';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                img.style.border = '3px solid #b30000';
                img.style.marginBottom = '10px';
                profileDiv.appendChild(img);
            }

            // Name
            const name = document.createElement('p');
            name.textContent = user.fullname || 'Friend';
            name.style.fontWeight = 'bold';
            name.style.color = '#333';
            name.style.margin = '0';
            profileDiv.appendChild(name);

            // Add Role Badge
            if (user.role) {
                const role = document.createElement('span');
                role.textContent = user.role.toUpperCase();
                role.style.fontSize = '0.7rem';
                role.style.backgroundColor = '#b30000';
                role.style.color = 'white';
                role.style.padding = '2px 6px';
                role.style.borderRadius = '4px';
                profileDiv.appendChild(role);
            }

            // Insert Profile before the first link or at top
            sidebar.insertBefore(profileDiv, sidebar.firstChild);

            // Change Login to Logout
            loginLink.innerHTML = '🚪 Logout';
            loginLink.href = '#';
            loginLink.style.color = '#333';
            loginLink.style.border = '1px solid #ddd';

            loginLink.onclick = (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to logout?")) {
                    localStorage.removeItem('kidsToken');
                    localStorage.removeItem('kidsUser');
                    window.location.href = 'auth.html';
                }
            };
        }

        // ----------------------------------------------------
        // NEW: Add Profile to Header (Visible on Mobile/Desktop)
        // ----------------------------------------------------
        const header = document.querySelector('header');
        if (header && user.profileImage) {
            // Check if already exists
            if (!header.querySelector('.header-profile')) {
                const headerProfile = document.createElement('div');
                headerProfile.className = 'header-profile';
                headerProfile.style.marginLeft = 'auto'; // Push to right
                headerProfile.style.display = 'flex';
                headerProfile.style.alignItems = 'center';
                headerProfile.style.gap = '10px';
                headerProfile.style.cursor = 'pointer';

                headerProfile.innerHTML = `
                    <div style="text-align: right; margin-right: 5px; display: none; @media(min-width:600px){display:block;}">
                        <span style="display:block; font-size: 0.8rem; font-weight: bold; line-height: 1;">${user.fullname.split(' ')[0]}</span>
                        <span style="display:block; font-size: 0.7rem; opacity: 0.9;">${user.role ? user.role.toUpperCase() : 'KID'}</span>
                    </div>
                    <img src="${user.profileImage}" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                `;

                // Logout on click
                headerProfile.onclick = () => {
                    if (confirm(`Hi ${user.fullname}, want to logout?`)) {
                        localStorage.removeItem('kidsToken');
                        localStorage.removeItem('kidsUser');
                        window.location.href = 'auth.html';
                    }
                };

                header.appendChild(headerProfile);
            }
        }
    }
});
