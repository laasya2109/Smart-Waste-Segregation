/* ==========================================
   EcoStation - Map Module (map.js)
   ========================================== */

function initializeMap() {
    // Only initialize map once to prevent conflicts on tab toggles
    if (leafletMap) {
        leafletMap.invalidateSize();
        return;
    }

    // Centered coordinates zoom 5 for India view
    leafletMap = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    setupMapEventListeners();
    
    // Initialize with location off by default. Only turn on if user clicks "Use Current Location"
    disableLocation();
}

function setupMapEventListeners() {
    const geolocateBtn = document.getElementById('btn-map-geolocate');
    const categorySelect = document.getElementById('map-category-select');

    if (geolocateBtn) {
        geolocateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentMapCoords) {
                disableLocation();
            } else {
                autoDetectLocation();
            }
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            mapSelectedCategory = categorySelect.value;
            fetchAndRenderCenters();
        });
    }
}

function disableLocation() {
    currentMapCoords = null;
    updateLocationBadge("Location Off");
    updateLocationStatusCard(false, "Location not enabled.", "Showing all available recycling centers.");
    
    const geolocateBtn = document.getElementById('btn-map-geolocate');
    if (geolocateBtn) {
        geolocateBtn.classList.remove('location-active');
        geolocateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
    }
    
    fetchAndRenderCenters();
}

function autoDetectLocation() {
    updateLocationBadge("Detecting...");
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentMapCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateLocationBadge("GPS Active");
                updateLocationStatusCard(true, `GPS: ${currentMapCoords.lat.toFixed(4)}, ${currentMapCoords.lng.toFixed(4)}`, "Showing nearest recycling centers first.");
                
                const geolocateBtn = document.getElementById('btn-map-geolocate');
                if (geolocateBtn) {
                    geolocateBtn.classList.add('location-active');
                    geolocateBtn.innerHTML = '<i class="fas fa-location-slash"></i> Turn Off Location';
                }
                
                fetchAndRenderCenters();
            },
            (error) => {
                console.warn("Geolocation permission denied or failed:", error);
                // Case 2: Geolocation denied/failed
                currentMapCoords = null;
                updateLocationBadge("Location Off");
                updateLocationStatusCard(false, "Location not enabled.", "Showing all available recycling centers.");
                
                const geolocateBtn = document.getElementById('btn-map-geolocate');
                if (geolocateBtn) {
                    geolocateBtn.classList.remove('location-active');
                    geolocateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
                }
                
                fetchAndRenderCenters();
            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
    } else {
        currentMapCoords = null;
        updateLocationBadge("Location Off");
        updateLocationStatusCard(false, "Location not enabled.", "Showing all available recycling centers.");
        
        const geolocateBtn = document.getElementById('btn-map-geolocate');
        if (geolocateBtn) {
            geolocateBtn.classList.remove('location-active');
            geolocateBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
        }
        
        fetchAndRenderCenters();
    }
}

function updateLocationStatusCard(enabled, title, desc) {
    const statusTitleEl = document.getElementById('status-title');
    const statusDescEl = document.getElementById('status-desc');
    const statusCardEl = document.getElementById('map-location-status');
    const statusIconEl = statusCardEl ? statusCardEl.querySelector('i') : null;
    
    if (statusTitleEl) statusTitleEl.innerText = title;
    if (statusDescEl) statusDescEl.innerText = desc;
    
    if (statusCardEl) {
        if (enabled) {
            statusCardEl.style.background = "rgba(16, 185, 129, 0.05)";
            statusCardEl.style.borderColor = "#10b981";
            statusCardEl.style.color = "#047857";
            if (statusIconEl) {
                statusIconEl.className = "fas fa-circle-check";
                statusIconEl.style.color = "#10b981";
            }
        } else {
            statusCardEl.style.background = "rgba(239, 68, 68, 0.05)";
            statusCardEl.style.borderColor = "#ef4444";
            statusCardEl.style.color = "#b91c1c";
            if (statusIconEl) {
                statusIconEl.className = "fas fa-circle-exclamation";
                statusIconEl.style.color = "#ef4444";
            }
        }
    }
}

