const extractBtn = document.getElementById('extractBtn');
const progressBar = document.getElementById('progressBar');
const statusBox = document.getElementById('statusBox');
const results = document.getElementById('results');
const statusMsg = document.getElementById('statusMsg');
const statusPercent = document.getElementById('statusPercent');

// 🔑 APIS & KEYS
const RAPID_KEY = "1ab09c6cccmsh3b437c4d2ebc0f0p1d517ejsn76f2c44d23d7";
const RAPID_HOST = "youtube-video-fast-downloader-24-7.p.rapidapi.com";
const COBALT_API = "https://api.cobalt.tools/api/json";

extractBtn.addEventListener('click', async () => {
    const url = document.getElementById('mediaUrl').value.trim();
    if (!url) return;

    // Reset UI
    results.classList.add('hidden');
    statusBox.classList.remove('hidden');
    updateProgress(10, "Establishing Proxy Handshake...");

    try {
        // --- PHASE 1: RAPID PROXY (As per Friend's implementation) ---
        updateProgress(40, "Decrypting Media Stream...");
        let response = await fetch(`https://${RAPID_HOST}/get-video-info?url=${encodeURIComponent(url)}`, {
            headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': RAPID_HOST }
        });
        let data = await response.json();

        if (data && data.status === "ok") {
            displayFinalResults(data.title, data.thumb, data.url);
        } else {
            // --- PHASE 2: COBALT FALLBACK (The VidMate Strategy) ---
            updateProgress(70, "RapidAPI Bypassed. Routing via Cobalt...");
            let cbRes = await fetch(COBALT_API, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ url: url, vQuality: "720" })
            });
            let cbData = await cbRes.json();

            if (cbData.url || cbData.status === "stream") {
                displayFinalResults("AyanX Extracted Stream", cbData.url, [{url: cbData.url, quality: "High Definition", ext: "Media"}]);
            } else {
                throw new Error("Target Protected. All protocols failed.");
            }
        }
    } catch (err) {
        updateProgress(0, "Error: " + err.message);
        alert("CRITICAL SYSTEM ALERT: " + err.message);
    }
});

function updateProgress(p, msg) {
    progressBar.style.width = p + "%";
    statusMsg.innerText = msg;
    statusPercent.innerText = p + "%";
}

function displayFinalResults(title, thumb, links) {
    updateProgress(100, "Layers Extracted Successfully.");
    setTimeout(() => {
        statusBox.classList.add('hidden');
        results.classList.remove('hidden');
        
        let linkHTML = Array.isArray(links) 
            ? links.map(l => `
                <a href="${l.url}" target="_blank" class="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex justify-between items-center hover:bg-blue-600 transition-all group">
                    <span class="font-gaming text-[9px] uppercase tracking-widest">${l.quality} ${l.ext.toUpperCase()}</span>
                    <i class="fas fa-download opacity-50 group-hover:opacity-100"></i>
                </a>`).join('')
            : `<a href="${links}" target="_blank" class="bg-blue-600 p-5 rounded-2xl text-center font-gaming font-black uppercase tracking-widest">DOWNLOAD MEDIA</a>`;

        results.innerHTML = `
            <div class="glass p-6 rounded-[2.5rem] border-white/5">
                <img src="${thumb || 'https://via.placeholder.com/400x225/000000/FFFFFF?text=AYANX+SECURE+STREAM'}" class="w-full rounded-2xl mb-4 shadow-2xl">
                <h3 class="font-gaming text-[11px] uppercase tracking-tight text-gray-400">${title}</h3>
            </div>
            <div class="flex flex-col gap-3 justify-center">
                <p class="text-[8px] font-gaming text-blue-500 uppercase tracking-[0.4em] text-center mb-2">Decrypted Layers Available</p>
                ${linkHTML}
            </div>
        `;
    }, 800);
}