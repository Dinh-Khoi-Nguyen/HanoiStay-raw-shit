/**
 * HanoiStay - Main Application JavaScript
 * PropTech Platform for Room Rentals in Hanoi
 */

// ==========================================================================
// 1. DATABASE - Room Listings
// ==========================================================================
const rooms = [
    {
        id: 1, 
        title: "Studio Cầu Giấy View Hồ", 
        price: 5.5, 
        district: "Cầu Giấy", 
        type: "Studio", 
        area: 35, 
        lat: 21.0350, 
        lng: 105.7950, 
        address: "Quan Hoa, Cầu Giấy", 
        img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", 
        host: {phone: "0912345678"},
        costs: { 
            elec: "3.8k", 
            water: "100k", 
            bike: "Free", 
            service: "150k" 
        },
        amenities: ["Máy lạnh", "Tủ lạnh", "Gác", "Wifi"]
    },
    {
        id: 2, 
        title: "Chung cư Mini Đống Đa", 
        price: 4.0, 
        district: "Đống Đa", 
        type: "Mini", 
        area: 30, 
        lat: 21.0150, 
        lng: 105.8200, 
        address: "Ngõ 10 Láng Hạ", 
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", 
        host: {phone: "0988777666"},
        costs: { 
            elec: "4k", 
            water: "25k", 
            bike: "100k", 
            service: "200k" 
        },
        amenities: ["Nóng lạnh", "Thang máy", "An ninh", "Máy giặt"]
    },
    {
        id: 3, 
        title: "Phòng trọ Thanh Xuân", 
        price: 2.8, 
        district: "Thanh Xuân", 
        type: "Tro", 
        area: 20, 
        lat: 20.9950, 
        lng: 105.8050, 
        address: "Nguyễn Trãi", 
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", 
        host: {phone: "0911222333"},
        costs: { 
            elec: "3.5k", 
            water: "80k", 
            bike: "50k", 
            service: "Vệ sinh" 
        },
        amenities: ["Chỗ để xe", "Wifi"]
    }
];

// News Articles Database
const newsList = [
    {
        title: "Dự báo giá thuê nhà 2025", 
        date: "20/10", 
        img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600"
    },
    {
        title: "Top 5 khu vực đáng sống nhất", 
        date: "18/10", 
        img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600"
    }
];

// All Available Amenities
const allAmenities = [
    "Máy lạnh", 
    "Tủ lạnh", 
    "Gác", 
    "Nóng lạnh", 
    "Thang máy", 
    "An ninh", 
    "Wifi", 
    "Máy giặt"
];

