
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'lup',
    cluster: 'mt1',
    forceTLS: true,
    wsHost: window.location.hostname,
    wsPort: 6001,
    wssPort: 443,
    enabledTransports: ['ws', 'wss']
});

