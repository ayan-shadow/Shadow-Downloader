async function analyzeVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    if (!url) return;

    // Reset UI
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');

    try {
        const response = await fetch('https://shadow-api-z7k0.onrender.com/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('results').classList.remove('hidden');
            
            document.getElementById('videoTitle').textContent = data.title;
            document.getElementById('thumbnail').src = data.thumbnail;
            document.getElementById('platform').textContent = data.platform;
            document.getElementById('duration').textContent = data.duration + 's';

            const list = document.getElementById('downloadList');
            list.innerHTML = '';
            
            data.downloads.forEach(dl => {
                const btn = document.createElement('div');
                btn.className = "glass p-4 rounded-2xl flex justify-between items-center border-white/5 hover:border-blue-500/30 transition-all";
                btn.innerHTML = `
                    <span class="font-gaming text-[10px] tracking-widest">${dl.quality}</span>
                    <a href="${dl.url}" target="_blank" onclick="showWarning()" class="bg-blue-600 text-[10px] font-bold px-4 py-2 rounded-lg">DOWNLOAD</a>
                `;
                list.appendChild(btn);
            });
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = err.message;
    }
}

function showWarning() {
    // Randomly show warning to make it look pro
    if(Math.random() > 0.5) {
        document.getElementById('warningPopup').classList.remove('hidden');
    }
}

document.getElementById('analyzeBtn').addEventListener('click', analyzeVideo);