// ==========================================================================
// 2. MAIN APPLICATION CONTROLLER
// ==========================================================================
const app = {
    // Map instance and markers
    map: null, 
    circle: null, 
    markers: [],
    
    // Current filter state
    priceFilter: 'all',

    /**
     * Initialize the application
     */
    init() {
        this.renderRooms(rooms);
        this.renderNews();
        this.initMap();
        
        // Setup radius slider
        const radiusRange = document.getElementById('radiusRange');
        if (radiusRange) {
            radiusRange.addEventListener('input', (e) => {
                document.getElementById('radiusVal').innerText = e.target.value + " KM";
            });
        }
    },

    /**
     * Navigate between different views
     * @param {string} view - The view name to navigate to
     */
    nav(view) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => {
            el.classList.remove('active');
        });
        
        // Show selected view
        const viewElement = document.getElementById('view-' + view);
        if (viewElement) {
            viewElement.classList.add('active');
        }
        
        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
        });
        
        const navLink = document.getElementById('l-' + view);
        if (navLink) {
            navLink.classList.add('active');
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Refresh map if navigating to map view
        if (view === 'map' && this.map) {
            setTimeout(() => this.map.invalidateSize(), 200);
        }
    },

    /**
     * Initialize Leaflet map
     */
    initMap() {
        const mapElement = document.getElementById('scanMap');
        if (!mapElement) return;
        
        // Create map centered on Hanoi
        this.map = L.map('scanMap').setView([21.0285, 105.8542], 13);
        
        // Add dark theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
            attribution: '© OpenStreetMap' 
        }).addTo(this.map);
    },

    /**
     * Scan map for rooms within radius
     */
    scanMap() {
        if (!this.map) return;
        
        const center = this.map.getCenter();
        const radiusKm = document.getElementById('radiusRange').value;
        const radiusMeters = radiusKm * 1000;
        
        // Remove existing circle and markers
        if (this.circle) {
            this.map.removeLayer(this.circle);
        }
        
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
        
        // Draw new circle
        this.circle = L.circle(center, { 
            color: '#D4AF37', 
            fillColor: '#D4AF37', 
            fillOpacity: 0.1, 
            radius: radiusMeters 
        }).addTo(this.map);
        
        // Fit map to circle bounds
        this.map.fitBounds(this.circle.getBounds());
        
        // Find rooms within radius
        const found = [];
        const resDiv = document.getElementById('mapResults');
        resDiv.innerHTML = '';
        
        rooms.forEach(room => {
            const distance = this.map.distance(center, [room.lat, room.lng]);
            
            if (distance <= radiusMeters) {
                found.push(room);
                
                // Add marker to map
                const marker = L.marker([room.lat, room.lng])
                    .addTo(this.map)
                    .bindPopup(`<b>${room.title}</b>`);
                this.markers.push(marker);
                
                // Add to results sidebar
                resDiv.innerHTML += `
                    <div class="map-result" onclick="app.showDetail(${room.id})">
                        <img src="${room.img}" class="map-thumb">
                        <div>
                            <div style="font-size:13px; color:white;">${room.title}</div>
                            <div style="color:var(--gold-primary); font-size:12px;">${room.price} Tr</div>
                        </div>
                    </div>
                `;
            }
        });
    },

    /**
     * Render room cards to grid
     * @param {Array} list - Array of room objects
     */
    renderRooms(list) {
        const grid = document.getElementById('roomGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;
        
        if (list.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        grid.innerHTML = list.map(room => `
            <div class="card" onclick="app.showDetail(${room.id})" style="cursor:pointer">
                <div class="room-img-wrap">
                    <span class="room-status">CÒN PHÒNG</span>
                    <img src="${room.img}" class="room-img" alt="${room.title}">
                </div>
                <div class="room-body">
                    <h3 class="room-title">${room.title}</h3>
                    <div class="room-addr">
                        <i class="fas fa-map-marker-alt text-gold"></i> 
                        ${room.district}
                    </div>
                    <span class="room-price">${room.price} TRIỆU</span>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render news articles
     */
    renderNews() {
        const list = document.getElementById('newsList');
        if (!list) return;
        
        list.innerHTML = newsList.map(news => `
            <div class="news-side-item" onclick="alert('Đọc tin')">
                <img src="${news.img}" class="news-side-img" alt="${news.title}">
                <div class="news-side-info">
                    <span>${news.date}</span>
                    <h4>${news.title}</h4>
                </div>
            </div>
        `).join('');
    },

    /**
     * Show room detail modal
     * @param {number} id - Room ID
     */
    showDetail(id) {
        const room = rooms.find(r => r.id === id);
        if (!room) return;

        // Populate modal with room data
        const elements = {
            dImg: document.getElementById('dImg'),
            dTitle: document.getElementById('dTitle'),
            dPrice: document.getElementById('dPrice'),
            dAddr: document.getElementById('dAddr'),
            cElec: document.getElementById('cElec'),
            cWater: document.getElementById('cWater'),
            cBike: document.getElementById('cBike'),
            cService: document.getElementById('cService'),
            dMap: document.getElementById('dMap'),
            amenityList: document.getElementById('amenityList')
        };

        // Set basic info
        if (elements.dImg) elements.dImg.src = room.img;
        if (elements.dTitle) elements.dTitle.innerText = room.title;
        if (elements.dPrice) {
            elements.dPrice.innerText = room.price.toLocaleString('vi-VN') + ",000,000 VNĐ";
        }
        if (elements.dAddr) elements.dAddr.innerText = room.address;

        // Set costs
        if (elements.cElec) elements.cElec.innerText = room.costs.elec;
        if (elements.cWater) elements.cWater.innerText = room.costs.water;
        if (elements.cBike) elements.cBike.innerText = room.costs.bike;
        if (elements.cService) elements.cService.innerText = room.costs.service;

        // Render amenities checklist
        if (elements.amenityList) {
            elements.amenityList.innerHTML = allAmenities.map(amenity => {
                const hasAmenity = room.amenities.includes(amenity);
                const icon = hasAmenity 
                    ? '<i class="fas fa-check" style="color:var(--success)"></i>' 
                    : '<i class="fas fa-times" style="color:var(--danger)"></i>';
                return `<div class="am-item">${icon} ${amenity}</div>`;
            }).join('');
        }

        // Set map iframe
        if (elements.dMap) {
            const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(room.address + ", Hà Nội")}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            elements.dMap.src = mapUrl;
        }

        // Show modal
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('open'), 10);
        }
    },

    /**
     * Close detail modal
     */
    closeModal() {
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.classList.remove('open');
            modal.style.display = 'none';
        }
    },

    /**
     * Call host phone number
     */
    callHost() {
        const title = document.getElementById('dTitle')?.innerText;
        const room = rooms.find(r => r.title === title);
        
        if (room && room.host && room.host.phone) {
            window.open(`tel:${room.host.phone}`);
        }
    },

    /**
     * Set price filter
     * @param {string} val - Price range value
     * @param {HTMLElement} btn - Button element
     */
    setPrice(val, btn) {
        this.priceFilter = val;
        
        // Update active button
        document.querySelectorAll('.price-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        if (btn) {
            btn.classList.add('active');
        }
    },

    /**
     * Execute search with filters
     */
    search() {
        const distSelect = document.getElementById('sDist');
        const typeSelect = document.getElementById('sType');
        
        const district = distSelect ? distSelect.value : 'all';
        const type = typeSelect ? typeSelect.value : 'all';
        const price = this.priceFilter;
        
        // Start with all rooms
        let results = [...rooms];
        
        // Filter by district
        if (district !== 'all') {
            results = results.filter(r => r.district === district);
        }
        
        // Filter by type
        if (type !== 'all') {
            results = results.filter(r => r.type === type);
        }
        
        // Filter by price range
        if (price === 'low') {
            results = results.filter(r => r.price < 3);
        } else if (price === 'mid') {
            results = results.filter(r => r.price >= 3 && r.price <= 5);
        } else if (price === 'high') {
            results = results.filter(r => r.price > 5 && r.price <= 8);
        } else if (price === 'vip') {
            results = results.filter(r => r.price > 8 && r.price <= 12);
        } else if (price === 'max') {
            results = results.filter(r => r.price > 12);
        }
        
        // Render filtered results
        this.renderRooms(results);
        
        // Scroll to results
        const listingSection = document.querySelector('.listing-section');
        if (listingSection) {
            listingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// ==========================================================================
// 3. CHATBOT CONTROLLER
// ==========================================================================
const chatbot = {
    /**
     * Toggle chatbot window visibility
     */
    toggle() {
        const window = document.getElementById('chatWindow');
        if (!window) return;
        
        if (window.style.display === 'flex') {
            window.style.display = 'none';
        } else {
            window.style.display = 'flex';
        }
    },

    /**
     * Send user message
     */
    send() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;
        
        // Add user message
        this.add(text, 'user');
        
        // Clear input
        input.value = '';
        
        // Simulate bot response
        setTimeout(() => {
            this.add("Liên hệ 1900 9999 để được hỗ trợ.", 'bot');
        }, 1000);
    },

    /**
     * Add message to chat
     * @param {string} txt - Message text
     * @param {string} type - Message type ('user' or 'bot')
     */
    add(txt, type) {
        const chatBody = document.getElementById('chatBody');
        if (!chatBody) return;
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${type}`;
        msgDiv.innerText = txt;
        
        chatBody.appendChild(msgDiv);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }
};

// Handle Enter key in chat input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                chatbot.send();
            }
        });
    }
});

// ==========================================================================
// 4. AUTH CONTROLLER
// ==========================================================================
const Auth = {
    /**
     * Open authentication modal
     * @param {string} type - Auth type ('login' or 'register')
     */
    open(type) {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
};

// ==========================================================================
// 5. INITIALIZE APPLICATION
// ==========================================================================
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    // DOM is already ready
    app.init();
}
