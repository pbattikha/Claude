// API Base URL
const API_BASE = 'http://localhost:3001/api';
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentContent = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showDashboard();
    } else {
        showLoginPage();
    }
});

// Login Form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showError('loginError', data.error);
            return;
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        showError('loginError', error.message);
    }
});

// Show Login Page
function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('currentUser').textContent = currentUser.username;
    document.getElementById('currentRole').textContent = currentUser.role.toUpperCase();
    document.getElementById('currentRole').className = `badge badge-${currentUser.role}`;

    // Show/hide admin features
    if (currentUser.role !== 'admin') {
        document.getElementById('addUserBtn').style.display = 'none';
        document.querySelector('[data-section="users"]').style.display = 'none';
    }

    loadAllContent();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.reload();
    });

    // Publish
    document.getElementById('publishBtn').addEventListener('click', publishChanges);

    // Form Submissions
    document.getElementById('heroForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.hero = {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            description: document.getElementById('heroDescription').value
        };
        await saveContent();
    });

    document.getElementById('aboutForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.about = {
            title: document.getElementById('aboutTitle').value,
            description: document.getElementById('aboutDescription').value,
            vision: document.getElementById('aboutVision').value
        };
        await saveContent();
    });

    document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        currentContent.contact = {
            address: document.getElementById('contactAddress').value,
            phone: document.getElementById('contactPhone').value,
            email: document.getElementById('contactEmail').value,
            hours: document.getElementById('contactHours').value
        };
        await saveContent();
    });

    // Image uploads
    document.querySelectorAll('.image-input').forEach(input => {
        input.addEventListener('change', handleImageUpload);
    });

    document.querySelectorAll('.image-upload-box').forEach(box => {
        box.addEventListener('click', (e) => {
            e.currentTarget.querySelector('.image-input').click();
        });

        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.style.background = 'rgba(0, 166, 166, 0.1)';
        });

        box.addEventListener('dragleave', (e) => {
            e.currentTarget.style.background = '';
        });

        box.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const input = e.currentTarget.querySelector('.image-input');
                input.files = files;
                handleImageUpload({ target: input });
            }
        });
    });

    // Modal close
    document.querySelector('.close')?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) closeModal();
    });
}

