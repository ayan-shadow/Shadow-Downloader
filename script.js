const analyzeBtn = document.getElementById('analyzeBtn');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const results = document.getElementById('results');
const error = document.getElementById('error');
const videoUrl = document.getElementById('videoUrl');

// API LINK (Render)
const API_BASE = "https://shadow-api-8f1u.onrender.com/api/download?url=";

analyzeBtn.addEventListener('click', async () => {
    const url = videoUrl.value.trim();
    if (!url) return;

    // UI Reset
    results.classList.add('hidden');
    error.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    
    // Animation
    let progress = 0;
    const interval = setInterval(() => {
        progress += (progress < 90) ? 2 : 0.1;
        progressBar.style.width = progress + "%";
    }, 100);

    try {
        const response = await fetch(`${API_BASE}${encodeURIComponent(url)}`);
        const data = await response.json();

        clearInterval(interval);
        progressBar.style.width = "100%";

        setTimeout(() => {
            progressContainer.classList.add('hidden');
            if (data.success) {
                results.classList.remove('hidden');
                results.innerHTML = `
                    <div class="glass p-6 rounded-[2.5rem] border-blue-500/20 text-center animate-in fade-in duration-500">
                        <img src="${data.info.thumbnail}" class="w-full max-w-sm mx-auto rounded-2xl mb-6 shadow-2xl">
                        <h2 class="text-lg font-bold mb-6 font-gaming tracking-tight">${data.info.title}</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${data.links.map(l => `
                                <a href="${l.url}" target="_blank" class="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                    Download ${l.quality} (${l.format})
                                </a>
                            `).join('')}
                        </div>
                    </div>`;
            } else {
                throw new Error("Server is Busy. Please try again after 1 minute.");
            }
        }, 500);
    } catch (err) {
        clearInterval(interval);
        progressContainer.classList.add('hidden');
        error.classList.remove('hidden');
        document.getElementById('errorMessage').innerText = err.message;
    }
});