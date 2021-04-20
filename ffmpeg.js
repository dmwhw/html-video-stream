
/////flv.js需要禁止音频

//其他格式的视频  需要mp4封装才会循环播放
//
//ffmpeg -re  -stream_loop -1  -i test.mp4 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100  -f flv rtmp://localhost/live/0
//ffmpeg -re  -stream_loop -1  -i 265.mp4 -c:v libx264 -preset veryfast -tune zerolatency -an  -f flv rtmp://localhost/live/0

//rtsp流 记得需要tcp格式传输
//flv.js需要禁止音频！！！！
//ffmpeg   -rtsp_transport tcp -i rtsp://admin:password@192.233.1.102/Streaming/Channels/101 -c:v libx264 -an -preset veryfast -tune zerolatency -an -f flv rtmp://localhost/live/0

//纯的h264
//ffmpeg -re  -stream_loop -1 -i 264.mp4 -c copy -f flv  rtmp://localhost/live/0


//、查看视频格式

//ffprobe -print_format json -show_streams -select_streams v -hide_banner -v quiet