const path = require("path");
const express = require('express');
const app = express();
const eventsCenter = require("./eventsCenter");
const axios = require("axios");
const { delay } = require("./utils");

app.use(express.static(path.join(__dirname, "../static")));

app.get('/sseStream', function (request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const { uid, rid } = request.query;
  console.log("uid:", uid);

  // 查询用户的点赞
  getStars(uid, rid);

  eventsCenter.removeAllListeners("ssePush");

  eventsCenter.on("ssePush", function (event, data) {
    // console.log("push message to clients");
    response.write("event: " + String(event) + "\n" + "data: " + JSON.stringify(data) + "\n\n");

  });
});


app.listen(8088, function () {
  console.log("listening at port:", 8088);
});


const headers = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "cache-control": "max-age=0"
};

const url = "https://api.juejin.cn/interact_api/v1/digg/query_page"

async function getStars(uid, rid) {

  let cursor = 0

  const data = {
    cursor: `${cursor}`,
    item_type: 2,
    sort_type: 2,
    user_id: uid,
  }

  let res = {
    has_more: true
  };

  while (res.has_more) {

    data.cursor = `${cursor}`

    res = (await axios.default.post(url, data, {
      headers
    })).data;

    console.log("res:", data, res)

    eventsCenter.emit("ssePush", "messageTotal", {
      uid,
      rid,
      count: res.count
    });


    // console.log("res.data", res)

    eventsCenter.emit("ssePush", "message", {
      uid,
      rid,
      datas: (res.data || []).map(d => ({
        user_id: d.author_user_info.user_id,
        user_name: d.author_user_info.user_name,
        title: d.article_info.title
      }))
    });

    cursor += 10;

    await delay(undefined, 16).run();
  }

  eventsCenter.emit("ssePush", "messageEnd", {
    uid,
    rid
  })

}