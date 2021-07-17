const fs = require("fs");
const fetch = require("node-fetch");
const sha1 = require("crypto-js/sha1");
const arr = [];
let last = null;

const recursiveFetch = async () => {
  for (;;) {
    if (
      last &&
      last.resp_data &&
      last.resp_data.comments &&
      last.resp_data.comments.length < 30
    ) {
      getComment();

      break;
    }
    let res;
    let url =
      "https://api.zsxq.com/v2/topics/215111154144551/comments?sort=asc&count=30";
    let finalUrl = url;
    if (last !== null && last.resp_data.comments.length !== 0) {
      finalUrl =
        url +
        "&begin_time=" +
        encodeURIComponent(
          last.resp_data.comments[last.resp_data.comments.length - 1]
            .create_time
        );
    }

    let headers = {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "x-request-id": "bad7fbbe1-a3e0-4a6a-22b3-a3b51da82b5",
      "x-signature": "2a694ebd228e2d1db40155e6a0f785fc91915163",
      "x-timestamp": Date.now() / 1000,
      "x-version": "2.7.0",
      cookie:
        "sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2288482151155882%22%2C%22first_id%22%3A%221780c92649f182-0f2cd1d96850a9-930346c-2073600-1780c9264a07d5%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22%24device_id%22%3A%221780c92649f182-0f2cd1d96850a9-930346c-2073600-1780c9264a07d5%22%7D; abtest_env=product; zsxq_access_token=89050D9F-AB9A-356F-0FBC-D1ABCD19347C_78AD1CA09B070EAE",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
    };

    if (last !== null) {
      headers = { ...headers, ...ComputeHeader(finalUrl, true) };
    }

    res = await fetch(finalUrl, {
      headers,
      referrer: "https://wx.zsxq.com/dweb2/index/group/28514841451551",
      referrerPolicy: "no-referrer-when-downgrade",
      body: null,
      method: "GET",
      mode: "cors",
    });
    last = await res.json();
    arr.push(last);
  }
};

recursiveFetch();

const getComment = () => {
  let comments = [];
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];
    comments = comments.concat(element.resp_data.comments);
  }

  const result = comments.map((item) => {
    const regex = /href="(.*)" title=/;
    const textArr = item.text.split("<e ");
    const title = textArr[0];
    let link = "";
    if (textArr[1]) {
      link = textArr[1].match(regex)[1];
    }
    return {
      name: item.owner.alias || item.owner.name,
      title,
      link: decodeURIComponent(link),
    };
  });

  let data = JSON.stringify(result);
  fs.writeFileSync("./student.json", data);
};

function ComputeHeader(t, e) {
  void 0 === e && (e = !0);
  var n = Math.floor(new Date().getTime() / 1e3),
    r = (function () {
      for (var t = "", e = 0; e < 32; e++)
        (t += Math.floor(16 * Math.random()).toString(16)),
          (8 !== e && 12 !== e && 16 !== e && 20 !== e) || (t += "-");
      return (i = t), t;
    })();

  return {
    "X-Request-Id": r,
    "X-Version": "2.7.0",
    "X-Signature": (function (t, e, n) {
      var i = t,
        o = i.split("?"),
        r = o[0],
        a = o.slice(1);
      a.length && (i = r + "?" + a.join("?").replace(/'/g, "%27"));
      var s = i + " " + e + " " + n;
      return sha1(s).toString();
    })(t, n, r),
    "X-Timestamp": n.toString(),
  };
}
