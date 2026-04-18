from flask import Flask, request, jsonify, send_file
from pytubefix import YouTube
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app)

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
        stream = yt.streams.filter(progressive=True, file_extension='mp4', resolution=resolution).first()
        if not stream: return jsonify({"error": "Res not found"}), 404
        
        buffer = io.BytesIO()
        stream.stream_to_buffer(buffer)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=f"AyanX_{resolution}.mp4", mimetype="video/mp4")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)