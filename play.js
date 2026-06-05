/* ==========================================
   EcoStation - Eco Play Hub Module (play.js)
   ========================================== */

// Waste items dataset for the game
const WASTE_ITEMS_POOL = [
    { name: "Plastic Bottle", icon: "fa-bottle-water", bin: "recyclable" },
    { name: "Cardboard Box", icon: "fa-box", bin: "recyclable" },
    { name: "Glass Jar", icon: "fa-jar", bin: "recyclable" },
    { name: "Aluminum Can", icon: "fa-beer-mug-empty", bin: "recyclable" },
    { name: "Newspaper", icon: "fa-newspaper", bin: "recyclable" },
    
    { name: "Banana Peel", icon: "fa-leaf", bin: "organic" },
    { name: "Apple Core", icon: "fa-apple-whole", bin: "organic" },
    { name: "Food Scraps", icon: "fa-utensils", bin: "organic" },
    { name: "Fruit Waste", icon: "fa-lemon", bin: "organic" },
    
    { name: "Dead Battery", icon: "fa-battery-empty", bin: "ewaste" },
    { name: "Phone Charger", icon: "fa-plug", bin: "ewaste" },
    { name: "Old Smartphone", icon: "fa-mobile-screen-button", bin: "ewaste" },
    { name: "Broken Keyboard", icon: "fa-keyboard", bin: "ewaste" },
    
    { name: "Dirty Tissue", icon: "fa-toilet-paper-slash", bin: "landfill" },
    { name: "Used Diaper", icon: "fa-baby", bin: "landfill" },
    { name: "Broken Plate", icon: "fa-burst", bin: "landfill" },
    { name: "Greasy Pizza Box", icon: "fa-pizza-slice", bin: "landfill" }
];

let gameTimerInterval = null;
let gameTimeLeft = 30; // 30 seconds round
let gameScore = 0;
let gameHighScore = parseInt(localStorage.getItem("eco_play_highscore") || "0");
let gameActive = false;
let currentItem = null;
let itemsAttempted = 0;
let itemsCorrect = 0;

// Track selected item for click-to-sort fallback
let selectedDraggableElement = null;

// Initialize Eco Play module
document.addEventListener("DOMContentLoaded", () => {
    // Update High Score Display
    const highScoreEl = document.getElementById("game-high-score");
    if (highScoreEl) highScoreEl.innerText = gameHighScore;

    // Start Button
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (!gameActive) {
                startGame();
            } else {
                resetGame();
            }
        });
    }

    // Retry Button
    const retryBtn = document.getElementById("btn-retry-game");
    if (retryBtn) {
        retryBtn.addEventListener("click", () => {
            hideGameOverModal();
            startGame();
        });
    }

    // Set up click-to-sort listeners on Bins
    const bins = document.querySelectorAll(".bin-target");
    bins.forEach(bin => {
        // Drag over / Drag enter styling
        bin.addEventListener("dragover", (e) => {
            e.preventDefault();
            bin.classList.add("hovered");
        });

        bin.addEventListener("dragleave", () => {
            bin.classList.remove("hovered");
        });

        bin.addEventListener("drop", (e) => {
            e.preventDefault();
            bin.classList.remove("hovered");
            const binType = bin.getAttribute("data-bin");
            handleSort(binType);
        });

        // Click-to-sort fallback
        bin.addEventListener("click", () => {
            if (!gameActive || !currentItem) return;
            const binType = bin.getAttribute("data-bin");
            
            // Add click-to-sort active style temporarily
            bin.classList.add("hovered");
            setTimeout(() => bin.classList.remove("hovered"), 200);

            handleSort(binType);
        });
    });
});

// Start the game
function startGame() {
    gameActive = true;
    gameScore = 0;
    gameTimeLeft = 30;
    itemsAttempted = 0;
    itemsCorrect = 0;
    
    // Update UI
    document.getElementById("game-score").innerText = gameScore;
    document.getElementById("game-timer").innerText = gameTimeLeft + "s";
    
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-undo"></i> Reset Game';
        startBtn.classList.replace("btn-primary", "btn-scan-waste-hero");
    }

    // Clear instructions
    const instructions = document.getElementById("game-instructions-overlay");
    if (instructions) instructions.classList.add("hidden");

    // Spawn first item
    spawnNextItem();

    // Start Timer
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        gameTimeLeft--;
        document.getElementById("game-timer").innerText = gameTimeLeft + "s";
        
        if (gameTimeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Reset Game
function resetGame() {
    clearInterval(gameTimerInterval);
    gameActive = false;
    gameScore = 0;
    currentItem = null;
    
    document.getElementById("game-score").innerText = 0;
    document.getElementById("game-timer").innerText = "30s";

    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Sorting Game';
        startBtn.classList.replace("btn-scan-waste-hero", "btn-primary");
    }

    // Restore instructions overlay
    const spawnZone = document.getElementById("item-spawn-zone");
    spawnZone.innerHTML = `
        <div class="game-instructions-overlay" id="game-instructions-overlay">
            <i class="fas fa-hand-pointer"></i>
            <h3>Ready to test your knowledge?</h3>
            <p>Click "Start Sorting Game" to begin sorting trash into the correct bins. Drag the item or click the correct bin!</p>
        </div>
    `;
}

