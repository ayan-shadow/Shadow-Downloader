const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');

const app = express();
// Render aksar PORT environment variable deta hai, isliye process.env.PORT zaroori hai
const PORT = process.env.PORT || 3000;

// ✅ Security & Connectivity Setup
app.use(cors({ origin: '*' })); 
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('dev'));

// --- DOWNLOADER FUNCTIONS ---

async function analyzeYouTube(url) {
    try {
        // Basic Info Fetch
        const info = await ytdl.getInfo(url);
        // Video + Audio wale formats nikalna
        const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        return {
            success: true,
            platform: 'YouTube',
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.pop().url,
            duration: info.videoDetails.lengthSeconds,
            downloads: formats.slice(0, 5).map(f => ({
                quality: f.qualityLabel || '360p',
                url: f.url,
                size: f.contentLength ? `${(f.contentLength / (1024*1024)).toFixed(2)} MB` : 'Auto'
            }))
        };
    } catch (err) {
        console.error("YouTube Error:", err.message);
        throw new Error('YouTube ne access block kiya hai. Kuch der baad try karein.');
    }
}

async function analyzeInstagram(url) {
    // ⚠️ RENDER PE PUPPETEER CHALANE KE LIYE YE ARGS ZAROORI HAIN
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', 
            '--disable-gpu'
        ] 
    });
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const videoData = await page.evaluate(() => {
            const video = document.querySelector('video');
            const ogTitle = document.querySelector('meta[property="og:title"]');
            return {
                src: video ? video.src : null,
                title: ogTitle ? ogTitle.content : document.title
            };
        });

        await browser.close();
        if(!videoData.src) throw new Error('Private Video ya Link galat hai.');

        return {
            success: true,
            platform: 'Instagram',
            title: videoData.title,
            thumbnail: 'https://cdn-icons-png.flaticon.com/512/174/174855.png',
            downloads: [{ quality: 'High Quality', url: videoData.src, size: 'Auto' }]
        };
    } catch (e) {
        if(browser) await browser.close();
        throw new Error('Instagram fetch failed: ' + e.message);
    }
}

// --- MAIN API ROUTE ---

app.post('/api/analyze', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'URL missing hai, Boss!' });

    console.log(`[Shadow-Log] User is analyzing: ${url}`);

    try {
        let result;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            result = await analyzeYouTube(url);
        } else if (url.includes('instagram.com')) {
            result = await analyzeInstagram(url);
        } else {
            // Facebook/Twitter ke liye abhi simple fallback
            result = {
                success: true,
                platform: 'Web Content',
                title: 'Video Detected',
                thumbnail: 'https://via.placeholder.com/300x200?text=Shadow+Downloader',
                downloads: [{ quality: 'Source', url: url, size: 'Auto' }]
            };
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check route taaki Render ko pata chale server zinda hai
app.get('/', (req, res) => res.send('🚀 Shadow Downloader API is Running!'));

app.listen(PORT, () => {
    console.log(`🚀 Server started on Port: ${PORT}`);
});