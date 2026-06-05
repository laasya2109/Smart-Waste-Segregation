/* ==========================================
   EcoStation - Scanner & Web Camera Module (scanner.js)
   ========================================== */

function setupDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultDisplay = document.getElementById('result-display');

    // Tab Switching elements
    const tabUploadBtn = document.getElementById('scanner-tab-upload');
    const tabCaptureBtn = document.getElementById('scanner-tab-capture');
    const uploadBox = document.getElementById('scanner-upload-box');
    const captureBox = document.getElementById('scanner-capture-box');

    // Tab switching handlers
    tabUploadBtn.addEventListener('click', () => {
        tabUploadBtn.classList.add('active');
        tabCaptureBtn.classList.remove('active');
        uploadBox.classList.remove('hidden');
        captureBox.classList.add('hidden');
        stopWebcam();
    });

    tabCaptureBtn.addEventListener('click', () => {
        tabCaptureBtn.classList.add('active');
        tabUploadBtn.classList.remove('active');
        captureBox.classList.remove('hidden');
        uploadBox.classList.add('hidden');
        startWebcam();
    });

    // Webcam capture button
    document.getElementById('capture-image-btn').addEventListener('click', () => {
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('webcam-canvas');
        if (!video.srcObject) {
            showToast("Camera stream not active", "warning");
            return;
        }

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            handleFileSelection(file);
            stopWebcam();
            
            // Switch tabs / Hide camera layout
            captureBox.classList.add('hidden');
            uploadBox.classList.add('hidden');
            tabUploadBtn.parentElement.classList.add('hidden');
        }, 'image/jpeg');
    });

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    document.getElementById('change-image-btn').addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        uploadBox.classList.remove('hidden');
        tabUploadBtn.parentElement.classList.remove('hidden');
        tabUploadBtn.click(); // Default back to upload tab
        
        // Hide/Show placeholders
        document.getElementById('detection-result-container').classList.add('hidden');
        document.getElementById('detection-placeholder').classList.remove('hidden');
        document.getElementById('stats-result-content').classList.add('hidden');
        document.getElementById('stats-placeholder').classList.remove('hidden');
        document.getElementById('advice-result-content').classList.add('hidden');
        document.getElementById('advice-placeholder').classList.remove('hidden');
        document.getElementById('analysis-result-content').classList.add('hidden');
        document.getElementById('analysis-placeholder').classList.remove('hidden');
        document.getElementById('find-facilities-btn-right').classList.add('hidden');
        
        // Hide bottom summary panel
        document.getElementById('scanner-summary-card').classList.add('hidden');
    });

    document.getElementById('upload-btn').addEventListener('click', uploadAndClassify);

    // Map centers navigator click
    document.getElementById('find-facilities-btn-right').addEventListener('click', () => {
        navigateToTab('panel-map');
        const catElement = document.getElementById('scan-summary-category-val');
        if (catElement) {
            const firstCat = catElement.innerText.split(',')[0].trim();
            let mappedCat = "";
            const lowerCat = firstCat.toLowerCase();
            if (lowerCat.includes("plastic")) mappedCat = "Plastic";
            else if (lowerCat.includes("paper")) mappedCat = "Paper";
            else if (lowerCat.includes("glass")) mappedCat = "Glass";
            else if (lowerCat.includes("metal")) mappedCat = "Metal";
            else if (lowerCat.includes("organic") || lowerCat.includes("food")) mappedCat = "Organic";
            else if (lowerCat.includes("e-waste") || lowerCat.includes("battery") || lowerCat.includes("electronic")) mappedCat = "E-Waste";

            const categorySelect = document.getElementById('map-category-select');
            if (categorySelect) {
                categorySelect.value = mappedCat;
                mapSelectedCategory = mappedCat;
            }
            
            setTimeout(() => {
                fetchAndRenderCenters();
            }, 300);
        }
    });
}

