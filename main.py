from flask import Flask, request, jsonify, send_file
from pytubefix import YouTube
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app) # Isse frontend aur backend connect honge

@app.route('/video_info', methods=['POST'])
def video_info():
    try:
        data = request.get_json()
        url = data.get('url')
        yt = YouTube(url)
        return jsonify({
            "title": yt.title,
            "author": yt.author,
            "thumbnail": yt.thumbnail_url,
            "views": yt.views
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/available_resolutions', methods=['POST'])
def available_resolutions():
    try:
        data = request.get_json()
        url = data.get('url')
        yt = YouTube(url)
        # Progressive streams (video+audio) filter kar raha hai (including 720p)
        res = [s.resolution for s in yt.streams.filter(progressive=True, file_extension='mp4') if s.resolution]
        return jsonify({"progressive": list(set(res))})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download/<resolution>', methods=['POST'])
def download(resolution):
    try:
        data = request.get_json()
        url = data.get('url')
        yt = YouTube(url)
        
        # Best Progressive Stream dhundna
        stream = yt.streams.filter(progressive=True, file_extension='mp4', resolution=resolution).first()
        
        if not stream:
            return jsonify({"error": "Resolution not found"}), 404

        # Video ko seedhe memory (buffer) mein download karna
        buffer = io.BytesIO()
        stream.stream_to_buffer(buffer)
        buffer.seek(0)

        # Browser ko file bhej dena
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"{yt.title}_{resolution}.mp4",
            mimetype="video/mp4"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🔥 AYANX Engine running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
