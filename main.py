from flask import Flask, request, jsonify
from pytubefix import YouTube
from flask_cors import CORS # Ye browser permission ke liye hai
import re
import os

app = Flask(__name__)
CORS(app) # Isse aapki HTML file backend se connect ho payegi

# Video download karne ka function
def download_video(url, resolution):
    try:
        yt = YouTube(url)
        # Sirf wahi stream lega jo MP4 ho aur progressive ho (video+audio sath mein)
        stream = yt.streams.filter(progressive=True, file_extension='mp4', resolution=resolution).first()
        
        if stream:
            # Ye folder 'Universal Downloader/Backend/downloads' mein save karega
            out_dir = os.path.join(os.getcwd(), "downloads")
            if not os.path.exists(out_dir):
                os.makedirs(out_dir)
            
            stream.download(output_path=out_dir)
            return True, None
        else:
            return False, "Resolution not found."
    except Exception as e:
        return False, str(e)

# Route: Video ki information nikalne ke liye
@app.route('/video_info', methods=['POST'])
def video_info():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL missing"}), 400
    try:
        yt = YouTube(url)
        info = {
            "title": yt.title,
            "author": yt.author,
            "views": yt.views,
            "thumbnail": yt.thumbnail_url
        }
        return jsonify(info), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route: Available resolutions check karne ke liye
@app.route('/available_resolutions', methods=['POST'])
def available_resolutions():
    data = request.get_json()
    url = data.get('url')
    try:
        yt = YouTube(url)
        res = [s.resolution for s in yt.streams.filter(progressive=True, file_extension='mp4') if s.resolution]
        return jsonify({"progressive": list(set(res))}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route: Download trigger karne ke liye
@app.route('/download/<resolution>', methods=['POST'])
def trigger_download(resolution):
    data = request.get_json()
    url = data.get('url')
    success, error = download_video(url, resolution)
    if success:
        return jsonify({"message": "Downloaded successfully in Backend/downloads folder"}), 200
    else:
        return jsonify({"error": error}), 500

if __name__ == '__main__':
    print("AYANX Engine starting on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)