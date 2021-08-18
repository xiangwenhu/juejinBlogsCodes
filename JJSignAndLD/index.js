
; (function () {
    'use strict';

    console.log("游猴脚本");

    const styleContent = `
    ._jj_draw_container {
        position:fixed;
        top: 80px;
        right: 0;
        z-index: 9999;
        background-color: rgba(0,0,0,0.6);
        padding: 20px;
    }

        ._jj_button {
            padding: 6px;
            background-color: #428bca;
            border-color: #357ebd;
            color: #fff;
            border-radius: 10px;
            text-align: center;
            vertical-align: middle;
            border: 1px solid transparent;
            font-weight: 700;
            letter-spacing: 5px;
            text-align: center;
            cursor: pointer;
        }

        ._jj_button:hover {
            background-color: #1167b3;
        }

        table._jj_hovertable thead {
            text-align: center;
            font-size: 16px;
            font-weight: 700;
        }

        table._jj_hovertable {
            font-family: verdana, arial, sans-serif;
            font-size: 11px;
            color: #333333;
            border-width: 1px;
            border-color: #999999;
            border-collapse: collapse;
        }

        table._jj_hovertable th {
            background-color: #c3dde0;
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #a9c6c9;
        }

        table._jj_hovertable tr {
            background-color: #d4e3e5;
        }

        table._jj_hovertable td {
            border-width: 1px;
            padding: 8px;
            border-style: solid;
            border-color: #a9c6c9;
        }

        ._jj_button_close{
            font-size: 20px;
            font-weight: 700;
            position: absolute;
            right: 20px;
            color: #FFF;
        }
    `;


    const htmlContent = `
    <div class="">
        <div style="text-align:center;margin: 10px;">
            <button id="_jj_btn_draw" type="button" class="_jj_button _jj_btn_draw">抽奖</button>
            <button id="_jj_btn_stop" type="button" class="_jj_button">停止</button>
            <a href="javascript:void(0)" id="_jj_btn_close" class="_jj_button_close">X</a>
        </div>
        <table class="_jj_hovertable">
            <thead>
                <tr>
                    <td>奖品图标</td>
                    <td>奖品名称</td>
                    <td>中奖次数</td>
                    <td>累计奖励</td>
                </tr>
            <tbody id="_jj_tbodyList">

            </tbody>
            </thead>
        </table>
    </div>
    `

    function appendStyle(text) {
        const styleEl = document.createElement('style');
        styleEl.textContent = text;
        document.head.appendChild(styleEl);
    }

    function appendHTML(htmlContent) {
        const htmlEl = document.createElement('div');
        htmlEl.className = "_jj_draw_container";
        htmlEl.innerHTML = htmlContent;
        document.body.appendChild(htmlEl);
    }

    appendStyle(styleContent);
    appendHTML(htmlContent);

    let lotteryConfig = [];
    let isDrawing = false;
    let prizes = [];
    const tbodyListEl = document.getElementById("_jj_tbodyList")

    function delay(fn = () => { }, delay = 5000, context = null) {
        let ticket = null;
        let runned = false;
        return {
            run(...args) {
                return new Promise((resolve, reject) => {
                    if (runned === true) {
                        return;
                    }
                    runned = true;
                    ticket = setTimeout(async () => {
                        try {
                            const res = await fn.apply(context, args);
                            resolve(res);
                        } catch (err) {
                            reject(err)
                        }
                    }, delay)
                })
            },
            cancel: () => {
                clearTimeout(ticket);
            }
        }
    }

    function getLotteryConfig() {
        return fetch("https://api.juejin.cn/growth_api/v1/lottery_config/get")
            .then(res => res.json())
    }

    // {"err_no":7003,"err_msg":"积分不足，无法进行抽奖lack of point","data":null}
    function doDraw() {
        return fetch('https://api.juejin.cn/growth_api/v1/lottery/draw', {
            method: 'POST',
            credentials: "include"
        })
            .then(res => res.json())
    }


    async function onDraw(ev) {
        if (isDrawing) {
            return;
        }
        isDrawing = true;

        try {
            let errNo = 0;
            do {
                const res = await doDraw();
                errNo = res.err_no;

                if (errNo !== 0) {
                    alert(res.err_msg);
                    isDrawing = false;
                }

                // 增加奖励
                addPrize(res.data)
                // 渲染
                renderPrizes();
                // 暂停16ms
                await delay(undefined, 16).run();

            } while (errNo = 0)

        } catch (err) {
            alert(err.message);
        }

    }

    function addPrize(data) {

        let prize = prizes.find(p => p.lottery_id == data.lottery_id);
        if(!prize) {
            return;
        }
        prize.counts += 1;

    }

    function onStop() {
        isDrawing = false;
    }

    function getTotal(data){
        if(data.lottery_id == "6981716980386496552" || data.lottery_name == "66矿石"){
            return data.counts * 66;
        }
        return data.counts;
    }

    function renderPrizes() {
        tbodyListEl.innerHTML = prizes.map(prize => `
        <tr id="_jj_${prize.lottery_id}">
            <td class="_jj_price_icon"><img style="height:30px" src="${prize.lottery_image}" /></td>
            <td>${prize.lottery_name}</td>
            <td class="_jj_count">${prize.counts}</td>
            <td class="_jj_total">${getTotal(prize)}</td>
        </tr>
    `).join("");

    }


    async function init() {
        lotteryConfig = (await getLotteryConfig()).data.lottery;

        prizes = lotteryConfig.map(c => ({
            lottery_id: c.lottery_id,
            lottery_name: c.lottery_name,
            counts: 0
        }));

        renderPrizes();
        document.getElementById("_jj_btn_draw").addEventListener("click", onDraw);
        document.getElementById("_jj_btn_stop").addEventListener("click", onStop);
        document.getElementById("_jj_btn_close").addEventListener("click", function () {
            document.querySelector("#_jj_draw_container").style.display = "none"
        });
    }
    init();

})();
