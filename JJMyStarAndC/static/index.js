
const source = new EventSource('/sseStream')

source.addEventListener('message', function (e) {
    let data = JSON.parse(e.data)
    console.log("meesage", data);
}, false)

source.addEventListener('open', function (e) {
    console.log("Connected to /stream");
}, false)

source.addEventListener('error', function (e) {
    if (e.target.readyState == EventSource.CLOSED) {
        console.log("Disconnected from /stream");
    } else if (e.target.readyState == EventSource.CONNECTING) {
        console.log('Connecting to /stream');
    }
}, false);