function updateLocationBadge(text) {
    const badge = document.getElementById('location-badge');
    if (badge) {
        badge.innerText = text;
        if (text.includes("GPS") || text.includes("Demo") || text.includes("Active")) {
            badge.style.background = "rgba(16, 185, 129, 0.1)";
            badge.style.color = "#10b981";
        } else if (text.includes("Off")) {
            badge.style.background = "rgba(239, 68, 68, 0.1)";
            badge.style.color = "#ef4444";
        } else {
            badge.style.background = "rgba(107, 114, 128, 0.1)";
            badge.style.color = "#4b5563";
        }
    }
}

function getWasteCategoryFromItem(itemName) {
    if (!itemName) return null;
    const lower = itemName.toLowerCase();
    if (lower.includes("battery") || lower.includes("charger") || lower.includes("phone") || lower.includes("keyboard") || lower.includes("electronic") || lower.includes("e-waste")) {
        return "E-Waste";
    }
    if (lower.includes("bottle") || lower.includes("plastic") || lower.includes("container") || lower.includes("bag")) {
        return "Plastic";
    }
    if (lower.includes("peel") || lower.includes("banana") || lower.includes("food") || lower.includes("organic") || lower.includes("leaf")) {
        return "Organic";
    }
    if (lower.includes("paper") || lower.includes("cardboard") || lower.includes("box") || lower.includes("newspaper")) {
        return "Paper";
    }
    if (lower.includes("glass") || lower.includes("jar")) {
        return "Glass";
    }
    if (lower.includes("can") || lower.includes("metal") || lower.includes("aluminum") || lower.includes("tin")) {
        return "Metal";
    }
    return null;
}

