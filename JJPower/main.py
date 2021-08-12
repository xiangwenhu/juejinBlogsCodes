import utils
import json
import os
import sys

URLS = {
    "summary": "https://api.juejin.cn/user_api/v1/user/get?user_id=%s&not_self=1",
    "list": "https://api.juejin.cn/content_api/v1/article/query_list",
}

currentDir = os.path.split(os.path.realpath(sys.argv[0]))[0]


UIDS = [
    "325111174662855",  # 洛竹
    "4248168660735310",  # wangly19
    "2717648473821736",  # CookieBoty
    "325111173878983",  # 和耳朵
    "3913917126415166",  # 小傅哥
    "2893570337421646",  # 手撕红黑树
    "1275089220013336",  # Kerwin_
    "2999123452373735",  # isboyjc
    "3808363978429613",  # 徐小夕
    "2119514117904295",  # 小姐姐味道lv-6
    "764915822103079", # 阿宝哥
    "4406498333825357",  # 敖丙
]


def mapArticleData(data):
    return utils.copyObject(data["article_info"], [
        "article_id",
        "title",
        "digg_count",
        "collect_count",
        "comment_count",
        "view_count"
    ])


def extraSummaryData(data):
    return utils.copyObject(data, [
        "user_id",          # 用户ID
        "user_name",         # 用户名
        "power",            # 掘力值
        "follower_count",   # 关注人数
        "post_article_count",  # 发文数量
        "got_digg_count",   # 获赞数
        "got_view_count",  # 阅读数
    ])


def downloadArticleList(uid):
    cursor = 0
    data = {
        "sort_type": 2,
        "cursor": str(cursor),
        "user_id": str(uid)
    }

    res = {
        "has_more": True
    }

    articles = []

    while(res["has_more"] == True):
        data["cursor"] = str(cursor)
        print("data:", data)
        res = utils.getJSONData(URLS.get("list"),
                                data=data, method="post")
        cursor += 10
        articles.extend(map(mapArticleData, res["data"]))
    return articles


def downloadUserDatas():
    for uid in UIDS:
        downloadUserData(uid)


def downloadSummary(uid):
    res = utils.getJSONData(URLS.get("summary") % (uid))
    folder = "./JJPower/datas/%s" % uid
    file = "./JJPower/datas/%s/%s.json" % (uid, "summary")
    utils.ensureDir(folder)
    # 摘要数据
    utils.saveFile(file,  json.dumps(
        extraSummaryData(res["data"]), ensure_ascii=False))


def downloadUserData(uid):
    # 摘要数据
    downloadSummary(uid)
    # 文章列表数据
    articles = downloadArticleList(uid)
    utils.saveFile("./JJPower/datas/%s/articles.json" %
                   uid, json.dumps(articles, ensure_ascii=False))

    sTop = summaryAndTopItems(articles)

    utils.saveFile("./JJPower/datas/%s/sTop.json" %
                   uid, json.dumps(sTop, ensure_ascii=False))


def summaryAndTopItems(articles):
    result = {}

    collect_count = 0
    comment_count = 0
    for art in articles:
        collect_count += art["collect_count"]
        comment_count += art["comment_count"]

    # 总收藏数
    result["collect_count"] = collect_count
    # 总评论数
    result["comment_count"] = comment_count

    # 点赞
    s1 = sorted(
        articles, key=lambda article: article["digg_count"], reverse=True)[0:3]
    result["digg_count"] = s1
    # 收藏
    s1 = sorted(
        articles, key=lambda article: article["collect_count"], reverse=True)[0:3]
    result["collect_count"] = s1
    # 评论
    s1 = sorted(
        articles, key=lambda article: article["comment_count"], reverse=True)[0:3]
    result["comment_count"] = s1
    # 阅读
    s1 = sorted(
        articles, key=lambda article: article["view_count"], reverse=True)[0:3]
    result["view_count"] = s1

    return result


downloadUserDatas()
