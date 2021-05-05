require("./http.js")
require("./nms.js");
const { FFProbe, FFMpeg } = require("./ffmpeg.js");
var source = "rtsp://admin:2284424q@172.16.102.38/h264/ch1/main/av_stream";
var pushwork;
var codec = FFProbe.getMediaCodec(source, codec => {
	console.log("code is " + codec);
	pushwork=FFMpeg.getFlvPushWork({
		source: source,
		target: "rtmp://localhost/live/0",
		tcp: true,
		loop: true,
		h264: codec == "h264",
		preset: "veryfast",
		zerolatency: true,
		audioCodec:false,
	});
	pushwork.start();
});
console.log("started");
