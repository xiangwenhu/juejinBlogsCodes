const path = require("path");
const express = require('express');
const app = express();
const eventsCenter = require("./eventsCenter");


app.use(express.static(path.join(__dirname, "../static")));

app.get('/sseStream', function (request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });


  eventsCenter.on("push", function (event, data) {
    console.log("push message to clients");
    response.write("event: " + String(event) + "\n" + "data: " + JSON.stringify(data) + "\n\n");

  });
});


app.listen(8088, function () {
  console.log("listening at port:", 8088);
});


setInterval(() => {
  eventsCenter.emit("push", "message",  {
    now: Date.now()
  })
}, 1000);