// Switch Section
function switchSection(sectionName) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionName}-section`).classList.add('active');

    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'rooms') {
        renderRooms();
    } else if (sectionName === 'steam') {
        renderSteam();
    } else if (sectionName === 'testimonials') {
        renderTestimonials();
    } else if (sectionName === 'navigation') {
        renderNavigation();
    } else if (sectionName === 'users') {
        renderUsers();
    }
}

// Load all content
async function loadAllContent() {
    try {
        const response = await fetch(`${API_BASE}/content`);
        currentContent = await response.json();
        populateFormFields();
        updateDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Populate form fields
function populateFormFields() {
    if (currentContent.hero) {
        document.getElementById('heroTitle').value = currentContent.hero.title || '';
        document.getElementById('heroSubtitle').value = currentContent.hero.subtitle || '';
        document.getElementById('heroDescription').value = currentContent.hero.description || '';
    }

    if (currentContent.about) {
        document.getElementById('aboutTitle').value = currentContent.about.title || '';
        document.getElementById('aboutDescription').value = currentContent.about.description || '';
        document.getElementById('aboutVision').value = currentContent.about.vision || '';
    }

    if (currentContent.contact) {
        document.getElementById('contactAddress').value = currentContent.contact.address || '';
        document.getElementById('contactPhone').value = currentContent.contact.phone || '';
        document.getElementById('contactEmail').value = currentContent.contact.email || '';
        document.getElementById('contactHours').value = currentContent.contact.hours || '';
    }
}

// Save content
async function saveContent() {
    try {
        const response = await fetch(`${API_BASE}/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(currentContent)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error);
        }

        showNotification('Content saved successfully!');
        updateLastSaved();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle image upload
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        showNotification('Image uploaded successfully!');

        // Display preview
        const preview = e.target.closest('.form-group').querySelector('.image-preview');
        if (preview) {
            const img = document.createElement('div');
            img.className = 'image-item';
            img.innerHTML = `<img src="${data.url}" alt="uploaded"><button class="image-remove" onclick="this.parentElement.remove()">&times;</button>`;
            preview.appendChild(img);
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Render rooms
function renderRooms() {
    const list = document.getElementById('roomsList');
    list.innerHTML = '';

    if (!currentContent.rooms) currentContent.rooms = [];

    currentContent.rooms.forEach((room, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${room.name}</div>
                <div class="list-item-desc">Ages: ${room.ageGroup} | Capacity: ${room.capacity}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editRoom(${index})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteRoom(${index})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(item);
    });
}

function editRoom(index) {
    const room = currentContent.rooms[index];
    showModal(`
        <h2>Edit Room</h2>
        <form onsubmit="saveRoom(${index}, event)">
            <div class="form-group">
                <label>Room Name</label>
                <input type="text" id="roomName" value="${room.name}" required>
            </div>
            <div class="form-group">
                <label>Age Group</label>
                <input type="text" id="roomAge" value="${room.ageGroup}" required>
            </div>
            <div class="form-group">
                <label>Capacity</label>
                <input type="number" id="roomCapacity" value="${room.capacity}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save Room</button>
        </form>
    `);
}

function addRoom() {
    showModal(`
        <h2>Add New Room</h2>
        <form onsubmit="saveRoom(null, event)">
            <div class="form-group">
                <label>Room Name</label>
                <input type="text" id="roomName" placeholder="e.g., Room 1" required>
            </div>
            <div class="form-group">
                <label>Age Group</label>
                <input type="text" id="roomAge" placeholder="e.g., 6 weeks - 12 months" required>
            </div>
            <div class="form-group">
                <label>Capacity</label>
                <input type="number" id="roomCapacity" placeholder="e.g., 10" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add Room</button>
        </form>
    `);
}

function saveRoom(index, event) {
    event.preventDefault();

    if (!currentContent.rooms) currentContent.rooms = [];

    const room = {
        id: index !== null ? currentContent.rooms[index].id : Date.now(),
        name: document.getElementById('roomName').value,
        ageGroup: document.getElementById('roomAge').value,
        capacity: parseInt(document.getElementById('roomCapacity').value)
    };

    if (index !== null) {
        currentContent.rooms[index] = room;
    } else {
        currentContent.rooms.push(room);
    }

    saveContent();
    renderRooms();
    closeModal();
}

function deleteRoom(index) {
    if (confirm('Delete this room?')) {
        currentContent.rooms.splice(index, 1);
        saveContent();
        renderRooms();
    }
}

// STEAM management
function renderSteam() {
    const list = document.getElementById('steamList');
    list.innerHTML = '';

    if (!currentContent.steam) currentContent.steam = [];

    currentContent.steam.forEach((item, index) => {
        const elem = document.createElement('div');
        elem.className = 'list-item';
        elem.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${item.title}</div>
                <div class="list-item-desc">${item.description}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editSteam(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteSteam(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(elem);
    });
}

function addSteam() {
    showModal(`
        <h2>Add STEAM Discipline</h2>
        <form onsubmit="saveSteam(null, event)">
            <div class="form-group">
                <label>Discipline Name</label>
                <input type="text" id="steamTitle" placeholder="e.g., Science" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="steamDesc" rows="3" placeholder="Describe this discipline..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add</button>
        </form>
    `);
}

function editSteam(index) {
    const item = currentContent.steam[index];
    showModal(`
        <h2>Edit STEAM Discipline</h2>
        <form onsubmit="saveSteam(${index}, event)">
            <div class="form-group">
                <label>Discipline Name</label>
                <input type="text" id="steamTitle" value="${item.title}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="steamDesc" rows="3" required>${item.description}</textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save</button>
        </form>
    `);
}

function saveSteam(index, event) {
    event.preventDefault();

    if (!currentContent.steam) currentContent.steam = [];

    const item = {
        id: index !== null ? currentContent.steam[index].id : Date.now(),
        title: document.getElementById('steamTitle').value,
        description: document.getElementById('steamDesc').value
    };

    if (index !== null) {
        currentContent.steam[index] = item;
    } else {
        currentContent.steam.push(item);
    }

    saveContent();
    renderSteam();
    closeModal();
}

function deleteSteam(index) {
    if (confirm('Delete this discipline?')) {
        currentContent.steam.splice(index, 1);
        saveContent();
        renderSteam();
    }
}

// Testimonials management
function renderTestimonials() {
    const list = document.getElementById('testimonialsList');
    list.innerHTML = '';

    if (!currentContent.testimonials) currentContent.testimonials = [];

    currentContent.testimonials.forEach((item, index) => {
        const elem = document.createElement('div');
        elem.className = 'list-item';
        elem.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${item.name}</div>
                <div class="list-item-desc">"${item.text.substring(0, 100)}..."</div>
                <div class="list-item-desc" style="margin-top: 5px;">⭐ ${item.rating || 5}/5</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editTestimonial(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteTestimonial(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(elem);
    });
}

function addTestimonial() {
    showModal(`
        <h2>Add Testimonial</h2>
        <form onsubmit="saveTestimonial(null, event)">
            <div class="form-group">
                <label>Parent Name</label>
                <input type="text" id="testName" placeholder="e.g., Sarah Smith" required>
            </div>
            <div class="form-group">
                <label>Testimonial</label>
                <textarea id="testText" rows="4" placeholder="What parents are saying..." required></textarea>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                <select id="testRating">
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add Testimonial</button>
        </form>
    `);
}

function editTestimonial(index) {
    const item = currentContent.testimonials[index];
    showModal(`
        <h2>Edit Testimonial</h2>
        <form onsubmit="saveTestimonial(${index}, event)">
            <div class="form-group">
                <label>Parent Name</label>
                <input type="text" id="testName" value="${item.name}" required>
            </div>
            <div class="form-group">
                <label>Testimonial</label>
                <textarea id="testText" rows="4" required>${item.text}</textarea>
            </div>
            <div class="form-group">
                <label>Rating (1-5)</label>
                <select id="testRating">
                    <option value="5" ${item.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4" ${item.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3" ${item.rating === 3 ? 'selected' : ''}>⭐⭐⭐ 3 Stars</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save</button>
        </form>
    `);
}

function saveTestimonial(index, event) {
    event.preventDefault();

    if (!currentContent.testimonials) currentContent.testimonials = [];

    const item = {
        id: index !== null ? currentContent.testimonials[index].id : Date.now(),
        name: document.getElementById('testName').value,
        text: document.getElementById('testText').value,
        rating: parseInt(document.getElementById('testRating').value)
    };

    if (index !== null) {
        currentContent.testimonials[index] = item;
    } else {
        currentContent.testimonials.push(item);
    }

    saveContent();
    renderTestimonials();
    closeModal();
}

function deleteTestimonial(index) {
    if (confirm('Delete this testimonial?')) {
        currentContent.testimonials.splice(index, 1);
        saveContent();
        renderTestimonials();
    }
}

// Navigation menu management
function renderNavigation() {
    const list = document.getElementById('navigationList');
    list.innerHTML = '';

    if (!currentContent.navigation) currentContent.navigation = [];

    currentContent.navigation.forEach((item, index) => {
        const elem = document.createElement('div');
        elem.className = 'list-item';
        elem.innerHTML = `
            <div class="list-item-content">
                <div class="list-item-title">${item.label}</div>
                <div class="list-item-desc">${item.url}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-edit" onclick="editMenuItem(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteMenuItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.appendChild(elem);
    });
}

function addMenuItem() {
    showModal(`
        <h2>Add Menu Item</h2>
        <form onsubmit="saveMenuItem(null, event)">
            <div class="form-group">
                <label>Menu Label</label>
                <input type="text" id="menuLabel" placeholder="e.g., About" required>
            </div>
            <div class="form-group">
                <label>URL or Section</label>
                <input type="text" id="menuUrl" placeholder="e.g., #about" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Add</button>
        </form>
    `);
}

function editMenuItem(index) {
    const item = currentContent.navigation[index];
    showModal(`
        <h2>Edit Menu Item</h2>
        <form onsubmit="saveMenuItem(${index}, event)">
            <div class="form-group">
                <label>Menu Label</label>
                <input type="text" id="menuLabel" value="${item.label}" required>
            </div>
            <div class="form-group">
                <label>URL or Section</label>
                <input type="text" id="menuUrl" value="${item.url}" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Save</button>
        </form>
    `);
}

function saveMenuItem(index, event) {
    event.preventDefault();

    if (!currentContent.navigation) currentContent.navigation = [];

    const item = {
        id: index !== null ? currentContent.navigation[index].id : Date.now(),
        label: document.getElementById('menuLabel').value,
        url: document.getElementById('menuUrl').value
    };

    if (index !== null) {
        currentContent.navigation[index] = item;
    } else {
        currentContent.navigation.push(item);
    }

    saveContent();
    renderNavigation();
    closeModal();
}

function deleteMenuItem(index) {
    if (confirm('Delete this menu item?')) {
        currentContent.navigation.splice(index, 1);
        saveContent();
        renderNavigation();
    }
}

// Users management
async function renderUsers() {
    if (currentUser.role !== 'admin') return;

    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const users = await response.json();
        const list = document.getElementById('usersList');
        list.innerHTML = '';

        users.forEach(user => {
            const elem = document.createElement('div');
            elem.className = 'user-item';
            elem.innerHTML = `
                <div class="user-details">
                    <h4>${user.username}</h4>
                    <p>${user.email}</p>
                    <p><span class="badge badge-${user.role}">${user.role}</span></p>
                </div>
                <div class="user-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            list.appendChild(elem);
        });
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function openUserForm() {
    showModal(`
        <h2>Add New User</h2>
        <form onsubmit="createUser(event)">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="newUsername" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="newEmail" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="newPassword" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Create User</button>
        </form>
    `);
}

async function createUser(event) {
    event.preventDefault();

    const userData = {
        username: document.getElementById('newUsername').value,
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value
    };

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        showNotification('User created successfully!');
        renderUsers();
        closeModal();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Dashboard stats
function updateDashboard() {
    let count = 0;
    count += Object.keys(currentContent).length;

    document.getElementById('contentItemCount').textContent = count;
    document.getElementById('imageCount').textContent = '0'; // Would need file listing API
    document.getElementById('userCount').textContent = currentUser.role === 'admin' ? '...' : '1';
    document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString();
}

// Publish changes
async function publishChanges() {
    try {
        const message = prompt('Enter a publish message (optional):', 'Published content update');

        if (message === null) return;

        const response = await fetch(`${API_BASE}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        showNotification('Changes published successfully!');
        updateLastSaved();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Utilities
function updateLastSaved() {
    const now = new Date();
    document.getElementById('lastSaved').textContent = `Last saved: ${now.toLocaleTimeString()}`;
}

function showModal(content) {
    const modal = document.getElementById('modal');
    document.getElementById('modalBody').innerHTML = content;
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification active ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : ''}`;

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}
