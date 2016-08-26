"use Strict";
// 作者：whitebaby
//  邮箱：632244160@qq.com
//  移动端地址：http://shouji.baidu.com/software/9797753.html 
//  版本v1.0.0 
$(function() {
    var u = {
        getInstance: function(g) {
            function h(a) {
                var b = "",
                    b = 1 === a.numUsers ? b + "there's 1 participant" : b + ("there are " + a.numUsers + " participants");
                k(b)
            }

            function k(a, b) {
                var e = $("<li>").addClass("log").text(a);
                v(e, b)
            }

            function d(a, b) {
                var e = w(a);
                b = b || {};
                0 !== e.length && (b.fade = !1, e.remove());
                var e = $('<span class="username"/>').text(a.username).css("color", E(a.username)),
                    f = $('<span class="messageBody">').text(a.message),
                    c = a.typing ? "typing" : "",
                    e = $('<li class="message"/>').data("username", a.username).addClass(c).append(e, f);
                v(e, b)
            }

            function x(a) {
                w(a).fadeOut(function() {
                    $(this).remove()
                })
            }

            function v(a, b) {
                var e = $(a);
                b || (b = {});
                "undefined" === typeof b.fade && (b.fade = !0);
                "undefined" === typeof b.prepend && (b.prepend = !1);
                b.fade && e.hide().fadeIn(150);
                b.prepend ? n.prepend(e) : n.append(e);
                n[0].scrollTop = n[0].scrollHeight
            }

            function y(a) {
                return $("<div/>").text(a).text()
            }

            function u() {
                q && (m || (m = !0, c.emit("typing")), z = (new Date).getTime(), setTimeout(function() {
                    400 <= (new Date).getTime() - z && m && (c.emit("stop typing"), m = !1)
                }, 400))
            }

            function w(a) {
                return $(".typing.message").filter(function(b) {
                    return $(this).data("username") === a.username
                })
            }

            function E(a) {
                for (var b = 7, e = 0; e < a.length; e++) b = a.charCodeAt(e) + (b << 5) - b;
                return A[Math.abs(b % A.length)]
            }

            function B(a, b) {
                a && (-45 > b && (b = -45), -20 < b && (b = -20), a.value = b)
            }
            var A = "#e21400 #91580f #f8a700 #f78b00 #58dc00 #287b00 #a8f07a #4ae8c4 #3b88eb #3824aa #a700ff #d300e7".split(" "),
                F = $(window),
                C = $(".usernameInput"),
                n = $(".messages"),
                l = $(".inputMessage"),
                r = $(".login.page"),
                G = $(".chat.page"),
                p, q = !1,
                m = !1,
                z, t = C.focus(),
                c = io();
            F.keydown(function(a) {
                a.ctrlKey || a.metaKey || a.altKey || t.focus();
                if (13 === a.which)
                    if (p) a = l.val(), (a = y(a)) && q && (l.val(""), d({
                        username: p,
                        message: a
                    }), c.emit("new message", a)), c.emit("stop typing"), m = !1;
                    else if (p = y(C.val().trim())) r.fadeOut(), G.show(), r.off("click"), t = l.focus(), c.emit("add user", p)
            });
            l.on("input", function() {
                u()
            });
            r.click(function() {
                t.focus()
            });
            l.click(function() {
                l.focus()
            });
            c.on("login", function(a) {
                q = !0;
                k("Welcome to Socket.IO Chat – ", {
                    prepend: !0
                });
                h(a);
                console.log(a)
            });
            c.on("new message", function(a) {
                d(a)
            });
            c.on("user joined", function(a) {
                k(a.username + " joined");
                h(a)
            });
            c.on("user left", function(a) {
                k(a.username + " left");
                h(a);
                x(a)
            });
            c.on("typing", function(a) {
                a.typing = !0;
                a.message = "is typing";
                d(a)
            });
            c.on("stop typing", function(a) {
                x(a)
            });
            var D = g.toString();
            console.log(g);
            var f = new SimpleWebRTC({
                localVideoEl: "localVideo",
                remoteVideosEl: "",
                autoRequestMedia: !0,
                debug: !1,
                detectSpeakingEvents: !0,
                autoAdjustMic: !1
            });
            f.on("readyToCall", function() {
                D && f.joinRoom(D)
            });
            f.on("localStream", function(a) {
                (a = document.querySelector("form>button")) && a.removeAttribute("disabled");
                $("#localVolume").show()
            });
            f.on("localMediaError", function(a) {});
            f.on("localScreenAdded", function(a) {
                a.onclick = function() {
                    a.style.width = a.videoWidth + "px";
                    a.style.height = a.videoHeight + "px"
                };
                document.getElementById("localScreenContainer").appendChild(a);
                $("#localScreenContainer").show()
            });
            f.on("localScreenRemoved", function(a) {
                document.getElementById("localScreenContainer").removeChild(a);
                $("#localScreenContainer").hide()
            });
            f.on("videoAdded", function(a, b) {
                console.log("video added", b);
                var e = document.getElementById("remotes");
                if (e) {
                    var c = document.createElement("div");
                    c.className = "videoContainer";
                    c.id = "container_" + f.getDomId(b);
                    c.appendChild(a);
                    a.oncontextmenu = function() {
                        return !1
                    };
                    a.onclick = function() {
                        c.style.width = a.videoWidth + "px";
                        c.style.height = a.videoHeight + "px"
                    };
                    var d = document.createElement("meter");
                    d.id = "volume_" + b.id;
                    d.className = "volume";
                    d.min = -45;
                    d.max = -20;
                    d.low = -40;
                    d.high = -25;
                    c.appendChild(d);
                    if (b && b.pc) {
                        var g = document.createElement("div");
                        g.className = "connectionstate";
                        c.appendChild(g);
                        b.pc.on("iceConnectionStateChange", function(a) {
                            switch (b.pc.iceConnectionState) {
                                case "checking":
                                    g.innerText = "Connecting to peer...";
                                    break;
                                case "connected":
                                case "completed":
                                    $(d).show();
                                    g.innerText = "Connection established.";
                                    break;
                                case "disconnected":
                                    g.innerText = "Disconnected.";
                                    break;
                                case "failed":
                                    g.innerText = "Connection failed.";
                                    break;
                                case "closed":
                                    g.innerText = "Connection closed."
                            }
                        })
                    }
                    e.appendChild(c)
                }
            });
            f.on("videoRemoved", function(a, b) {
                console.log("video removed ", b);
                var c = document.getElementById("remotes"),
                    d = document.getElementById(b ? "container_" + f.getDomId(b) : "localScreenContainer");
                c && d && c.removeChild(d)
            });
            f.on("volumeChange", function(a, b) {
                B(document.getElementById("localVolume"), a)
            });
            f.on("remoteVolumeChange", function(a, b) {
                B(document.getElementById("volume_" + a.id), b)
            });
            f.on("iceFailed", function(a) {
                a = document.querySelector("#container_" + f.getDomId(a) + " .connectionstate");
                console.log("local fail", a);
                a && (a.innerText = "Connection failed.", fileinput.disabled = "disabled")
            });
            f.on("connectivityError", function(a) {
                a = document.querySelector("#container_" + f.getDomId(a) + " .connectionstate");
                console.log("remote fail", a);
                a && (a.innerText = "Connection failed.", fileinput.disabled = "disabled")
            })
        }
    };
    (new Promise(function(g) {
        var h = io.connect(),
            k = (new Date).getTime();
        h.emit("roomFind", k);
        h.on("login", function(d) {
            console.log(d)
        });
        h.on("roomFindResult", function(d) {
            console.log(d.targetRoom);
            g(d.targetRoom)
        })
    })).then(function(g) {
        console.log(g);
        u.getInstance(g)
    })
});
