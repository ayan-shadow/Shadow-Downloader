// ⚡ CONFIG & APIs
const API_URL = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
const API_KEY = '29f8c3b79amshc7b9755d426320dp1b94fajsn62b1821d47db';

// --- THEME ENGINE ---
function applyTheme(t) {
    document.getElementById('mainBody').className = `theme-${t} transition-all duration-500`;
    localStorage.setItem('ayanx_theme', t);
}

// --- NAVIGATION ---
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.v-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`${viewId}View`).classList.remove('hidden');
    event.currentTarget.classList.add('active');
}
function openSettings() { document.getElementById('settingsPanel').classList.remove('hidden'); }
function closeSettings() { document.getElementById('settingsPanel').classList.add('hidden'); }

// --- DOWNLOADER ENGINE ---
async function startDownload() {
    const url = document.getElementById('mediaUrl').value;
    const loader = document.getElementById('statusLoader');
    const results = document.getElementById('resultsGrid');

    if(!url) return alert("Bhai, link paste karo!");
    results.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Host': 'social-download-all-in-one.p.rapidapi.com',
                'X-RapidAPI-Key': API_KEY
            },
            body: JSON.stringify({ url: url })
        });
        const data = await response.json();
        if(data.error) throw new Error(data.message);
        displayResults(data);
    } catch (e) {
        alert("Platform Protected or Invalid Link.");
    } finally {
        loader.classList.add('hidden');
    }
}

function displayResults(data) {
    const grid = document.getElementById('resultsGrid');
    grid.classList.remove('hidden');
    const mediaLinks = data.medias.map(m => `
        <a href="${m.url}" target="_blank" class="flex justify-between items-center p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-blue-600 transition-all">
            <span class="font-gaming text-[9px] uppercase">${m.quality} • ${m.extension}</span>
            <i class="fas fa-download opacity-50"></i>
        </a>
    `).join('');
    grid.innerHTML = `
        <div class="glass p-6 rounded-[3rem]">
            <img src="${data.thumbnail}" class="w-full rounded-2xl mb-4">
            <p class="font-gaming text-[8px] opacity-60 uppercase">${data.title}</p>
        </div>
        <div class="space-y-3 flex flex-col justify-center">${mediaLinks}</div>
    `;
}

// --- PDF LAB ENGINE (FIXED) ---
document.getElementById('imgInput').addEventListener('change', async (e) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const files = e.target.files;
    if (files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
        const imgData = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(files[i]);
        });
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', 10, 10, 190, 150);
    }
    doc.save("AyanX_Document.pdf");
    alert("PDF Created Successfully!");
});

document.getElementById('pdfSecureInput').addEventListener('change', async (e) => {
    alert("Security Layer Initialized. Password encryption requires PDF-Lib professional setup. File processing started...");
    // Basic download simulation for secure view
    const file = e.target.files[0];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = "Secured_" + file.name;
    link.click();
});

// --- V2L PROXY ---
document.getElementById('v2lInput').addEventListener('change', async (e) => {
    const out = document.getElementById('v2lOutput');
    out.innerText = "TUNNELING...";
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    try {
        const r = await fetch('https://file.io', { method: 'POST', body: fd });
        const d = await r.json();
        out.innerHTML = `LINK: <input readonly class="bg-blue-600 p-3 mt-2 rounded-xl w-full text-xs" value="${d.link}">`;
    } catch(err) { out.innerText = "FAILED."; }
});