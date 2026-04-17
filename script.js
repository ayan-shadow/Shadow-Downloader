const analyzeBtn = document.getElementById('analyzeBtn');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const results = document.getElementById('results');
const error = document.getElementById('error');
const videoUrl = document.getElementById('videoUrl');

// ✅ AAPKI RAPIDAPI KEY INTEGRATED
const RAPID_KEY = "1ab09c6cccmsh3b437c4d2ebc0f0p1d517ejsn76f2c44d23d7";
const RAPID_HOST = "youtube-video-fast-downloader-24-7.p.rapidapi.com";
const COBALT_API = "https://api.cobalt.tools/api/json";

analyzeBtn.addEventListener('click', async () => {
    const url = videoUrl.value.trim();
    if (!url) return;

    results.classList.add('hidden');
    error.classList.add('hidden');
    loader.classList.remove('hidden');
    
    let p = 0;
    const interval = setInterval(() => { p += 5; progressBar.style.width = p + "%"; if (p >= 90) clearInterval(interval); }, 100);

    try {
        // Step 1: Try RapidAPI
        let response = await fetch(`https://${RAPID_HOST}/get-video-info?url=${encodeURIComponent(url)}`, {
            headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': RAPID_HOST }
        });
        let data = await response.json();

        if (data && data.status === "ok") {
            displayResults(data.title, data.thumb, data.url);
        } else {
            // Step 2: Fallback to Cobalt Engine
            let cobaltRes = await fetch(COBALT_API, {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({ url: url, vQuality: "720" })
            });
            let cobaltData = await cobaltRes.json();

            if (cobaltData.url || cobaltData.status === "stream") {
                displayResults("Media Stream Detected", cobaltData.url, [{url: cobaltData.url, quality: "Download Now", ext: "Media"}]);
            } else {
                throw new Error("Both engines failed. Target is highly protected.");
            }
        }
    } catch (err) {
        clearInterval(interval);
        loader.classList.add('hidden');
        error.classList.remove('hidden');
        error.innerText = "System Error: " + err.message;
    }

    function displayResults(title, thumb, links) {
        clearInterval(interval);
        progressBar.style.width = "100%";
        setTimeout(() => {
            loader.classList.add('hidden');
            results.classList.remove('hidden');
            let btnHtml = Array.isArray(links) 
                ? links.map(l => `<a href="${l.url}" target="_blank" class="bg-blue-600 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest block mb-2 hover:bg-blue-700 transition-all">Download ${l.quality || 'HD'} (${l.ext || 'File'})</a>`).join('')
                : `<a href="${links}" target="_blank" class="bg-blue-600 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest block hover:bg-blue-700 transition-all">Download Media</a>`;

            results.innerHTML = `
                <div class="glass p-8 rounded-[2rem] border-blue-500/10 text-center animate-in fade-in">
                    ${thumb ? `<img src="${thumb}" class="w-full max-w-sm mx-auto rounded-2xl mb-6 shadow-2xl">` : ''}
                    <h2 class="text-lg font-bold mb-6 font-gaming uppercase tracking-tighter">${title}</h2>
                    <div class="space-y-2">${btnHtml}</div>
                </div>`;
        }, 500);
    }
});