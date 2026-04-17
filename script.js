class VideoDownloader {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        console.log("🚀 Shadow Downloader UI Connected to Cloud...");
    }

    initializeElements() {
        this.urlInput = document.getElementById('videoUrl');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.loading = document.getElementById('loading');
        this.results = document.getElementById('results');
        this.error = document.getElementById('error');
        this.downloadList = document.getElementById('downloadList');
        this.thumbnail = document.getElementById('thumbnail');
        this.videoTitle = document.getElementById('videoTitle');
        this.platform = document.getElementById('platform');
        this.duration = document.getElementById('duration');
    }

    bindEvents() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeVideo());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzeVideo();
        });
    }

    async analyzeVideo() {
        const url = this.urlInput.value.trim();

        if (!url) {
            this.showError('Please enter a link first, Boss!');
            return;
        }

        this.resetUI();
        this.showLoading();

        try {
            // ✅ Your Permanent Render Link
            const response = await fetch('https://shadow-api-z7k0.onrender.com/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data);
            } else {
                this.showError(data.error || 'Server found an issue with this link.');
            }
        } catch (error) {
            this.showError('Server is waking up... Please wait 30 seconds and try again.');
            console.error("Fetch Error:", error);
        }
    }

    displayResults(data) {
        this.hideLoading();
        this.results.classList.remove('hidden');
        
        setTimeout(() => {
            this.results.scrollIntoView({ behavior: 'smooth' });
        }, 300);

        this.videoTitle.textContent = data.title || 'Untitled Video';
        this.thumbnail.src = data.thumbnail || 'https://via.placeholder.com/600x400?text=Video+Found';
        this.platform.textContent = data.platform || 'Social Media';
        
        if (data.duration) {
            const mins = Math.floor(data.duration / 60);
            const secs = (data.duration % 60).toString().padStart(2, '0');
            this.duration.textContent = `${mins}:${secs}`;
        } else {
            this.duration.textContent = 'Live/HD';
        }

        this.downloadList.innerHTML = '';

        if (data.downloads && data.downloads.length > 0) {
            data.downloads.forEach((download) => {
                const button = this.createDownloadButton(download);
                this.downloadList.appendChild(button);
            });
        } else {
            this.downloadList.innerHTML = '<p class="text-white text-center">No links found for this video.</p>';
        }
    }

    createDownloadButton(download) {
        const div = document.createElement('div');
        div.className = 'group bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300';

        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <i class="fas fa-download"></i>
                    </div>
                    <div>
                        <p class="text-white font-bold">${download.quality || 'HD'}</p>
                        <p class="text-gray-400 text-sm">${download.size || 'Direct'}</p>
                    </div>
                </div>
                <a href="${download.url}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all">
                    Download
                </a>
            </div>`;
        return div;
    }

    showLoading() { this.loading.classList.remove('hidden'); }
    hideLoading() { this.loading.classList.add('hidden'); }
    resetUI() { this.results.classList.add('hidden'); this.error.classList.add('hidden'); }
    showError(msg) { this.hideLoading(); this.error.classList.remove('hidden'); document.getElementById('errorMessage').textContent = msg; }
}

new VideoDownloader();