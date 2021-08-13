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
        "total_collect_count", # 总收藏数
        "total_comment_count", # 总评论数
        "mdSummary",
        "mdAv"
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
        # break
    return articles


def downloadUserDatas():
    for uid in UIDS:
        downloadUserData(uid)


def downloadUserData(uid):
    # 摘要数据
    summary = utils.getJSONData(URLS.get("summary") % (uid))["data"];
    summaryfolder = "./JJPower/datas/%s" % uid
    summaryFile = "./JJPower/datas/%s/%s.json" % (uid, "summary")
    utils.ensureDir(summaryfolder)

    # 文章列表数据
    articles = downloadArticleList(uid)
    utils.saveFile("./JJPower/datas/%s/articles.json" %
                   uid, json.dumps(articles, ensure_ascii=False))

    sTop = summaryAndTopItems(articles)

    # 总收藏数和总评论数
    summary["total_collect_count"] = sTop["total_collect_count"]
    summary["total_comment_count"] = sTop["total_comment_count"]
    summary["mdSummary"] = "| %s| %s|%s |%s |%s |%s | %s|"%(
        summary["user_name"], 
        summary["post_article_count"], 
        summary["got_digg_count"], 
        summary["total_comment_count"], 
        summary["total_collect_count"], 
        summary["got_view_count"], 
        summary["follower_count"], 
    ) 

    articleCount = summary["post_article_count"]
    summary["mdAv"] = "| %s|%s |%s |%s |%s | "%(
        summary["user_name"], 
        round(summary["got_digg_count"] /articleCount)  , 
        round(summary["total_comment_count"] /articleCount), 
        round(summary["total_collect_count"] /articleCount), 
        round(summary["got_view_count"] /articleCount), 
    ) 

    utils.saveFile(summaryFile,  json.dumps(
        extraSummaryData(summary), ensure_ascii=False))

    utils.saveFile("./JJPower/datas/%s/sTop.json" %
                   uid, json.dumps(sTop, ensure_ascii=False))


def summaryAndTopItems(articles):
    result = {}

    collect_count = 0
    comment_count = 0
    for art in articles:
        collect_count += art["collect_count"]
        comment_count += art["comment_count"]
        art["score"]  = round(art["digg_count"] * 1 + art["collect_count"] * 0.5 + art["comment_count"] * 0.2 + art["view_count"] * 0.01)

    # 总收藏数
    result["total_collect_count"] = collect_count
    # 总评论数
    result["total_comment_count"] = comment_count


    # # 点赞
    # s1 = sorted(
    #     articles, key=lambda article: article["digg_count"], reverse=True)[0:3]
    # result["digg_count"] = s1
    # # 收藏
    # s1 = sorted(
    #     articles, key=lambda article: article["collect_count"], reverse=True)[0:3]
    # result["collect_count"] = s1
    # # 评论
    # s1 = sorted(
    #     articles, key=lambda article: article["comment_count"], reverse=True)[0:3]
    # result["comment_count"] = s1
    # # 阅读
    # s1 = sorted(
    #     articles, key=lambda article: article["view_count"], reverse=True)[0:3]

    s1 = sorted(
         articles, key=lambda article: article["score"], reverse=True)[0:6]
    result["totalScore"] = s1
    
    md = "";
    for art in s1:
        md = md + "* [%s](https://juejin.cn/post/%s) - %s     " %(art["title"],art["article_id"], art["score"])
    
    result["mdTotalScore"] = md

    return result


downloadUserDatas()
