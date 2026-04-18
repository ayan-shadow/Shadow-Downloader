from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import requests
import io
import os

app = Flask(__name__)
CORS(app)

# Instagram aur FB ki images bypass karne ke liye proxy
@app.route('/proxy_img')
def proxy_img():
    img_url = request.args.get('url')
    if not img_url: return "No URL", 400
    try:
        # Headers add kiye taaki Instagram block na kare
        headers = {'User-Agent': 'Mozilla/5.0'}
        res = requests.get(img_url, headers=headers, stream=True, timeout=10)
        return send_file(io.BytesIO(res.content), mimetype='image/jpeg')
    except:
        return "Error", 500

@app.route('/smart_fetch', methods=['POST'])
def smart_fetch():
    try:
        data = request.get_json()
        url = data.get('url')
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': 'best',
            'cookiefile': 'cookies.txt',  # <--- Cookies file yahan add ho gayi hai
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = []
            
            if 'formats' in info:
                # Sirf wo formats le rahe hain jisme video aur audio dono ho
                for f in info['formats']:
                    if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                        formats.append({
                            "quality": f.get('format_note') or f.get('resolution') or "MP4",
                            "size": f"{round(f.get('filesize', 0) / 1048576, 1)} MB" if f.get('filesize') else "HD",
                            "url": f['url']
                        })
            
            if not formats and 'url' in info:
                formats.append({"quality": "High Quality", "size": "Auto", "url": info['url']})

            thumb = info.get('thumbnail', '')
            
            # --- FIX YAHAN HAI ---
            # Hum localhost ka naam nahi balki current server ka domain use karenge
            host = request.host_url.rstrip('/') 
            if "instagram" in url or "fbcdn" in thumb:
                thumb = f"{host}/proxy_img?url={thumb}"

            return jsonify({
                "status": "success",
                "title": info.get('title', 'Video Found'),
                "thumbnail": thumb,
                "platform": info.get('extractor_key', 'Social'),
                "formats": formats[:6]
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Render ke liye port dynamic hona chahiye
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)