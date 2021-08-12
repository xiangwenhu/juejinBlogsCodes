import requests
import json
import os

headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'authority': 'api.juejin.cn',
    'accept': '*/*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8'
}


# summay
# post_article_count 文章总数
# power 掘力值
# follower_count 总关注者人数
# got_digg_count 被赞数
# got_view_count 文章阅读总数

def getJSONData(url, data={}, method="get"):
    if method == "post":
        res = requests.post(url, data=json.dumps(data), headers=headers)
        res.encoding = "utf-8"
        return res.json()
    else:
        res = requests.get(url, headers=headers)
        res.encoding = "utf-8"
        return res.json()


def ensureDir(dir):
    os.makedirs(dir, mode=0o777, exist_ok=True)


def getJSONDataFromFile(path):
    with open(path) as f:
        return json.loads(f.read())


def appendFile(path, content):
    with open(path, "a+", encoding="utf-8") as f:
        f.write(content)


def saveFile(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def readFile(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def copyObject(obj, keys = []):
    ret = {};
    for k in keys:
        ret[k] = obj[k]
    return ret;
