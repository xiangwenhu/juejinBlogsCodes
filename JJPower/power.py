import utils
import json

URLS = {
    "summary": "https://api.juejin.cn/user_api/v1/user/get?user_id=%s&not_self=1"
}


UIDS = ["764915822103079"]


def downloadDatas():
    for uid in UIDS:
        downloadData(uid)


def downloadData(uid):
    res = utils.getJSONData(URLS.get("summary") % (uid))
    folder = "./datas/%s" % uid
    utils.ensureDir(folder)
    print(res["data"])


downloadDatas()
