const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

// ✅ Security & Connectivity Setup
app.use(cors({ origin: '*' })); // Allows frontend to talk to backend
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('dev'));

// --- DOWNLOADER FUNCTIONS ---

async function analyzeYouTube(url) {
    try {
        const info = await ytdl.getInfo(url);
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        return {
            success: true,
            platform: 'YouTube',
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            duration: info.videoDetails.lengthSeconds,
            downloads: formats.slice(0, 3).map(f => ({
                quality: f.qualityLabel || '360p',
                url: f.url,
                size: f.contentLength ? `${(f.contentLength / (1024*1024)).toFixed(2)} MB` : 'Auto'
            }))
        };
    } catch (err) {
        console.error("YouTube Error:", err.message);
        throw new Error('YouTube link could not be processed. It might be private or restricted.');
    }
}

async function analyzeInstagram(url) {
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    try {
        const page = await browser.newPage();
        // Mimic a mobile browser for better access
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const videoData = await page.evaluate(() => {
            const video = document.querySelector('video');
            return {
                src: video ? video.src : null,
                title: document.title || 'Instagram Video'
            };
        });

        await browser.close();
        if(!videoData.src) throw new Error('No video found on this page.');

        return {
            success: true,
            platform: 'Instagram',
            title: videoData.title,
            thumbnail: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
            downloads: [{ quality: 'Original HD', url: videoData.src, size: 'Auto' }]
        };
    } catch (e) {
        await browser.close();
        throw new Error('Instagram analysis failed. Try again.');
    }
}

// --- MAIN API ROUTE ---

app.post('/api/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'Please provide a URL' });

    console.log(`[Shadow-Log] Analyzing URL: ${url}`);

    try {
        let result;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            result = await analyzeYouTube(url);
        } else if (url.includes('instagram.com')) {
            result = await analyzeInstagram(url);
        } else {
            // Basic fallback for direct video links
            result = {
                success: true,
                platform: 'Web Video',
                title: 'Found Video Content',
                thumbnail: 'https://via.placeholder.com/300x200?text=Video+Detected',
                downloads: [{ quality: 'HD', url: url, size: 'Auto' }]
            };
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n-----------------------------------------`);
    console.log(`🚀 SHADOW SERVER IS LIVE AT PORT: ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------\n`);
});