// Spawn a new item in the workspace
function spawnNextItem() {
    if (!gameActive) return;

    const spawnZone = document.getElementById("item-spawn-zone");
    spawnZone.innerHTML = ""; // Clear zone

    // Pick random item
    currentItem = WASTE_ITEMS_POOL[Math.floor(Math.random() * WASTE_ITEMS_POOL.length)];

    // Create item element
    const itemEl = document.createElement("div");
    itemEl.className = "draggable-waste-item";
    itemEl.draggable = true;
    itemEl.id = "active-game-item";
    
    itemEl.innerHTML = `
        <i class="fas ${currentItem.icon}"></i>
        <span>${currentItem.name}</span>
    `;

    // HTML5 Drag Event Listeners
    itemEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", currentItem.bin);
        itemEl.style.opacity = "0.6";
    });

    itemEl.addEventListener("dragend", () => {
        itemEl.style.opacity = "1";
    });

    // Touch support (mobile drag & drop emulation)
    let touchStartX = 0;
    let touchStartY = 0;
    
    itemEl.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        itemEl.style.transition = "none";
    }, { passive: true });

    itemEl.addEventListener("touchmove", (e) => {
        if (!gameActive) return;
        const touch = e.touches[0];
        const moveX = touch.clientX - touchStartX;
        const moveY = touch.clientY - touchStartY;
        itemEl.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }, { passive: true });

    itemEl.addEventListener("touchend", (e) => {
        itemEl.style.transition = "transform 0.2s";
        itemEl.style.transform = "none";
        
        // Find if released over a bin
        const touch = e.changedTouches[0];
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        
        let droppedBin = null;
        for (const el of elements) {
            if (el.classList.contains("bin-target")) {
                droppedBin = el.getAttribute("data-bin");
                break;
            }
        }

        if (droppedBin) {
            handleSort(droppedBin);
        }
    });

    spawnZone.appendChild(itemEl);
}

// Handle waste sorting event
function handleSort(binSelected) {
    if (!gameActive || !currentItem) return;

    itemsAttempted++;
    const isCorrect = currentItem.bin === binSelected;
    
    const gameBoard = document.querySelector(".game-board");
    const itemEl = document.getElementById("active-game-item");

    if (isCorrect) {
        itemsCorrect++;
        gameScore += 10;
        document.getElementById("game-score").innerText = gameScore;
        
        // Floating point popup
        triggerPointsPopup("+10", true);
        
        // Visual Success Pop
        if (itemEl) {
            itemEl.style.transform = "scale(0)";
            itemEl.style.transition = "transform 0.2s ease-in";
        }
        
        showToast(`Correct! ${currentItem.name} is ${currentItem.bin}.`, "success");
    } else {
        gameScore = Math.max(0, gameScore - 5);
        document.getElementById("game-score").innerText = gameScore;
        
        // Floating point popup
        triggerPointsPopup("-5", false);
        
        // Shake board on error
        gameBoard.classList.add("shake");
        setTimeout(() => gameBoard.classList.remove("shake"), 350);
        
        showToast(`Oops! ${currentItem.name} goes in ${currentItem.bin} bin.`, "error");
    }

    // Spawn next item
    setTimeout(() => {
        spawnNextItem();
    }, 250);
}

// Trigger floating points animation
function triggerPointsPopup(text, isPositive) {
    const spawnZone = document.getElementById("item-spawn-zone");
    const popup = document.createElement("div");
    popup.innerText = text;
    popup.style.position = "absolute";
    popup.style.fontSize = "22px";
    popup.style.fontWeight = "800";
    popup.style.color = isPositive ? "#10b981" : "#ef4444";
    popup.style.top = "40px";
    popup.style.animation = "bounce 0.8s ease-out forwards";
    popup.style.pointerEvents = "none";
    popup.style.zIndex = "100";
    
    spawnZone.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
}

// End the game
function endGame() {
    clearInterval(gameTimerInterval);
    gameActive = false;
    
    // Calculate stats
    const accuracy = itemsAttempted > 0 ? Math.round((itemsCorrect / itemsAttempted) * 100) : 0;
    const pointsEarned = gameScore; // Translate score directly to points

    // Update High Score
    if (gameScore > gameHighScore) {
        gameHighScore = gameScore;
        localStorage.setItem("eco_play_highscore", gameHighScore);
        document.getElementById("game-high-score").innerText = gameHighScore;
    }

    // Update Modal Content
    document.getElementById("modal-score").innerText = gameScore;
    document.getElementById("modal-accuracy").innerText = accuracy + "%";
    document.getElementById("modal-points").innerText = `+${pointsEarned}`;
    
    const startBtn = document.getElementById("btn-start-game");
    if (startBtn) {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Sorting Game';
        startBtn.classList.replace("btn-scan-waste-hero", "btn-primary");
    }

    // Award points to dashboard system if logged in
    awardPointsToUser(pointsEarned);

    showGameOverModal();
}

// Show/Hide Modal Overlay
function showGameOverModal() {
    document.getElementById("game-modal-backdrop").classList.add("active");
}

function hideGameOverModal() {
    document.getElementById("game-modal-backdrop").classList.remove("active");
}

// Integrate points with dashboard statistics
function awardPointsToUser(points) {
    if (typeof currentUser !== "undefined" && currentUser) {
        // Boost user points in the UI (dashboard)
        const pointsEl = document.getElementById("stat-points"); // Adjust if there is a points card
        if (pointsEl) {
            let curPoints = parseInt(pointsEl.innerText) || 0;
            pointsEl.innerText = curPoints + points;
        }
        
        // Also log scan counts / gamified activity to local stats if possible
        showToast(`Congratulations! You earned ${points} Eco-points!`, "success");
    }
}
