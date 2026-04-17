const extractBtn = document.getElementById('extractBtn');
const progressBar = document.getElementById('progressBar');
const statusContainer = document.getElementById('statusContainer');
const outputArea = document.getElementById('outputArea');
const statusText = document.getElementById('statusText');
const percentText = document.getElementById('percentText');

// CONFIGURATION
const RAPID_KEY = "1ab09c6cccmsh3b437c4d2ebc0f0p1d517ejsn76f2c44d23d7"; // Aapki Key
const RAPID_HOST = "youtube-video-fast-downloader-24-7.p.rapidapi.com";
const COBALT_PROXY = "https://api.cobalt.tools/api/json";

extractBtn.addEventListener('click', async () => {
    const url = document.getElementById('mediaUrl').value.trim();
    if (!url) return;

    // Reset UI
    outputArea.classList.add('hidden');
    statusContainer.classList.remove('hidden');
    updateProgress(10, "Establishing Connection...");

    try {
        // --- PHASE 1: RAPID PROXY ATTEMPT ---
        updateProgress(30, "Bypassing Platform Security...");
        let response = await fetch(`https://${RAPID_HOST}/get-video-info?url=${encodeURIComponent(url)}`, {
            headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': RAPID_HOST }
        });
        let data = await response.json();

        if (data && data.status === "ok") {
            renderResults(data.title, data.thumb, data.url);
        } else {
            // --- PHASE 2: FALLBACK TO COBALT SYSTEM (VidMate Style) ---
            updateProgress(60, "Redirecting via Secondary Proxy...");
            let cobaltRes = await fetch(COBALT_PROXY, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ url: url, vQuality: "720" })
            });
            let cobaltData = await cobaltRes.json();

            if (cobaltData.url || cobaltData.status === "stream") {
                renderResults("Digital Stream Extracted", cobaltData.url, [{url: cobaltData.url, quality: "High Definition", ext: "media"}]);
            } else {
                throw new Error("Protocol Blocked by Host. Try again later.");
            }
        }
    } catch (err) {
        updateProgress(0, "Error: " + err.message);
        alert("CRITICAL ERROR: " + err.message);
    }
});

function updateProgress(p, text) {
    progressBar.style.width = p + "%";
    statusText.innerText = text;
    percentText.innerText = p + "%";
}

function renderResults(title, thumb, links) {
    updateProgress(100, "Decryption Complete.");
    setTimeout(() => {
        statusContainer.classList.add('hidden');
        outputArea.classList.remove('hidden');
        
        let downloadLinks = Array.isArray(links) 
            ? links.map(l => `
                <a href="${l.url}" target="_blank" class="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center hover:bg-blue-600 transition-all font-bold">
                    <span class="text-[10px] tracking-widest">${l.quality} ${l.ext.toUpperCase()}</span>
                    <i class="fas fa-download"></i>
                </a>`).join('')
            : `<a href="${links}" target="_blank" class="bg-blue-600 p-4 rounded-2xl text-center font-bold uppercase tracking-widest">Download Full Media</a>`;

        outputArea.innerHTML = `
            <div class="cyber-card p-6 rounded-[2.5rem] border-blue-500/20">
                <img src="${thumb || 'https://via.placeholder.com/400x225/000000/FFFFFF?text=AyanX+Secure+Stream'}" class="w-full rounded-2xl mb-4 shadow-2xl">
                <h3 class="font-gaming text-sm uppercase tracking-tight mb-4">${title}</h3>
            </div>
            <div class="flex flex-col gap-3 justify-center">
                <div class="text-[8px] font-gaming text-gray-600 mb-2 tracking-[0.4em] uppercase text-center">Available Extracted Layers</div>
                ${downloadLinks}
            </div>
        `;
    }, 800);
}