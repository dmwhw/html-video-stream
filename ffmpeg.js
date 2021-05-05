/////flv.js需要禁止音频
//其他格式的视频  需要mp4封装才会循环播放
//
//ffmpeg -re  -stream_loop -1  -i test.mp4 -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -ar 44100  -f flv rtmp://localhost/live/0
//ffmpeg -re  -stream_loop -1  -i 265.mp4 -c:v libx264 -preset veryfast -tune zerolatency -an  -f flv rtmp://localhost/live/0
//rtsp流 记得需要tcp格式传输
//flv.js需要禁止音频！！！！
//ffmpeg   -rtsp_transport tcp -i rtsp://admin:password@192.233.1.102/Streaming/Channels/101 -c:v libx264 -an -preset veryfast -tune zerolatency   -f flv rtmp://localhost/live/0
//纯的h264
//ffmpeg -re  -stream_loop -1 -i 264.mp4 -c copy -f flv  rtmp://localhost/live/0
//、查看视频格式
//ffprobe -print_format json -show_streams -select_streams v -hide_banner -v quiet
const { ProcessUtils } = require("./utils/ProcessUtils.js")
const isDevelopment = process.env.NODE_ENV !== 'production';
const path = require("path");
var url = path.resolve('./');
var ffmpegPath = path.join(url, 'ffmpeg');
var ffprobePath = path.join(url, 'ffprobe');
const child_process = require('child_process')
if (!isDevelopment) {
	ffmpegPath = path.join(url, 'resources' + path.sep + 'ffmpeg' + path.sep + 'ffmpeg');
	ffprobePath = path.join(url, 'resources' + path.sep + 'ffmpeg' + path.sep + 'ffprobe');
}
const FFProbe = {
	getFFprobe() {
		return ffprobePath;
	},
	parseFFrobeData(str) {
		try {
			var data = JSON.parse(str);
			if (!data["streams"]) {
				return null;
			}
			if (!data["streams"][0]) {
				return null;
			}
			if (!data["streams"][0]["codec_name"]) {
				return null;
			}
			return data["streams"][0]["codec_name"];
		} catch (e) {
			console.error(e);
		}
		return null;
	},
	async getMediaCodec(input, callback) {
		var datastr = "";
		let mediaFunc = FFProbe.getMediaCodecPromise(input);
		datastr = await mediaFunc;
		if (callback) {
			callback(this.parseFFrobeData(datastr));
		}
	},
	getMediaCodecPromise(input) {
		return new Promise((resolve) => {
			var ffrobeExe = FFProbe.getFFprobe();
			var cmdArray = ['-print_format', 'json', '-show_streams', '-select_streams', 'v', '-hide_banner', '-v', 'quiet', input];
			var ppp = ProcessUtils.execFile(ffrobeExe, cmdArray, { shell: false }, function(error, stdout, stderr) {
				if (error) {
					console.log(error);
					console.log('---------error---------', error);
					resolve(false);
				} else {
					resolve(stdout);
				}
			});
		});
	}
}

function FlvPushWork(config) {
	var that = this;
	this.config = {
		source: config.source == null ? "" : config.source,
		target: config.target,
		tcp: config.tcp != null ? config.tcp : false,
		loop: config.loop != null ? config.loop : false,
		h264: config.h264 != null ? config.h264 : false,
		h264Codec: config.h264Codec != null ? config.h264Codec : "libx264",
		preset: config.preset,
		zerolatency: config.zerolatency,
		audioCodec: config.audioCodec,
		inputOption: config.inputOption == null ? [] : config.inputOption,
		outputOption: config.outputOption == null ? [] : config.outputOption,
	}
	var sourceLowercase = this.config.source.toLowerCase();
	var regex=new RegExp( "^(http|https|rtsp|rtsps|rtmp|rtmps){1}://(\\S)+$") ;
	this.isStream = regex.test(sourceLowercase);
	console.log("source is stream?"+this.isStream);
	this.started = false;
	this.start = function() {
		if (that.started = false) {
			return;
		}
		var ffrobeExe = FFProbe.getFFprobe();
		var loopingOption = [];
		if (!that.isStream && that.config.loop == true) {
			loopingOption.push("-re");
			loopingOption.push("-stream_loop");
			loopingOption.push("-1");
		}
		var tcpOption = [];
		if (that.isStream && that.config.tcp == true) {
			tcpOption.push("-rtsp_transport");
			tcpOption.push("tcp");
		}
		//codec
		var videoOption = [];
		if (that.config.h264 == true) {
			videoOption.push("-c");
			videoOption.push("copy");
		} else {
			videoOption.push("-c:v");
			videoOption.push(that.config.h264Codec);
		}
		// -preset veryfast -tune zerolatency -an
		if (that.config.preset != null) {
			videoOption.push("-preset");
			videoOption.push(that.config.preset);
		}
		if (that.config.zerolatency != null) {
			videoOption.push("-tune");
			videoOption.push("zerolatency");
		}
		var audioOption = [];
		if (that.config.audioCodec != null) {
			if (that.config.audioCodec) {
				audioOption.push("-c:a");
				audioOption.push(that.config.audioCodec);
			} else {
				audioOption.push("-an");
			}
		}
		var cmdArray = [...loopingOption, ...tcpOption, ...that.config.inputOption, '-i',that.config.source , ...videoOption,
			 ...audioOption, ...that.config.outputOption, '-f', 'flv', that.config.target
		];
		console.log(cmdArray);
		that.pushwork = child_process.spawn(ffmpegPath, cmdArray, { shell: true, detached: false, });
		that.pushwork.on('exit', (code, signal) => {
			if (code != 0) {
				console.error('pushwork   exited with error')
			} else {
				console.log('pushwork   exited ok')
			}
		});
		that.pushwork.on('error', (err) => {
			console.error('pushwork start fail!!');
		});
		that.pushwork.stderr.on('data', (data) => {
		//	console.error(data.toString());
		});
		//that.pushwork.stdout.on('data', (data) => {
			//console.log(data.toString());
		//});
		that.started = true;
	}
	this.stop = function() {
		var pid = that.pushwork.pid;
		child_process.exec(`TASKKILL /F /PID ${pid} /T`, {}, function(error, stdout, stderr) {
			console.log("close pushwork");
			if (error) {
				console.log(error);
			}
		});
		that.pushwork.kill('SIGINT');
		that.started = false;
	}
}
const FFMpeg = {
	getFlvPushWork(config) {
		return new FlvPushWork(config);
	}
}
module.exports = {
	FFProbe,
	FFMpeg
}