async function fetchAndRenderCenters() {
    if (!leafletMap) return;

    let url = `/api/recycling-centers?category=${encodeURIComponent(mapSelectedCategory)}`;
    if (currentMapCoords) {
        url += `&lat=${currentMapCoords.lat}&lng=${currentMapCoords.lng}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast("Failed to fetch recycling centers", "error");
            return;
        }

        const centers = data.centers;
        
        // Clear previous markers
        mapMarkers.forEach(m => leafletMap.removeLayer(m));
        mapMarkers = [];

        let searchLat = data.search_lat;
        let searchLng = data.search_lng;

        // Render "You are here 📍" marker (Case 1)
        if (searchLat && searchLng) {
            const userIcon = L.divIcon({
                className: 'custom-user-marker-container',
                html: `
                    <div class="custom-user-marker" style="background-color: #000080; border-color: #ffffff; position: relative;">
                        <!-- SVG Location Pin matching user logo style -->
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span class="marker-emoji-badge">📍</span>
                        <div class="user-pulse"></div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
                popupAnchor: [0, -18]
            });

            const userIndicator = L.marker([searchLat, searchLng], {
                icon: userIcon
            }).addTo(leafletMap).bindPopup("<div style='font-family: inherit; font-size:12.5px; font-weight:700; text-align: center;'>You are here 📍</div>");
            
            mapMarkers.push(userIndicator);
        }

        // Render Smart Recommendation Card
        const smartContainer = document.getElementById('smart-rec-container');
        if (smartContainer) {
            const targetCategory = getWasteCategoryFromItem(lastScannedItemName);
            if (targetCategory && searchLat && searchLng) {
                // Find first matching center from list (sorted by distance if GPS is enabled)
                const matchingCenter = centers.find(c => c.waste_type === targetCategory);
                if (matchingCenter) {
                    smartContainer.classList.remove('hidden');
                    
                    const distVal = matchingCenter.distance !== null ? `${matchingCenter.distance.toFixed(1)} km away` : "Nearby";
                    const distanceHtml = `📍 <strong>${distVal}</strong>`;

                    smartContainer.innerHTML = `
                        <div class="smart-recommendation-card" style="margin-bottom: 12px;">
                            <div class="smart-rec-header">
                                <i class="fas fa-sparkles"></i> Nearest E-Waste Center
                            </div>
                            <div class="smart-rec-body">
                                <div>Item Scanned: <strong>${lastScannedItemName}</strong></div>
                                <div style="margin-top: 4px; font-weight: 700; color: var(--text-primary);">${matchingCenter.name}</div>
                                <div id="smart-rec-distance" style="margin-top: 4px; font-size: 13px; color: var(--primary); font-weight: 800; display: flex; align-items: center; gap: 4px;">
                                    ${distanceHtml}
                                </div>
                            </div>
                            <button id="btn-smart-highlight" class="btn-smart-highlight" style="margin-top: 6px;">
                                Locate Facility 🗺️
                            </button>
                        </div>
                    `;

                    document.getElementById('btn-smart-highlight').addEventListener('click', () => {
                        leafletMap.setView([matchingCenter.latitude, matchingCenter.longitude], 15);
                        mapMarkers.forEach(m => {
                            if (m instanceof L.Marker && m.getLatLng().lat === matchingCenter.latitude && m.getLatLng().lng === matchingCenter.longitude) {
                                setTimeout(() => m.openPopup(), 200);
                            }
                        });
                    });
                } else {
                    smartContainer.classList.add('hidden');
                }
            } else {
                smartContainer.classList.add('hidden');
            }
        }

        const facilityContainer = document.getElementById('facility-list');
        facilityContainer.innerHTML = '';
        
        const countEl = document.getElementById('map-results-count');
        if (countEl) {
            countEl.innerText = `${centers.length} found`;
        }

        if (centers.length === 0) {
            facilityContainer.innerHTML = `
                <div class="empty-placeholder-card" style="text-align: center; padding: 28px 16px; border: 1.5px dashed rgba(16, 185, 129, 0.2); background: #fcfdfe; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; margin-top: 4px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-location-dot" style="font-size: 16px; color: #9ca3af;"></i>
                    </div>
                    <p style="font-size: 12.5px; color: #6b7280; font-weight: 600; line-height: 1.4; margin: 0; max-width: 220px;">
                        Please allow location access to find recycling centers near you.
                    </p>
                </div>
            `;
            if (searchLat && searchLng) {
                leafletMap.setView([searchLat, searchLng], 12);
            }
            return;
        }

        let fitBoundsCoords = [];
        if (searchLat && searchLng) {
            const nearestCenter = centers[0];
            const nearestDist = (nearestCenter && nearestCenter.distance !== null) ? nearestCenter.distance : 999999;
            if (nearestDist < 150) {
                fitBoundsCoords.push([searchLat, searchLng]);
            }
        }

        centers.forEach((facility, index) => {
            const isNearest = index === 0 && (searchLat !== null);
            
            const categoryColors = {
                "Plastic": "#138808", // Flag Green
                "Paper": "#ff9933", // Flag Saffron
                "Glass": "#000080", // Flag Navy Blue
                "Metal": "#000080", // Flag Navy Blue
                "Organic": "#138808", // Flag Green
                "E-Waste": "#ff9933" // Flag Saffron
            };
            const categoryEmojis = {
                "Plastic": "♻️",
                "Paper": "📄",
                "Glass": "🥛",
                "Metal": "🔩",
                "Organic": "🍃",
                "E-Waste": "🔋"
            };
            const color = categoryColors[facility.waste_type] || "#138808";
            const emoji = categoryEmojis[facility.waste_type] || "♻️";

            let markerClass = "plastic-marker";
            if (facility.waste_type === "E-Waste") markerClass = "e-waste-marker";
            else if (facility.waste_type === "Plastic") markerClass = "plastic-marker";
            else if (facility.waste_type === "Organic") markerClass = "organic-marker";
            else if (facility.waste_type === "Paper") markerClass = "paper-marker";
            else if (facility.waste_type === "Glass") markerClass = "glass-marker";
            else if (facility.waste_type === "Metal") markerClass = "metal-marker";

            const customIcon = L.divIcon({
                className: 'custom-map-marker-container',
                html: `
                    <div class="custom-map-marker ${markerClass}" style="background-color: ${color}; border-color: #ffffff; position: relative;">
                        <!-- SVG Location Pin matching user logo style -->
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span class="marker-emoji-badge">${emoji}</span>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });

            const marker = L.marker([facility.latitude, facility.longitude], {
                icon: customIcon
            }).addTo(leafletMap);

            const popupContent = `
                <div class="map-popup-bubble" style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px;">
                    <h4 style="font-size: 14.5px; font-weight: 800; color: var(--primary); margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
                        <span>${emoji}</span> <span>${facility.name}</span>
                    </h4>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: var(--text-secondary);"><strong>Category:</strong> ${facility.waste_type}</p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: var(--text-secondary);"><strong>Address:</strong> ${facility.address}</p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: var(--text-secondary);"><strong>Hours:</strong> ${facility.hours}</p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: var(--text-secondary);"><strong>Phone:</strong> ${facility.phone}</p>
                    ${facility.distance !== null ? `
                        <p style="margin: 6px 0 0 0; color: var(--primary); font-weight: 800; font-size: 12.5px; display: flex; align-items: center; gap: 4px;">
                            <i class="fas fa-location-arrow"></i> Distance: ${facility.distance.toFixed(1)} km away
                        </p>
                    ` : ''}
                </div>
            `;
            marker.bindPopup(popupContent);
            mapMarkers.push(marker);
            fitBoundsCoords.push([facility.latitude, facility.longitude]);

            // Create Sidebar Card
            const card = document.createElement('div');
            card.className = `facility-card glass ${isNearest ? 'nearest-highlight' : ''}`;
            card.style.border = isNearest ? '2px solid var(--primary)' : 'var(--border-glass)';
            card.style.background = isNearest ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)';
            card.style.borderRadius = '12px';
            card.style.padding = '14px 16px';
            card.style.cursor = 'pointer';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '6px';
            card.style.boxShadow = isNearest ? '0 4px 15px rgba(16,185,129,0.15)' : '0 2px 5px rgba(0,0,0,0.02)';
            card.style.transition = 'transform 0.2s, box-shadow 0.2s';
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = isNearest ? '0 4px 15px rgba(16,185,129,0.15)' : '0 2px 5px rgba(0,0,0,0.02)';
            });

            const wasteBadges = {
                "Plastic": "plastic-paper",
                "Paper": "plastic-paper",
                "Glass": "all",
                "Metal": "all",
                "Organic": "organic",
                "E-Waste": "e-waste"
            };
            const badgeClass = wasteBadges[facility.waste_type] || "all";
            const statusColor = facility.open_status === "Open Now" ? "#10b981" : "#ef4444";

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                    <h4 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin: 0; line-height: 1.3;">${facility.name}</h4>
                    ${facility.distance !== null ? `
                        <span style="font-size: 12.5px; font-weight: 800; color: var(--primary); white-space: nowrap;">
                            <i class="fas fa-location-arrow"></i> ${facility.distance.toFixed(1)} km
                        </span>
                    ` : ''}
                </div>
                <p style="font-size: 12px; color: var(--text-secondary); margin: 2px 0 0 0; line-height: 1.4;">${facility.address}</p>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 11.5px;">
                    <span class="facility-badge ${badgeClass}">${emoji} ${facility.waste_type}</span>
                    <span style="color: ${statusColor}; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                        <span style="display: inline-block; width: 6px; height: 6px; border-radius:50%; background: ${statusColor};"></span>
                        ${facility.open_status}
                    </span>
                </div>
                ${isNearest ? `
                    <div style="margin-top: 4px; display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">
                        <i class="fas fa-star"></i> Nearest Facility
                    </div>
                ` : ''}
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.facility-card').forEach(c => {
                    c.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                    c.style.background = 'var(--bg-card)';
                });
                card.style.borderColor = 'var(--primary)';
                card.style.background = 'rgba(16, 185, 129, 0.05)';

                leafletMap.setView([facility.latitude, facility.longitude], 15);
                marker.openPopup();
            });

            facilityContainer.appendChild(card);
        });

        // Fit map bounds to contain all elements
        if (centers.length > 0) {
            if (fitBoundsCoords.length > 1) {
                leafletMap.fitBounds(fitBoundsCoords, { padding: [40, 40] });
            } else {
                leafletMap.setView([centers[0].latitude, centers[0].longitude], 14);
            }

            if (searchLat !== null) {
                const nearestCenter = centers[0];
                mapMarkers.forEach(m => {
                    if (m instanceof L.Marker && m.getLatLng().lat === nearestCenter.latitude && m.getLatLng().lng === nearestCenter.longitude) {
                        setTimeout(() => m.openPopup(), 400);
                    }
                });
            }
        }

    } catch (err) {
        console.error("Error fetching centers:", err);
        showToast("Error retrieving recycling centers", "error");
    }
}