async function startWebcam() {
    const video = document.getElementById('webcam');
    
    // Check if browser supports WebRTC and secure context
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Webcam API not supported or not in a secure context (HTTPS/localhost).");
        showToast("Webcam requires localhost or HTTPS secure connection.", "error");
        return;
    }

    try {
        let stream;
        try {
            // Try with ideal facingMode constraint (rear camera preference)
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        } catch (firstErr) {
            console.warn("Preferred facingMode failed, falling back to default video stream:", firstErr);
            // Fallback to any available video stream
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        video.srcObject = stream;
        video.play();
        streamTracks = stream;
    } catch (err) {
        console.error("Camera access error:", err);
        
        let errorMsg = "Webcam access failed.";
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMsg = "Webcam permission denied! Please allow camera access in browser address bar.";
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMsg = "No webcam device found on this system.";
        } else {
            errorMsg = `Webcam error: ${err.message || err.name || 'Access Denied'}`;
        }
        
        showToast(errorMsg, "error");
    }
}

function stopWebcam() {
    const video = document.getElementById('webcam');
    if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        streamTracks = null;
    }
}

function handleFileSelection(file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('scanned-image-output').src = e.target.result; // Set for detection center viewport
        document.getElementById('scanner-upload-box').classList.add('hidden');
        document.getElementById('scanner-capture-box').classList.add('hidden');
        document.getElementById('scanner-tab-upload').parentElement.classList.add('hidden');
        document.getElementById('preview-container').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function uploadAndClassify() {
    if (!selectedFile || !currentUser) return;

    const progress = document.getElementById('classify-progress');
    const uploadBtn = document.getElementById('upload-btn');
    const changeBtn = document.getElementById('change-image-btn');
    
    // UI Loading state
    progress.classList.remove('hidden');
    uploadBtn.disabled = true;
    changeBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('email', currentUser.email);
    formData.append('description', document.getElementById('desc-input').value.trim());

    try {
        const response = await fetch('/api/classify', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        progress.classList.add('hidden');
        uploadBtn.disabled = false;
        changeBtn.disabled = false;

        if (response.ok && data.success) {
            // Save last scanned item for smart map recommendations
            if (data.objects && data.objects.length > 0) {
                lastScannedItemName = data.objects[0].item_name;
            }
            // Check for confidence < 60% warning (empty objects array returned)
            if (!data.objects || data.objects.length === 0) {
                document.getElementById('detection-placeholder').innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 44px; color: #eab308; margin-bottom: 12px;"></i>
                        <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Uncertain Classification</h4>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; max-width: 260px; margin: 0 auto;">
                            Unable to confidently identify the waste item. Please upload a clearer image.
                        </p>
                    </div>
                `;
                document.getElementById('detection-placeholder').classList.remove('hidden');
                document.getElementById('detection-result-container').classList.add('hidden');
                
                document.getElementById('stats-placeholder').innerHTML = `
                    <div class="stats-placeholder-text">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #eab308; margin-bottom: 8px;"></i>
                        <p>No confident detections (< 60%).</p>
                    </div>
                `;
                document.getElementById('stats-placeholder').classList.remove('hidden');
                document.getElementById('stats-result-content').classList.add('hidden');
                
                document.getElementById('advice-placeholder').innerHTML = `
                    <div class="advice-placeholder-text">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #eab308; margin-bottom: 8px;"></i>
                        <p>No advice available.</p>
                    </div>
                `;
                document.getElementById('advice-placeholder').classList.remove('hidden');
                document.getElementById('advice-result-content').classList.add('hidden');

                document.getElementById('analysis-placeholder').innerHTML = `
                    <div class="advice-placeholder-text">
                        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #eab308; margin-bottom: 8px;"></i>
                        <p>No analysis available.</p>
                    </div>
                `;
                document.getElementById('analysis-placeholder').classList.remove('hidden');
                document.getElementById('analysis-result-content').classList.add('hidden');
                
                // Hide bottom summary panel
                document.getElementById('scanner-summary-card').classList.add('hidden');
                
                showToast('Unable to identify objects with high confidence', 'warning');
                return;
            }

            // Restore placeholder HTML defaults for subsequent runs
            document.getElementById('detection-placeholder').innerHTML = `
                <i class="fas fa-camera-retro" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <p>Upload an image or use your camera to identify waste items.</p>
            `;
            document.getElementById('stats-placeholder').innerHTML = `
                <i class="fas fa-chart-bar" style="font-size: 24px; color: var(--text-muted); margin-bottom: 8px;"></i>
                <p>Awaiting scan data...</p>
            `;
            document.getElementById('advice-placeholder').innerHTML = `
                <i class="fas fa-list-ul" style="font-size: 24px; margin-bottom: 8px; color: var(--text-muted);"></i>
                <p>Awaiting scan data...</p>
            `;
            document.getElementById('analysis-placeholder').innerHTML = `
                <i class="fas fa-microchip" style="font-size: 24px; margin-bottom: 8px; color: var(--text-muted);"></i>
                <p>Awaiting analysis...</p>
            `;

            // Hide placeholders & Show results elements
            document.getElementById('detection-placeholder').classList.add('hidden');
            document.getElementById('detection-result-container').classList.remove('hidden');
            
            document.getElementById('stats-placeholder').classList.add('hidden');
            document.getElementById('stats-result-content').classList.remove('hidden');
            
            document.getElementById('advice-placeholder').classList.add('hidden');
            document.getElementById('advice-result-content').classList.remove('hidden');

            document.getElementById('analysis-placeholder').classList.add('hidden');
            document.getElementById('analysis-result-content').classList.remove('hidden');

            // 1. Render Detection Summary (stats-result-content)
            const statsContent = document.getElementById('stats-result-content');
            statsContent.innerHTML = '';
            
            const totalObjects = data.objects.length;
            let sumConfidence = 0;
            const categories = new Set();
            let isRecyclable = 'No';
            let recyclableCount = 0;
            
            // Count identical items (name-based aggregation)
            const itemCounts = {};
            data.objects.forEach(obj => {
                const name = obj.item_name;
                if (!itemCounts[name]) {
                    itemCounts[name] = {
                        count: 0,
                        category: obj.category,
                        bin_name: obj.bin_name
                    };
                }
                itemCounts[name].count += 1;
                
                sumConfidence += obj.confidence;
                categories.add(obj.category);
                if (obj.recyclable === 'Yes') {
                    isRecyclable = 'Yes';
                    recyclableCount++;
                } else if (obj.recyclable === 'Special Processing' && isRecyclable !== 'Yes') {
                    isRecyclable = 'Special Processing';
                }
            });
            
            const avgConfidence = Math.round(sumConfidence / totalObjects);
            
            let itemsListHtml = '';
            Object.entries(itemCounts).forEach(([name, info]) => {
                itemsListHtml += `
                    <li style="padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: var(--text-primary); font-size: 15px;">${name} ${info.count > 1 ? `× ${info.count}` : ''}</strong>
                            <span style="font-size: 11.5px; padding: 2px 8px; background: rgba(16, 185, 129, 0.1); color: var(--primary); border-radius: 12px; font-weight: 600; border: 1px solid rgba(16, 185, 129, 0.15);">${info.bin_name}</span>
                        </div>
                        <div style="font-size: 12.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                            <span>Category:</span>
                            <span style="color: var(--text-primary); font-weight: 500;">${info.category}</span>
                        </div>
                    </li>
                `;
            });
            
            statsContent.innerHTML = `
                <div style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
                    SCAN SUMMARY
                </div>
                <div style="margin-bottom: 16px;">
                    <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                        ${itemsListHtml}
                    </ul>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: var(--text-secondary);">Total Objects Detected:</span>
                    <strong style="color: var(--text-primary); font-size: 15px;">${totalObjects}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span style="color: var(--text-secondary);">Average Confidence:</span>
                    <strong style="color: var(--primary); font-size: 15px; font-weight: 700;">${avgConfidence}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 10px 0;">
                    <span style="color: var(--text-secondary);">Recyclable:</span>
                    <strong style="color: var(--text-primary); font-size: 15px;">${isRecyclable}</strong>
                </div>
            `;

            // 2. Render Disposal Guide (advice-result-content)
            const adviceContainer = document.getElementById('advice-result-content');
            adviceContainer.innerHTML = '';
            
            const bins = new Set();
            const instructions = new Set();
            
            data.objects.forEach(obj => {
                bins.add(obj.bin_name);
                
                // Dynamically render instructions from the array returned by the backend
                let adviceArray = [];
                if (Array.isArray(obj.advice)) {
                    adviceArray = obj.advice;
                } else if (typeof obj.advice === 'string' && obj.advice.trim().length > 0) {
                    adviceArray = [obj.advice];
                }
                
                // Fallback to category-based advice if advice is absent or empty
                if (adviceArray.length === 0) {
                    const cat = (obj.category || '').toLowerCase();
                    if (cat.includes('plastic')) {
                        adviceArray = ["Empty contents before disposal", "Rinse if possible", "Separate caps when applicable"];
                    } else if (cat.includes('paper')) {
                        adviceArray = ["Keep dry", "Flatten cardboard boxes", "Avoid mixing with food waste"];
                    } else if (cat.includes('glass')) {
                        adviceArray = ["Empty contents", "Handle broken glass carefully"];
                    } else if (cat.includes('metal')) {
                        adviceArray = ["Rinse containers", "Remove food residue"];
                    } else if (cat.includes('organic')) {
                        adviceArray = ["Compost when possible", "Do not mix with recyclables"];
                    } else if (cat.includes('e-waste') || cat.includes('electronic')) {
                        adviceArray = ["Do not dispose in household trash", "Take to authorized E-Waste collection centers", "Batteries require special processing"];
                    } else {
                        adviceArray = ["Dispose safely", "Cannot be recycled through standard recycling systems"];
                    }
                }
                
                adviceArray.forEach(ins => {
                    instructions.add(ins);
                });
            });
            
            let instructionsHtml = '';
            instructions.forEach(ins => {
                instructionsHtml += `
                    <li style="background: rgba(16, 185, 129, 0.05); padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; font-size: 15px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(16, 185, 129, 0.1); color: var(--text-primary); font-weight: 500;">
                        <i class="fas fa-check" style="color: var(--primary); font-size: 13px;"></i> ${ins}
                    </li>`;
            });
            
            adviceContainer.innerHTML = `
                <div style="font-size: 14px; color: var(--text-secondary);">
                    <div style="font-weight: 700; color: var(--primary); margin-bottom: 16px; font-size: 20px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-trash-can" style="font-size: 18px;"></i> ${Array.from(bins).join(' / ')}
                    </div>
                    <ul style="list-style: none; padding-left: 0; margin: 0;">
                        ${instructionsHtml}
                    </ul>
                </div>
            `;

            // 3. Render Environmental Impact (analysis-result-content)
            const analysisContainer = document.getElementById('analysis-result-content');
            analysisContainer.innerHTML = '';
            
            const savedWeight = (recyclableCount * 0.125).toFixed(1);
            
            analysisContainer.innerHTML = `
                <div style="font-size: 15px;">
                    <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.03);">
                        <span style="color: var(--text-secondary);">Recyclable Items:</span>
                        <strong style="color: var(--text-primary); font-size: 18px;">${recyclableCount}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                        <span style="color: var(--text-secondary);">Estimated Waste Saved:</span>
                        <strong style="color: var(--primary); font-size: 20px; font-weight: 700;">${savedWeight} kg</strong>
                    </div>
                    <div style="margin-top: 14px; padding: 12px 14px; background: rgba(16, 185, 129, 0.05); border-radius: 10px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; border: 1px solid rgba(16, 185, 129, 0.1); display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-seedling" style="color: var(--primary); margin-top: 2px;"></i>
                        <span>Sorting these items helps reduce greenhouse emissions and conserves natural resource cycles.</span>
                    </div>
                </div>
            `;

            // 4. Show Find Recycling Centers Button only if there are recyclable categories detected (not just Landfill Waste)
            const hasRecyclableCategory = data.objects.some(obj => obj.category && obj.category !== 'Landfill Waste');
            const findBtn = document.getElementById('find-facilities-btn-right');
            if (hasRecyclableCategory) {
                findBtn.classList.remove('hidden');
            } else {
                findBtn.classList.add('hidden');
            }
            
            // Render Bottom Summary & Environmental Impact Card
            const summaryCard = document.getElementById('scanner-summary-card');
            summaryCard.classList.add('hidden');
            
            // Total objects detected
            document.getElementById('summary-total-objects').innerText = data.objects.length;
            
            // Unique categories list
            const categoriesList = document.getElementById('summary-categories-list');
            categoriesList.innerHTML = '';
            const uniqueCategories = [...new Set(data.objects.map(obj => obj.category))];
            uniqueCategories.forEach(cat => {
                const li = document.createElement('li');
                li.style.background = 'rgba(16, 185, 129, 0.1)';
                li.style.color = 'var(--primary)';
                li.style.padding = '4px 10px';
                li.style.borderRadius = '20px';
                li.style.fontSize = '12px';
                li.style.fontWeight = '600';
                li.innerText = cat;
                categoriesList.appendChild(li);
            });
            
            // Populating dynamic Waste Breakdown list with object counts
            const breakdownList = document.getElementById('summary-breakdown-list');
            breakdownList.innerHTML = '';
            const counts = {};
            data.objects.forEach(obj => {
                counts[obj.category] = (counts[obj.category] || 0) + 1;
            });
            Object.entries(counts).forEach(([cat, count]) => {
                const li = document.createElement('li');
                li.style.fontSize = '13px';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '8px';
                li.innerHTML = `<span style="display:inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></span> <strong>${cat}:</strong> ${count}`;
                breakdownList.appendChild(li);
            });
            
            // Environmental impact message
            const impactContainer = document.getElementById('summary-environmental-impact');
            if (recyclableCount > 0) {
                impactContainer.innerHTML = `Successfully identified <strong>${recyclableCount} recyclable items</strong> in this scan! Properly sorting these saves local landfill capacity, reduces carbon output, and helps conserve natural ecosystems.`;
            } else {
                impactContainer.innerHTML = `No recyclable items identified in this scan. Safe disposal ensures toxic residues do not contaminate surrounding ecosystems.`;
            }
            
            // Draw real bounding boxes returned by YOLOv8 model
            drawBoundingBoxes(data.objects);

            showToast('Classification complete!', 'success');
            
            // Update Dashboard automatically after successful scan
            loadDashboardStats();
        } else {
            showToast(data.message || 'Classification failed', 'error');
        }
    } catch (err) {
        console.error(err);
        progress.classList.add('hidden');
        uploadBtn.disabled = false;
        changeBtn.disabled = false;
        showToast('Classification pipeline timed out', 'error');
    }
}

function drawBoundingBoxes(objects) {
    const overlay = document.getElementById('bounding-boxes-overlay');
    overlay.innerHTML = '';
    
    if (!objects || objects.length === 0) return;
    
    objects.forEach(obj => {
        const div = document.createElement('div');
        div.className = 'sim-box';
        
        // Convert normalized [xmin, ymin, xmax, ymax] (0 to 1) to percentage values
        const xmin = obj.box[0] * 100;
        const ymin = obj.box[1] * 100;
        const xmax = obj.box[2] * 100;
        const ymax = obj.box[3] * 100;
        
        div.style.left = `${xmin}%`;
        div.style.top = `${ymin}%`;
        div.style.width = `${xmax - xmin}%`;
        div.style.height = `${ymax - ymin}%`;
        
        const label = document.createElement('span');
        label.className = 'sim-box-label';
        label.innerText = `${obj.item_name.toUpperCase()} | ${obj.category.toUpperCase()} (${obj.confidence}%)`;
        
        div.appendChild(label);
        overlay.appendChild(div);
    });
}
