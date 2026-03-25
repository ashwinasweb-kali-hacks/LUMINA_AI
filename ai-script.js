
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation Logic ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.tool-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- AI Chat Logic (Pollinations.ai) ---
    const answerDisplay = document.getElementById('answerDisplay');
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');

    // Auto-resize textarea is handled by CSS (mostly), but helpful to reset on clear
    
    async function handleChat() {
        const prompt = aiInput.value.trim();
        if (!prompt) return;

        // 0. Clean up placeholder if it exists
        const placeholder = answerDisplay.querySelector('.placeholder-text');
        if (placeholder) placeholder.remove();

        // 1. Create a container for this Q&A pair (History Block)
        const qaBlock = document.createElement('div');
        qaBlock.className = 'qa-block';
        qaBlock.style.marginBottom = '30px';
        qaBlock.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        qaBlock.style.paddingBottom = '20px';
        
        // 2. Add User Question (Styled)
        const userQ = document.createElement('div');
        userQ.innerHTML = `<strong>You:</strong> ${prompt}`;
        userQ.style.color = '#a29bfe';
        userQ.style.marginBottom = '10px';
        qaBlock.appendChild(userQ);

        // 3. Add AI Answer Container (with loading initially)
        const aiAns = document.createElement('div');
        aiAns.innerHTML = `<div class="typing-indicator" style="padding: 10px 0;"><span></span><span></span><span></span></div>`;
        qaBlock.appendChild(aiAns);

        // Append to Main Display
        answerDisplay.appendChild(qaBlock);
        answerDisplay.scrollTop = answerDisplay.scrollHeight;

        // 4. Reset Input & Button State
        aiInput.value = '';
        const originalBtnText = aiSendBtn.innerHTML;
        aiSendBtn.disabled = true;
        aiSendBtn.innerHTML = 'Generating...';
        
        // 5. Call API
        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
            
            if (!response.ok) throw new Error('API Error');
            
            const text = await response.text();
            
            // 6. Update the specific AI Answer container for this block
            aiAns.innerHTML = marked.parse(text);

        } catch (error) {
            aiAns.innerHTML = `<p style="color: #ff6b6b;">Error: Unable to reach Lumina Intelligence.</p>`;
        } finally {
            aiSendBtn.disabled = false;
            aiSendBtn.innerHTML = originalBtnText;
            answerDisplay.scrollTop = answerDisplay.scrollHeight;
        }
    }

    aiSendBtn.addEventListener('click', handleChat);
    aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });


    // --- NANO BANANA (Image Gen) ---
    const imageInput = document.getElementById('imageInput');
    const generateImageBtn = document.getElementById('generateImageBtn');
    const imageResult = document.getElementById('imageResult');
    const downloadImageBtn = document.getElementById('downloadImageBtn');

    if (generateImageBtn) {
        generateImageBtn.addEventListener('click', () => {
            const prompt = imageInput.value.trim();
            if (!prompt) return;

            imageResult.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
            if(downloadImageBtn) downloadImageBtn.style.display = 'none'; // Hide prev button
            
            // Pollinations Image API
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
            
            // Create new image object to load it before showing
            const img = new Image();
            img.onload = () => {
                imageResult.innerHTML = '';
                imageResult.appendChild(img);
                
                // Setup Download Button
                if(downloadImageBtn) {
                    downloadImageBtn.style.display = 'inline-flex';
                    downloadImageBtn.href = imageUrl;
                    
                    // Try robust fetch blob if possible, else link is set
                    fetch(imageUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            downloadImageBtn.href = url;
                        }).catch(e => console.log('Download fetch failed, using direct link'));
                }
            };
            img.onerror = () => {
                imageResult.innerHTML = '<p>Error generating image.</p>';
            }
            img.src = imageUrl;
            img.style.maxWidth = "100%";
            img.style.borderRadius = "10px";
        });
    }



    // --- QR Code Logic & Download ---
    const qrText = document.getElementById('qrText');
    const generateQrBtn = document.getElementById('generateQrBtn');
    const qrImage = document.getElementById('qrImage');
    const placeholderQr = document.querySelector('.placeholder-qr');
    const downloadQrBtn = document.getElementById('downloadQrBtn');

    if(generateQrBtn) {
        generateQrBtn.addEventListener('click', () => {
            const input = qrText.value.trim();
            if (!input) return;

            // 1. Construct API URL
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&data=${encodeURIComponent(input)}`;

            // 2. Set Image Source
            qrImage.onload = () => {
                // Only show download button once image loads
                downloadQrBtn.style.display = 'inline-flex';
                generateQrBtn.innerText = "Generated!";
                setTimeout(() => generateQrBtn.innerText = "Generate QR", 2000);
            };
            qrImage.src = apiUrl;
            qrImage.style.display = 'block';
            
            // 3. Hide Placeholder
            if(placeholderQr) placeholderQr.style.display = 'none';
            
            // 4. Set Download Button (Direct Link Fallback)
            // Using a direct link is safer than fetch/blob for cross-origin images without CORS headers
            downloadQrBtn.href = apiUrl;
            downloadQrBtn.target = "_blank"; // Open in new tab to force save option
            downloadQrBtn.download = "qrcode.png"; // Hint
        });
    }

});
