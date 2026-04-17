class VideoDownloader {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        console.log("🚀 Shadow Downloader UI Loaded...");
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
            this.showError('Opps! Please enter a valid URL first.');
            return;
        }

        this.resetUI();
        this.showLoading();

        try {
            const response = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data);
            } else {
                this.showError(data.error || 'Server couldn\'t process this link.');
            }
        } catch (error) {
            this.showError('Connection Refused! Make sure your Backend server is running.');
            console.error("Fetch Error:", error);
        }
    }

    displayResults(data) {
        this.hideLoading();
        this.results.classList.remove('hidden');
        
        setTimeout(() => {
            this.results.scrollIntoView({ behavior: 'smooth' });
        }, 200);

        this.videoTitle.textContent = data.title || 'Unknown Video';
        this.thumbnail.src = data.thumbnail || 'https://via.placeholder.com/600x400?text=Shadow+Downloader';
        this.platform.textContent = data.platform || 'Platform';
        
        if (data.duration) {
            const mins = Math.floor(data.duration / 60);
            const secs = (data.duration % 60).toString().padStart(2, '0');
            this.duration.textContent = `${mins}:${secs}`;
        } else {
            this.duration.textContent = '00:00';
        }

        this.downloadList.innerHTML = '';

        if (data.downloads && data.downloads.length > 0) {
            data.downloads.forEach((download) => {
                const button = this.createDownloadButton(download);
                this.downloadList.appendChild(button);
            });
        } else {
            this.downloadList.innerHTML = '<p class="text-white text-center">No download links available for this quality.</p>';
        }

        this.results.classList.add('fade-in-up');
    }

    createDownloadButton(download) {
        const div = document.createElement('div');
        div.className = 'group bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] fade-in-up';

        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                        <i class="fas fa-play text-xl"></i>
                    </div>
                    <div>
                        <p class="text-white font-bold">${download.quality || '720p HD'}</p>
                        <p class="text-gray-400 text-sm">${download.size || 'Direct Link'}</p>
                    </div>
                </div>
                <a href="${download.url}" target="_blank" download rel="noopener noreferrer" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                    Download Now
                </a>
            </div>`;
        return div;
    }

    showLoading() { this.loading.classList.remove('hidden'); }
    hideLoading() { this.loading.classList.add('hidden'); }
    
    resetUI() {
        this.results.classList.add('hidden');
        this.error.classList.add('hidden');
    }

    showError(msg) {
        this.hideLoading();
        this.error.classList.remove('hidden');
        document.getElementById('errorMessage').textContent = msg;
        document.getElementById('errorTitle').textContent = "Server Error";
    }
}

new VideoDownloader();