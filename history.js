/* ==========================================
   EcoStation - Scan History Module (history.js)
   ========================================== */

// Dynamic Category Helper
function getDynamicCategory(item) {
    if (!item) return "Landfill";
    const category = item.category || "Landfill";
    if (category === "Landfill") {
        const nameLower = (item.item_name || "").toLowerCase();
        if (nameLower.includes("glass")) return "Glass";
        if (nameLower.includes("can") || nameLower.includes("metal") || nameLower.includes("aluminum") || nameLower.includes("tin")) return "Metal";
    }
    return category;
}

// Date Formatter Helper
function formatHistoryDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return "";
    try {
        const isoStr = dateStr.replace(" ", "T");
        const date = new Date(isoStr);
        if (isNaN(date.getTime())) {
            return dateStr;
        }
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options); // "04 Jun 2026"
    } catch (e) {
        return dateStr;
    }
}

// Load scan history from API
async function loadScanHistory() {
    if (!currentUser) return;
    try {
        const response = await fetch(`/api/history?email=${encodeURIComponent(currentUser.email)}`);
        scanHistoryData = await response.json();
        renderHistoryCards();
    } catch (err) {
        console.error(err);
        showToast('Error loading history', 'error');
    }
}

// Render dynamic history cards based on active search & filters
function renderHistoryCards() {
    const gridContainer = document.getElementById('history-grid');
    const emptyState = document.getElementById('history-empty');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    if (!Array.isArray(scanHistoryData) || scanHistoryData.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    // Get search term and active chip
    const searchInput = document.getElementById('history-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const activeChip = document.querySelector('.history-filter-chips .chip.active');
    const activeFilter = activeChip ? activeChip.getAttribute('data-filter') : 'All';

    // Filter list
    const filtered = scanHistoryData.filter(item => {
        if (!item) return false;
        const dynamicCat = getDynamicCategory(item);
        const itemName = item.item_name || "";
        
        const matchesSearch = itemName.toLowerCase().includes(query) || 
                              dynamicCat.toLowerCase().includes(query);

        const matchesChip = activeFilter === "All" || dynamicCat.toLowerCase() === activeFilter.toLowerCase();

        return matchesSearch && matchesChip;
    });

    // Client-side deduplication for identical items scanned in the same session (same item_name and scan_date)
    const uniqueFiltered = [];
    const seenInSession = new Set();
    filtered.forEach(item => {
        if (!item) return;
        const nameKey = (item.item_name || "").trim().toLowerCase();
        const dateKey = item.scan_date || "";
        const sessionKey = `${nameKey}_${dateKey}`;
        if (!seenInSession.has(sessionKey)) {
            seenInSession.add(sessionKey);
            uniqueFiltered.push(item);
        }
    });

    if (uniqueFiltered.length === 0) {
        if (emptyState) {
            emptyState.innerHTML = `
                <i class="fas fa-search-minus" style="font-size: 40px; margin-bottom: 12px; color: var(--text-muted);"></i>
                <p>No matches found for your search and filters.</p>
            `;
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    // Populate grid
    uniqueFiltered.forEach(item => {
        if (!item) return;
        const dynamicCat = getDynamicCategory(item);
        const formattedDate = formatHistoryDate(item.scan_date);
        
        // Define color palettes for card header backgrounds matching categories
        const bgColors = {
            "plastic": "#eefdfa",
            "paper": "#fdf8ef",
            "glass": "#eff6ff",
            "e-waste": "#fef2f2",
            "organic": "#f0fdf4",
            "metal": "#f5f3ff",
            "landfill": "#f8fafc"
        };
        const iconColors = {
            "plastic": "#14b8a6",
            "paper": "#d97706",
            "glass": "#3b82f6",
            "e-waste": "#ef4444",
            "organic": "#10b981",
            "metal": "#6366f1",
            "landfill": "#4b5869"
        };
        
        const catLower = dynamicCat.toLowerCase();
        const bgColor = bgColors[catLower] || "#fdf8ef";
        const iconColor = iconColors[catLower] || "#eab308";

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-card-img-container" style="background: ${bgColor};">
                <i class="fas fa-recycle" style="color: ${iconColor};"></i>
            </div>
            <div class="history-card-body">
                <div class="history-card-title-row">
                    <h4 class="history-card-title">${item.item_name || "Unknown Item"}</h4>
                    <span class="history-category-badge ${catLower}">${dynamicCat}</span>
                </div>
                <div class="history-card-date">${formattedDate}</div>
            </div>
        `;
        
        // Optional popup info on card click
        card.addEventListener('click', () => {
            showToast(`Scanned on ${item.scan_date || "Unknown Date"} with ${item.confidence || 90}% confidence. Assigned to ${item.bin_name || "General Bin"}.`, "info");
        });
        
        gridContainer.appendChild(card);
    });
}
