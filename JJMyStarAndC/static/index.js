
// 提交事件部分
const regUid = /^[0-9]*$/
const uidEl = document.getElementById("inputUserId");
document.getElementById("btnSubmit").addEventListener("click", function () {
    const uid = uidEl.value;
    if (!regUid.test(uid)) {
        return alert("请输入正确的用户ID");
    }
    window.location.href = "./index.html?uid=" + uidEl.value;
});

; (function init() {
    var usp = new URLSearchParams(location.href.split("?")[1]);
    var rid = usp.get("rid") || Math.random();
    var uid = usp.get("uid")

    if (!!uid) {
        uidEl.value = uid;
    }

    if (!regUid.test(uid)) {
        return;
    }

    startSSE(uid, rid);

})();

const totalStarsEl = document.getElementById("totalStars");
const gotStarsEl = document.getElementById("gotStars");


function startSSE(uid, rid) {
    const listArr = [];
    // SSE部分
    const source = new EventSource(`/sseStream?uid=${uid}&rid=${rid}`);

    // 收到新数据
    source.addEventListener('message', function (e) {
        let data = JSON.parse(e.data)
        // console.log("meesage", data);

        // 不是需要的数据
        if (data.uid != uid || data.rid != rid) {
            return;
        }

        listArr.push(...data.datas);
        // console.log("listArr:", listArr);
        renderList(listArr);
        gotStarsEl.innerHTML = listArr.length;

    }, false)

    // 收到总数据消息
    source.addEventListener('messageTotal', function (e) {
        let data = JSON.parse(e.data)
        // console.log("messageTotal", data);

        // 不是需要的数据
        if (data.uid != uid || data.rid != rid) {
            return;
        }

        totalStarsEl.innerHTML = data.count;
    }, false)

    // 统计完毕
    source.addEventListener('messageEnd', function (e) {
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
}

const tbodyListEl = document.getElementById("tbodyList");
const hasOwnProperty = Object.prototype.hasOwnProperty;
// 数据渲染部分
function renderList(list = []) {

    // 统计
    const statObj = list.reduce((obj, cur) => {
        if (hasOwnProperty.call(obj, cur.user_id)) {
            obj[cur.user_id].count += 1;
        } else {
            obj[cur.user_id] = {
                count: 1,
                ...cur
            };
        }
        return obj;
    }, {});

    // 分组
    const groupList = Object
        .keys(statObj) 
        .map(k => statObj[k])  //分组
        .sort((a, b) => a.count > b.count ? -1 : 1);  // 排序

    tbodyListEl.innerHTML = groupList.map(d => {
        return `
            <tr>
                <td><a href="https://juejin.cn/user/${d.user_id}" target="_blank">${d.user_name}</a></td>
                <td class="count">${d.count}</td>           
            </tr>      
        `
    }).join("")

}
