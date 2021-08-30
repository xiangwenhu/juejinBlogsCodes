const USER_ID = "131597122679661";
const MAX_COUNT = 31

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

function getArticles(cursor) {
    return fetch("https://api.juejin.cn/content_api/v1/article/query_list", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            user_id: USER_ID,
            sort_type: 2, // 时间倒排
            cursor: `${cursor}`
        })
    }).then(res => res.json())
}

function getArticleContent(id) {
    return fetch("https://api.juejin.cn/content_api/v1/article/detail", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            article_id: id
        })
    }).then(res => res.json())
}


// 按照时间倒排获取特定时间内的文章
async function loopGetArticles(count) {
    let results = [];
    let cursor = 0;
    let res = {
        err_no: 0,
        has_more: true,
        cursor: 0
    }
    do {
        res = await getArticles(cursor);
        cursor = +res.cursor;
        results.push(...(res.data.map(art => art.article_id)));
        await delay(undefined, 16);

    } while (res.has_more && cursor < count)

    return results;
}


function getDateStr(ctime){
    return new Date(ctime*1000).toISOString().slice(5,10)
}

async function getArticleContents(artIds) {

    const results = [];
    let articleInfo;
    for (let i = 0; i < artIds.length; i++) {
        const res = await getArticleContent(artIds[i]);
        articleInfo = res.data.article_info;
        if(is8MArticle(articleInfo)){
            results.push({
                id: artIds[i],
                title: articleInfo.title,
                digg: articleInfo.digg_count,
                date: getDateStr(articleInfo.ctime)
            })
        }
        await delay(undefined, 16);
    }
    return results;
}


function is8MArticle(art) {
    return art.title.endsWith("8月更文挑战") || art.mark_content.slice(0, 200).indexOf("https://juejin.cn/post/6987962113788493831") >=0
}


function generateMD(articleInfos){
    return articleInfos.map(art=>`* ${art.date} [${art.title}](https://juejin.cn/post/${art.id}) - ${art.digg}赞`).join('\n');
}



; (async function () {

    const articleIds = await loopGetArticles(MAX_COUNT);
    const  articleInfos = await getArticleContents(articleIds);
    const  mdContent =  generateMD(articleInfos);

    console.log(mdContent);

})();