const fs = require("fs");
const crypto = require("crypto");
const net = require('net');
const ssh2 = require("ssh2");
const portfinder = require('portfinder');
const config = require("./config.js");

new ssh2.Server(
	{
		hostKeys: [fs.readFileSync("host.key")],
	},
	function (client) {
		console.log("Client connected!");
		client
			.on("authentication", function (ctx) {
				let user = Buffer.from(ctx.user)
				var foundLogin = config.logins.filter((item) => {
					return ctx.user.length === item.user.length && crypto.timingSafeEqual(Buffer.from(item.user), user)
				})
				if (foundLogin.length === 0) {
					return ctx.reject();
				}
				foundLogin = foundLogin[0]
				switch (ctx.method) {
					case "password":
						if (
							ctx.password.length !== foundLogin.pass.length ||
							!crypto.timingSafeEqual(Buffer.from(ctx.password), Buffer.from(foundLogin.pass))
						) {
							return ctx.reject();
						}
						break;
					default:
						return ctx.reject();
				}
				ctx.accept();
			})
			.on("ready", function () {
				console.log("Client authenticated!");
				client.on("session", function (accept, reject) {
					let session = accept();
					session.on('shell', function (accept, reject) {
						let stream = accept();
					});
				});
				client.on('request', (accept, reject, name, info) => {
					if (name === 'tcpip-forward') {
						portfinder.getPort({
							port: config.portRange[0],    // minimum port
							stopPort: config.portRange[1] // maximum port
						}, function (err, port) {
							if (err) {
								reject()
							}
							console.log(`Client forwarding port ${port}...`);
							var localServer = net.createServer(function (socket) {
								client.forwardOut(
									info.bindAddr, port,
									"127.0.0.1", port,
									(err, upstream) => {
										if (err) {
											socket.end();
											return console.error('not working: ' + err);
										}
										socket.pipe(upstream)
										upstream.pipe(socket)
									});
							});
							localServer.listen(port, "0.0.0.0", null, (function () {
								accept(port)
							}))
							client.on('end', function () {
								localServer.close()
							})
						});
					} else {
						reject();
					}
				})
			})
			.on("end", function () {
				console.log("Client disconnected");
			});
	}
).listen(config.sshPort, "0.0.0.0", function () {
	console.log("Listening on port " + this.address().port);
});

process.on('uncaughtException', function (err) {
	console.error("Error (ignored)", err)
});