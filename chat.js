/* ==========================================
   EcoStation - Chatbot Module (chat.js)
   ========================================== */

function setupChatBot() {
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input-field');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatForm) return;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        appendChatMessage(text, 'user');

        // Extract item name from chat query to update smart recycling recommendations
        const lowerText = text.toLowerCase();
        if (lowerText.includes('battery') || lowerText.includes('e-waste')) {
            lastScannedItemName = "Battery";
        } else if (lowerText.includes('plastic') || lowerText.includes('bottle')) {
            lastScannedItemName = "Plastic Bottle";
        } else if (lowerText.includes('paper') || lowerText.includes('cardboard') || lowerText.includes('box')) {
            lastScannedItemName = "Cardboard Box";
        } else if (lowerText.includes('glass') || lowerText.includes('jar')) {
            lastScannedItemName = "Glass Jar";
        } else if (lowerText.includes('food') || lowerText.includes('peel') || lowerText.includes('organic') || lowerText.includes('leaf')) {
            lastScannedItemName = "Organic Waste";
        } else if (lowerText.includes('metal') || lowerText.includes('can') || lowerText.includes('aluminum')) {
            lastScannedItemName = "Metal Can";
        }

        // Show typing indicator
        const typingIndicator = appendTypingIndicator();
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await response.json();
            
            // Remove typing indicator
            typingIndicator.remove();

            if (response.ok && data.success) {
                appendChatMessage(data.response, 'bot');
            } else {
                appendChatMessage("Sorry, I am having trouble connecting right now. Details: " + (data.message || "Unknown error"), 'bot');
            }
        } catch (err) {
            console.error(err);
            typingIndicator.remove();
            appendChatMessage("Connection failed. Please check if your server is running.", 'bot');
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Handle suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.innerText;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });
}

function appendChatMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    
    // Format text lines/bullets nicely if bot response
    let formattedText = text;
    if (sender === 'bot') {
        formattedText = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/-\s(.*?)<br>/g, '<li>$1</li>');
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageEl.innerHTML = `
        <div class="message-content">${formattedText}</div>
        <span class="message-time">${time}</span>
    `;
    chatMessages.appendChild(messageEl);
}

function appendTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const indicator = document.createElement('div');
    indicator.className = 'message bot-message';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    return indicator;
}
