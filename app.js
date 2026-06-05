// KATARIx Website Scripts

// Backend API Base URL
// In development, it points to localhost. For production, replace with your Render backend URL.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://katarix-backend.onrender.com/api'; // Update this with your Render URL when deployed

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initContactForm();
    initAdminPanel();
});

// 1. Navigation & Header Effects
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Toggle
    if (burger) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            navLinks.classList.toggle('nav-active');
            
            // Animate Links
            navItems.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `fadeInUp 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation
            burger.classList.toggle('toggle');
        });
    }
}

// 2. Contact Form Submission
function initContactForm() {
    const contactForm = document.getElementById('contact-inquiry-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                alert('Thank you for reaching out! We have received your inquiry.');
                contactForm.reset();
            } else {
                // Server validation / DB error
                alert(`Error: ${result.message || 'Something went wrong. Please try again.'}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Could not connect to the server. Please verify your backend server is running.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// 3. Admin Panel Logic
async function initAdminPanel() {
    const adminContainer = document.getElementById('admin-dashboard');
    if (!adminContainer) return;

    const passcodeSection = document.getElementById('passcode-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const passcodeForm = document.getElementById('passcode-form');
    const passcodeInput = document.getElementById('admin-passcode');
    const inquiriesTableBody = document.getElementById('inquiries-table-body');
    const logoutBtn = document.getElementById('logout-btn');

    // Check if we already have a passcode in session
    let savedPasscode = sessionStorage.getItem('katarix_passcode');

    if (savedPasscode) {
        showDashboard(savedPasscode);
    }

    if (passcodeForm) {
        passcodeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredPasscode = passcodeInput.value;
            showDashboard(enteredPasscode);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('katarix_passcode');
            dashboardSection.style.display = 'none';
            passcodeSection.style.display = 'block';
            if (passcodeInput) passcodeInput.value = '';
        });
    }

    async function showDashboard(passcode) {
        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                headers: {
                    'x-admin-passcode': passcode
                }
            });

            if (response.status === 401 || response.status === 403) {
                alert('Invalid Passcode!');
                sessionStorage.removeItem('katarix_passcode');
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error fetching data');
            }

            // Save passcode for session continuity
            sessionStorage.setItem('katarix_passcode', passcode);

            // Hide passcode login and show dashboard
            passcodeSection.style.display = 'none';
            dashboardSection.style.display = 'block';

            // Render table
            inquiriesTableBody.innerHTML = '';
            
            if (data.length === 0) {
                inquiriesTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-secondary);">No inquiries found.</td>
                    </tr>
                `;
                return;
            }

            data.forEach(item => {
                const date = new Date(item.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge badge-new">New</span></td>
                    <td><strong>${escapeHTML(item.name)}</strong><br><small style="color: var(--text-secondary)">${escapeHTML(item.email)}</small></td>
                    <td><span style="color: var(--accent-cyan)">${escapeHTML(item.service)}</span></td>
                    <td style="max-width: 300px; word-break: break-all;">${escapeHTML(item.message)}</td>
                    <td style="font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">${date}</td>
                `;
                inquiriesTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error loading dashboard:', error);
            alert(`Error loading data: ${error.message}`);
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}
