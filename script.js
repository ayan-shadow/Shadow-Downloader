const analyzeBtn = document.getElementById('analyzeBtn');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progressBar');
const results = document.getElementById('results');
const error = document.getElementById('error');
const videoUrl = document.getElementById('videoUrl');

// ✅ YOUR RAPIDAPI CREDENTIALS
const RAPID_API_KEY = "1ab09c6cccmsb3b437c4d2ebc0f0p1d517ejsn76f2c44d23d7";
const RAPID_API_HOST = "youtube-video-fast-downloader-24-7.p.rapidapi.com";

analyzeBtn.addEventListener('click', async () => {
    const url = videoUrl.value.trim();
    if (!url) return alert("Please provide a valid link, Boss.");

    // Initial UI State
    results.classList.add('hidden');
    error.classList.add('hidden');
    loader.classList.remove('hidden');
    
    let p = 0;
    const interval = setInterval(() => { 
        p += 5; 
        progressBar.style.width = p + "%"; 
        if (p >= 90) clearInterval(interval); 
    }, 120);

    try {
        // Universal API Fetch (Supports Photo & Video)
        const response = await fetch(`https://${RAPID_API_HOST}/get-video-info?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        });

        const data = await response.json();
        clearInterval(interval);
        progressBar.style.width = "100%";

        if (data && data.status === "ok") {
            setTimeout(() => {
                loader.classList.add('hidden');
                results.classList.remove('hidden');
                
                // Detection for Photo or Video
                const isPhoto = data.url.length === 1 && data.url[0].type === "jpg";

                results.innerHTML = `
                    <div class="glass p-8 rounded-[3rem] border-blue-500/10 text-center animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <div class="relative group mb-8">
                            <img src="${data.thumb}" class="w-full max-w-sm mx-auto rounded-[2rem] shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                            <div class="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        
                        <h2 class="text-xl font-bold mb-8 font-gaming tracking-tight px-4 leading-tight">${data.title}</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                            ${data.url.map(link => `
                                <a href="${link.url}" target="_blank" rel="nofollow" 
                                   class="bg-white/5 hover:bg-blue-600 border border-white/5 hover:border-blue-500 p-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all duration-300 flex items-center justify-between group">
                                    <span>${link.quality} ${link.ext.toUpperCase()}</span>
                                    <i class="fas fa-download opacity-40 group-hover:opacity-100 group-hover:translate-y-1 transition-all"></i>
                                </a>
                            `).join('')}
                        </div>
                        <p class="mt-8 text-[9px] text-gray-600 font-gaming uppercase tracking-[0.2em]">Source Detected: ${isPhoto ? 'Static Image' : 'Digital Motion Stream'}</p>
                    </div>`;
            }, 600);
        } else {
            throw new Error("Target Protected. RapidAPI cannot bypass this specific link.");
        }

    } catch (err) {
        clearInterval(interval);
        loader.classList.add('hidden');
        error.classList.remove('hidden');
        document.getElementById('errorMessage').innerText = "Access Denied: " + err.message;
    }
});