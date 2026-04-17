const analyzeBtn = document.getElementById('analyzeBtn');
const videoUrl = document.getElementById('videoUrl');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');

// API URL (Aapne jo Render par banayi hai)
const API_BASE = "https://shadow-api-8f1u.onrender.com/api/download?url=";

analyzeBtn.addEventListener('click', async () => {
    const url = videoUrl.value.trim();
    if (!url) return;

    // Reset UI
    results.classList.add('hidden');
    error.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE}${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.success) {
            loading.classList.add('hidden');
            results.classList.remove('hidden');
            
            // Set Video Info
            document.getElementById('thumbnail').src = data.info.thumbnail;
            document.getElementById('videoTitle').innerText = data.info.title;
            document.getElementById('platform').innerText = data.info.source;
            document.getElementById('duration').innerText = data.info.duration || "HD";

            // Generate Download Buttons
            const downloadList = document.getElementById('downloadList');
            downloadList.innerHTML = data.links.map(link => `
                <a href="${link.url}" target="_blank" rel="nofollow" 
                   class="glass p-4 rounded-xl border-blue-500/20 flex justify-between items-center hover:bg-blue-600/10 transition-all">
                    <span class="font-bold text-sm">${link.quality} (${link.format})</span>
                    <i class="fas fa-download text-blue-500"></i>
                </a>
            `).join('');
        } else {
            throw new Error(data.message || "Bhai, link scan nahi ho raha.");
        }
    } catch (err) {
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        errorMessage.innerText = err.message;
    }
});