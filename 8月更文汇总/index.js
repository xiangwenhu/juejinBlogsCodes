

/**
 * 延时执行函数
 * @param {*} fn 
 * @param {*} delay 
 * @param {*} context 
 * @returns 
 */
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

/**
 * 获取文章列表
 * @param {*} useId 用户ID
 * @param {*} cursor 游标？
 * @returns 
 */
function getArticles(useId, cursor) {
    return fetch("https://api.juejin.cn/content_api/v1/article/query_list", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            user_id: useId,
            sort_type: 2, // 时间倒排
            cursor: `${cursor}`
        })
    }).then(res => res.json())
}

/**
 * 获取文章详情
 * @param {*} id 文章ID
 * @returns 
 */
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
async function loopGetArticles(userId, count) {
    let results = [];
    let cursor = 0;
    let res = {
        err_no: 0,
        has_more: true,
        cursor: 0
    }
    do {
        res = await getArticles(userId, cursor);
        cursor = +res.cursor;
        results.push(...(res.data.map(art => art.article_id)));
        await delay(undefined, 16);

    } while (res.has_more && cursor < count)

    return results;
}

// 获取日期
function getDateStr(ctime) {
    return new Date(ctime * 1000).toISOString().slice(5, 10)
}

/**
 * 批量获取文章内容数据
 * @param {*} artIds 文章id列表
 * @returns 
 */
async function getArticleContents(artIds) {
    const results = [];
    let articleInfo;
    for (let i = 0; i < artIds.length; i++) {
        const res = await getArticleContent(artIds[i]);
        articleInfo = res.data.article_info;
        if (is8MArticle(articleInfo)) {
            results.push({
                id: artIds[i],
                title: articleInfo.title,
                diggCount: articleInfo.digg_count,
                viewCount: articleInfo.view_count,
                collectCount: articleInfo.collect_count,
                commentCount: articleInfo.comment_count,
                date: getDateStr(articleInfo.ctime)
            })
        }
        await delay(undefined, 16);
    }
    return results;
}

/**
 * 是不是8月征文活动的文章
 * @param {*} art 文章信息
 * @returns 
 */
function is8MArticle(art) {
    return art.title.endsWith("8月更文挑战") || art.mark_content.slice(0, 200).indexOf("https://juejin.cn/post/6987962113788493831") >= 0
}

/**
 * 生成markdown格式的列表内容
 * @param {*} articleInfos 
 * @returns 
 */
function generateMD(articleInfos) {
    return articleInfos.map(art => `* ${art.date} [${art.title}](https://juejin.cn/post/${art.id}) - ${art.diggCount}赞`).join('\n');
}

/**
 * 各种总数统计
 * @param {*} articleInfos 
 * @returns 
 */
function getTotals(articleInfos) {
    return articleInfos.reduce((total, cur) => {
        total.diggCount += cur.diggCount;
        total.viewCount += cur.viewCount;
        total.collectCount += cur.collectCount;
        total.commentCount += cur.commentCount;
        return total;
    }, {
        diggCount: 0,
        viewCount: 0,
        collectCount: 0,
        commentCount: 0
    })
}


; (async function () {
    // 用户ID
    const USER_ID = "131597122679661";
    // 需要查询的最大文章数量
    const MAX_COUNT = 31

    // 获取文章列表
    const articleIds = await loopGetArticles(USER_ID, MAX_COUNT);
    // 获取文章详情，点赞，评论，收藏，阅读等
    const articleInfos = await getArticleContents(articleIds);
    // 生成Markdown格式的列表
    const mdContent = generateMD(articleInfos);
    console.log(mdContent);

    // 各种统计数据
    const totals = getTotals(articleInfos);
    console.log("---------");
    console.log("文章数: ", articleInfos.length);
    console.log("点赞数：", totals.diggCount);
    console.log("阅读数：", totals.viewCount);
    console.log("收藏数：", totals.collectCount);
    console.log("评论数：", totals.commentCount);
    console.log("---------");
    const viewJLZ = Math.floor(totals.viewCount / 100);
    console.log(`掘力值：${totals.diggCount} + ${viewJLZ} = `, totals.diggCount + viewJLZ);

})();