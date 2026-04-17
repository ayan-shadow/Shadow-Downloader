const extractBtn = document.getElementById('extractBtn');
const progressBar = document.getElementById('progressBar');
const statusContainer = document.getElementById('statusContainer');
const resultsArea = document.getElementById('resultsArea');
const statusMsg = document.getElementById('statusMsg');
const statusPercent = document.getElementById('statusPercent');

// 🔑 EXACT API CONFIG FROM FRIEND'S FILE
const API_URL = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
const API_KEY = '29f8c3b79amshc7b9755d426320dp1b94fajsn62b1821d47db';

extractBtn.addEventListener('click', async () => {
    const videoUrl = document.getElementById('mediaUrl').value.trim();
    if (!videoUrl) return alert("Please enter a valid URL, Boss.");

    // Reset UI
    resultsArea.classList.add('hidden');
    statusContainer.classList.remove('hidden');
    updateUI(20, "Establishing Secure Connection...");

    try {
        // EXACT FETCH LOGIC FROM SOURCE [cite: 79, 80]
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'social-download-all-in-one.p.rapidapi.com',
                'X-RapidAPI-Key': API_KEY
            },
            body: JSON.stringify({ url: videoUrl })
        });

        updateUI(60, "Bypassing Server Firewalls...");

        if (!response.ok) throw new Error("API Server Busy. Try again later.");
        
        const data = await response.json();
        
        if (data.error) throw new Error(data.message || "Target Protected.");

        renderData(data);
    } catch (err) {
        updateUI(0, "CRITICAL ERROR");
        alert("SYSTEM ERROR: " + err.message);
    }
});

function updateUI(p, msg) {
    progressBar.style.width = p + "%";
    statusMsg.innerText = msg;
    statusPercent.innerText = p + "%";
}

function renderData(data) {
    updateUI(100, "Decryption Successful.");
    setTimeout(() => {
        statusContainer.classList.add('hidden');
        resultsArea.classList.remove('hidden');

        // Logic to handle multiple medias from friend's code [cite: 92]
        let mediaButtons = "";
        if (data.medias && data.medias.length > 0) {
            mediaButtons = data.medias.map(m => `
                <a href="${m.url}" target="_blank" class="cyber-btn flex justify-between items-center p-5 rounded-2xl bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 transition-all group">
                    <div class="flex flex-col text-left">
                        <span class="font-gaming text-[10px] uppercase text-blue-400 group-hover:text-white">${m.quality}</span>
                        <span class="text-[9px] opacity-40 uppercase">${m.extension} • ${m.type}</span>
                    </div>
                    <i class="fas fa-download opacity-30 group-hover:opacity-100 group-hover:translate-y-1 transition-all"></i>
                </a>
            `).join('');
        }

        resultsArea.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div class="cyber-card p-4 rounded-[2.5rem]">
                    <img src="${data.thumbnail || ''}" class="w-full rounded-2xl shadow-2xl border border-white/5">
                </div>
                <div class="space-y-4">
                    <h3 class="font-gaming text-sm uppercase mb-6 tracking-tighter">${data.title || "Media Extracted"}</h3>
                    <div class="space-y-3">
                        ${mediaButtons || '<p class="text-red-500 font-gaming text-xs">NO DOWNLOADABLE LAYERS FOUND</p>'}
                    </div>
                </div>
            </div>
        `;
    }, 800);
}