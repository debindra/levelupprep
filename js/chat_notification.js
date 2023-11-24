/**
 *
 * chat_notification.js
 *
 * Initialization and overriding of project wide plugins.
 *
 *
 */

 class ChatNotification {
    _playAudio() {
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createBufferSource();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/audio/notification.mp3');
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', function (r) {
            audioCtx.decodeAudioData(
                    xhr.response,
                    function (buffer) {
                        source.buffer = buffer;
                        source.connect(audioCtx.destination);
                        source.loop = false;
                    });
            source.start(0);
        });
        xhr.send();
    }

    _showToast(message) {
        VanillaToasts.create({
            title: `<a href="/${message.receiver.role.toLowerCase()}/dashboard">${message.sender.name}</a>`,
            text: `<a style="color:black !important;" href="/${message.receiver.role.toLowerCase()}/dashboard">${message.message}</a>`,
            type: 'info',
            icon: '',
            timeout: 5000
        });
    }
}
