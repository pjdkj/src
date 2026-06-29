// AniBK 动漫 - 海阔世界小程序规则
// 网站: www.anibk.com

// ========== Base64 解码 (ES5 兼容) ==========
var _base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function base64Decode(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = _base64Chars.indexOf(input.charAt(i++));
        enc2 = _base64Chars.indexOf(input.charAt(i++));
        enc3 = _base64Chars.indexOf(input.charAt(i++));
        enc4 = _base64Chars.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output += String.fromCharCode(chr1);
        if (enc3 != 64) { output += String.fromCharCode(chr2); }
        if (enc4 != 64) { output += String.fromCharCode(chr3); }
    }
    return output;
}

// ========== VHref 解密 ==========
function decodeVHref(encryptedHref) {
    var decoded = decodeURIComponent(encryptedHref);
    decoded = base64Decode(decoded);
    decoded = decoded.replace(/_hko_/g, ".");
    decoded = decoded.replace(/_wtuf_/g, "/");
    decoded = decoded.replace(/_hrtdv_/g, "http");
    return decoded;
}

// ========== HTML 辅助函数 ==========
function small(text) { return "<small>" + text + "</small>"; }
function big(text) { return "<big>" + text + "</big>"; }
function b(text) { return "<b>" + text + "</b>"; }

// ========== 主页 ==========
function homePage() {
    var layouts = [];
    var baseUrl = "https://www.anibk.com";

    // 搜索框
    layouts.push({
        url: $.toString(function() {
            return $("hiker://empty/search?page=fypage&key=" + input).rule(function() {
                require(config.依赖);
                addListener("onClose", $.toString(function() { setItem("searchParam", ""); }));
                setResult(searchVideo(getParam("key", ""), MY_PAGE));
            });
        }),
        col_type: "input",
        title: "Search",
    });

    // 获取首页
    var html;
    try {
        html = fetch(baseUrl + "/");
    } catch (e) {
        layouts.push({ title: "页面加载失败", col_type: "text_center_1" });
        setResult(layouts);
        return;
    }

    // 解析 section
    var sections = pdfa(html, ".vlist-main-index");

    for (var si = 0; si < sections.length; si++) {
        var section = sections[si];
        var sectionTitle = pdfh(section, ".title-box&&Text") || "";

        if (sectionTitle) {
            layouts.push({
                title: b(sectionTitle),
                col_type: "text_center_1",
                extra: { textAlign: "left", lineVisible: false }
            });
        }

        var vsubs = pdfa(section, ".vsub");
        for (var vi = 0; vi < vsubs.length; vi++) {
            var vsub = vsubs[vi];
            try {
                var itemLink = pdfh(vsub, ".vsub-pic&&a&&href") || pdfh(vsub, "a&&href");
                var itemTitle = pdfh(vsub, ".title&&Text");
                var itemImg = pdfh(vsub, "img&&src");
                var smallTexts = pdfa(vsub, ".small");
                var itemStatus = "";
                var itemYear = "";
                if (smallTexts.length > 0) {
                    itemStatus = pdfh(vsub, ".small&&Text") || "";
                }
                if (smallTexts.length > 1) {
                    itemYear = pdfh(vsub, ".small,-1&&Text") || "";
                }

                if (!itemTitle || !itemLink) continue;

                var desc = "";
                if (itemStatus) desc += itemStatus;
                if (itemYear && itemStatus) desc += " | ";
                if (itemYear) desc += itemYear;
                if (!desc) desc = "0";

                var fullLink = itemLink;
                if (fullLink.indexOf("/") === 0) fullLink = baseUrl + fullLink;

                layouts.push({
                    title: itemTitle,
                    img: itemImg + '@headers={"Referer":"https://www.anibk.com/"}',
                    desc: desc,
                    url: $(fullLink).rule(function() {
                        require(config.依赖);
                        setResult(getDetail(input));
                    }),
                    col_type: "movie_2",
                });
            } catch (e2) { }
        }
    }

    // 备用: 直接解析 vsub
    if (layouts.length <= 1) {
        var allVsubs = pdfa(html, ".vsub");
        for (var wi = 0; wi < allVsubs.length; wi++) {
            var vsub2 = allVsubs[wi];
            try {
                var link2 = pdfh(vsub2, ".vsub-pic&&a&&href") || pdfh(vsub2, "a&&href");
                var title2 = pdfh(vsub2, ".title&&Text");
                var img2 = pdfh(vsub2, "img&&src");
                var stat2 = pdfh(vsub2, ".small&&Text") || "";
                var year2 = pdfh(vsub2, ".small,-1&&Text") || "";

                if (!title2 || !link2) continue;
                var desc2 = stat2;
                if (year2 && stat2) desc2 += " | ";
                if (year2) desc2 += year2;
                if (!desc2) desc2 = "0";

                var fullLink2 = link2;
                if (fullLink2.indexOf("/") === 0) fullLink2 = baseUrl + fullLink2;

                layouts.push({
                    title: title2,
                    img: img2 + '@headers={"Referer":"https://www.anibk.com/"}',
                    desc: desc2,
                    url: $(fullLink2).rule(function() {
                        require(config.依赖);
                        setResult(getDetail(input));
                    }),
                    col_type: "movie_2",
                });
            } catch (e3) { }
        }
    }

    setResult(layouts);
}

// ========== 通用列表页 ==========
function getListPage(url) {
    var layouts = [];
    var baseUrl = "https://www.anibk.com";
    var html = fetch(url);

    var vsubs = pdfa(html, ".vsub");
    for (var i = 0; i < vsubs.length; i++) {
        var vsub = vsubs[i];
        try {
            var itemLink = pdfh(vsub, ".vsub-pic&&a&&href") || pdfh(vsub, "a&&href");
            var itemTitle = pdfh(vsub, ".title&&Text");
            var itemImg = pdfh(vsub, "img&&src");
            var itemStatus = pdfh(vsub, ".small&&Text") || "";
            var itemYear = pdfh(vsub, ".small,-1&&Text") || "";

            if (!itemTitle || !itemLink) continue;
            var desc = itemStatus;
            if (itemYear && itemStatus) desc += " | ";
            if (itemYear) desc += itemYear;
            if (!desc) desc = "0";

            var fullLink = itemLink;
            if (fullLink.indexOf("/") === 0) fullLink = baseUrl + fullLink;

            layouts.push({
                title: itemTitle,
                img: itemImg + '@headers={"Referer":"https://www.anibk.com/"}',
                desc: desc,
                url: $(fullLink).rule(function() {
                    require(config.依赖);
                    setResult(getDetail(input));
                }),
                col_type: "movie_2",
            });
        } catch (e) { }
    }

    return layouts;
}

// ========== 搜索 ==========
function searchVideo(key, page) {
    var layouts = [];
    var baseUrl = "https://www.anibk.com";

    if (!key || key.trim() === "") {
        layouts.push({ title: "请输入搜索关键词", col_type: "text_center_1" });
        return layouts;
    }

    var searchUrl = baseUrl + "/list/---------?order=20&kw=" + encodeURIComponent(key);

    var html;
    try {
        html = fetch(searchUrl);
    } catch (e) {
        layouts.push({ title: "搜索失败", col_type: "text_center_1" });
        return layouts;
    }

    var items = pdfa(html, "body&&.vsub");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        try {
            var itemLink = pdfh(item, ".vsub-pic&&a&&href") || pdfh(item, "a&&href");
            var itemTitle = pdfh(item, ".title&&Text");
            var itemImg = pdfh(item, "img&&src");
            var itemStatus = pdfh(item, ".small&&Text") || "";
            var itemYear = pdfh(item, ".small,-1&&Text") || "";

            if (!itemTitle || !itemLink) continue;

            var desc = itemStatus;
            if (itemYear && itemStatus) desc += " | ";
            if (itemYear) desc += itemYear;
            if (!desc) desc = "0";

            var fullLink = itemLink;
            if (fullLink.indexOf("/") === 0) fullLink = baseUrl + fullLink;

            layouts.push({
                title: itemTitle,
                img: itemImg + '@headers={"Referer":"https://www.anibk.com/"}',
                desc: desc,
                url: $().rule((link) => {
                    require(config.依赖);
                    setResult(getDetail(link));
                }, fullLink),
                col_type: "movie_3",
            });
        } catch (e) { }
    }

    if (items.length === 0) {
        layouts.push({ title: "未找到相关动漫", col_type: "text_center_1" });
    }

    // 分页
    if (items.length > 0 || page > 1) {
        layouts.push({ col_type: "blank_block" });
        layouts.push({
            title: "上一页",
            url: $("").lazyRule(function() {
                var p = Number(getItem("searchP", "1"));
                if (p > 1) { p = p - 1; setItem("searchP", p.toString()); }
                refreshPage();
                return "hiker://empty";
            }),
            col_type: "text_3",
        });
        layouts.push({
            title: "自选页",
            url: $("", "页数").input(function() {
                var p = parseInt(input.trim());
                if (!isNaN(p)) {
                    setItem("searchP", p.toString());
                    refreshPage();
                    return "hiker://empty";
                } else {
                    return "toast://请输入数字";
                }
            }),
            col_type: "text_3",
        });
        layouts.push({
            title: "下一页",
            url: $("").lazyRule(function() {
                var p = Number(getItem("searchP", "1"));
                p = p + 1; setItem("searchP", p.toString());
                refreshPage();
                return "hiker://empty";
            }),
            col_type: "text_3",
        });
    }

    return layouts;
}

// ========== 动漫详情页 ==========
function getDetail(url) {
    var layouts = [];
    var baseUrl = "https://www.anibk.com";

    var html;
    try {
        html = fetch(url);
    } catch (e) {
        layouts.push({ title: "详情加载失败", col_type: "text_center_1" });
        layouts.push({ title: "用浏览器打开", url: "web://" + url, col_type: "text_3" });
        return layouts;
    }

    // 封面
    var coverImg = pdfh(html, ".bk-main-pic img&&src") || pdfh(html, 'meta[property="og:image"]&&content');
    if (coverImg) {
        layouts.push({
            img: coverImg + '@headers={"Referer":"https://www.anibk.com/"}',
            desc: "0",
            col_type: "card_pic_1",
        });
    }

    // 标题
    var title = pdfh(html, 'meta[property="og:title"]&&content') || pdfh(html, "h1&&Text") || pdfh(html, "title&&Text");
    if (title) {
        layouts.push({
            title: title,
            col_type: "text_center_1",
            extra: { lineVisible: false }
        });
    }

    // 基本信息
    var infoHtml = "";
    var infoItems = pdfa(html, ".rbox-info.bk-info li");
    for (var i = 0; i < infoItems.length; i++) {
        var key = pdfh(infoItems[i], ".k&&Text");
        var val = pdfh(infoItems[i], ".v&&Text");
        if (key && val) {
            infoHtml += key + ": " + val + "<br>";
        }
    }
    if (infoHtml) {
        layouts.push({
            title: small(infoHtml),
            col_type: "rich_text",
            extra: { lineSpacing: 6, lineVisible: false }
        });
    }

    // 简介
    var descText = pdfh(html, ".bkir-desc&&Text") || "";
    if (descText && descText.length > 20) {
        if (descText.length > 400) descText = descText.substring(0, 400) + "...";
        layouts.push({
            title: "简介: " + descText,
            col_type: "long_text",
            extra: { lineVisible: false }
        });
    }

    // 剧集列表
    var epLinkFound = false;

    // 正式剧集 ep-r-sub
    var epItems = pdfa(html, "body&&.ep-sub");
    if (epItems.length > 0) {
        layouts.push({ title: b("剧集列表"), col_type: "text_center_1", extra: { lineVisible: false } });
        for (var ei = 0; ei < epItems.length; ei++) {
            var epItem = epItems[ei];
            var epLink = pdfh(epItem, 'a[href*="/ep/"]&&href') || pdfh(epItem, "a&&href");
            var epTitle = pdfh(epItem, ".ep-r-title&&Text") || pdfh(epItem, ".ep-title&&Text") || ("第" + (ei + 1) + "话");

            if (!epLink || epLink.indexOf("/ep/") === -1) continue;
            epLinkFound = true;

            var fullEpLink = epLink;
            if (fullEpLink.indexOf("/") === 0) fullEpLink = baseUrl + fullEpLink;

            layouts.push({
                title: epTitle,
                desc: "0",
                url: fullEpLink,
                col_type: "big_big_blank_block",
            });
        }
    }

    // 备选 ep-sub
    if (!epLinkFound) {
        var epSubItems = pdfa(html, ".ep-sub");
        if (epSubItems.length > 0) {
            layouts.push({ title: b("剧集列表"), col_type: "text_center_1", extra: { lineVisible: false } });
            for (var esi = 0; esi < epSubItems.length; esi++) {
                var esItem = epSubItems[esi];
                var esLink = pdfh(esItem, 'a[href*="/ep/"]&&href') || pdfh(esItem, "a&&href");
                var esTitle = pdfh(esItem, ".ep-title&&Text") || ("第" + (esi + 1) + "话");

                if (!esLink || esLink.indexOf("/ep/") === -1) continue;
                epLinkFound = true;

                var fullEsLink = esLink;
                if (fullEsLink.indexOf("/") === 0) fullEsLink = baseUrl + fullEsLink;

                layouts.push({
                    title: esTitle,
                    desc: "0",
                    url: $(fullEsLink).rule(function() {
                        require(config.依赖);
                        setResult(getPlayPage(input));
                    }),
                    col_type: "text_3",
                });
            }
        }
    }

    // 无剧集时显示相关推荐
    if (!epLinkFound) {
        var relatedVsubs = pdfa(html, ".vsub");
        if (relatedVsubs.length > 0) {
            layouts.push({ title: b("相关推荐"), col_type: "text_center_1", extra: { lineVisible: false } });
            for (var ri = 0; ri < Math.min(relatedVsubs.length, 12); ri++) {
                var rItem = relatedVsubs[ri];
                try {
                    var rLink = pdfh(rItem, ".vsub-pic&&a&&href") || pdfh(rItem, "a&&href");
                    var rTitle = pdfh(rItem, ".title&&Text");
                    var rImg = pdfh(rItem, "img&&src");

                    if (!rTitle || !rLink) continue;
                    var rFullLink = rLink;
                    if (rFullLink.indexOf("/") === 0) rFullLink = baseUrl + rFullLink;

                    layouts.push({
                        title: rTitle,
                        img: rImg + '@headers={"Referer":"https://www.anibk.com/"}',
                        desc: "0",
                        url: $(rFullLink).rule(function() {
                            require(config.依赖);
                            setResult(getDetail(input));
                        }),
                        col_type: "movie_2",
                    });
                } catch (e2) { }
            }
        }
    }

    return layouts;
}

// ========== 播放页 ==========
function getPlayPage(url) {
    var layouts = [];
    var baseUrl = "https://www.anibk.com";

    var html;
    try {
        html = fetch(url);
    } catch (e) {
        layouts.push({ title: "播放页加载失败", col_type: "text_center_1" });
        layouts.push({ title: "用浏览器打开", url: "web://" + url, col_type: "text_3" });
        return layouts;
    }

    // 标题
    var title = pdfh(html, 'meta[property="og:title"]&&content') || pdfh(html, "h1&&Text");
    if (title) {
        layouts.push({
            title: big(title),
            col_type: "text_center_1",
            extra: { lineVisible: false }
        });
    }

    // 提取 VHrefs
    var vhrefs = [];
    var vhrefsMatch = html.match(/var\s+VHrefs\s*=\s*(\[[\s\S]*?\]);/);
    if (vhrefsMatch) {
        try {
            vhrefs = JSON.parse(vhrefsMatch[1]);
        } catch (e) {
            var objMatch = html.match(/var\s+VHrefs\s*=\s*\[([\s\S]*?)\];/);
            if (objMatch) {
                var entries = objMatch[1].match(/\{[^}]+\}/g);
                if (entries) {
                    for (var ei = 0; ei < entries.length; ei++) {
                        try {
                            var entry = JSON.parse(entries[ei]);
                            if (entry.Href && entry.Name) { vhrefs.push(entry); }
                        } catch (ee) { }
                    }
                }
            }
        }
    }

    // 提取 VURLs
    var vurls = [];
    var vurlsMatch = html.match(/var\s+VURLs\s*=\s*(\[[^\]]*\]);/);
    if (vurlsMatch) {
        try { vurls = JSON.parse(vurlsMatch[1]); } catch (e) { }
    }

    // 预览图
    var posterImg = pdfh(html, 'meta[property="og:image"]&&content');
    if (posterImg) {
        layouts.push({
            img: posterImg + '@headers={"Referer":"https://www.anibk.com/"}',
            desc: "0",
            col_type: "card_pic_1",
        });
    }

    // 剧集信息
    var descPts = pdfa(html, ".ep-desc-pt");
    var infoLines = [];
    for (var dpi = 0; dpi < descPts.length; dpi++) {
        var ptText = pdfh(descPts[dpi], "Text") || "";
        if (ptText && ptText.trim()) infoLines.push(ptText);
    }
    if (infoLines.length > 0) {
        layouts.push({
            title: small(infoLines.join("<br>")),
            col_type: "rich_text",
            extra: { lineSpacing: 4, lineVisible: false }
        });
    }

    // 简介
    var epDesc = pdfh(html, ".ep-desc-lg&&Text") || "";
    if (epDesc && epDesc.trim().length > 10) {
        if (epDesc.length > 250) epDesc = epDesc.substring(0, 250) + "...";
        layouts.push({
            title: epDesc,
            col_type: "long_text",
            extra: { lineVisible: false }
        });
    }

    // 播放源
    var hasSource = false;

    if (vurls.length > 0) {
        layouts.push({ title: b("直接播放"), col_type: "text_center_1", extra: { lineVisible: false } });
        for (var vi = 0; vi < vurls.length; vi++) {
            if (vurls[vi] && typeof vurls[vi] === "string" && vurls[vi].length > 10) {
                hasSource = true;
                layouts.push({
                    title: "线路 " + (vi + 1),
                    url: vurls[vi] + "#isVideo=true#",
                    col_type: "text_3",
                });
            }
        }
    }

    if (vhrefs.length > 0) {
        layouts.push({ title: b("视频来源"), col_type: "text_center_1", extra: { lineVisible: false } });
        for (var hi = 0; hi < vhrefs.length; hi++) {
            var vhref = vhrefs[hi];
            if (!vhref.Href) continue;
            var sourceName = vhref.Name || ("来源 " + (hi + 1));

            try {
                var decodedUrl = decodeVHref(vhref.Href);
                if (decodedUrl && decodedUrl.length > 10) {
                    hasSource = true;
                    layouts.push({
                        title: sourceName,
                        url: $(decodedUrl).lazyRule(function() {
                            return "video://" + input;
                        }),
                        col_type: "text_3",
                    });
                }
            } catch (e) { }
        }
    }

    if (!hasSource) {
        layouts.push({ title: "暂无播放源", col_type: "text_1" });
        layouts.push({ title: "视频嗅探播放", url: "video://" + url, col_type: "text_3" });
        layouts.push({ title: "用浏览器打开", url: "web://" + url, col_type: "text_3" });
    }

    // 上/下一集
    var bkMatch = url.match(/\/ep\/(\d+)-(\d+)/);
    if (bkMatch) {
        var bkId = bkMatch[1];
        var curEp = parseInt(bkMatch[2], 10);

        layouts.push({ col_type: "blank_block" });
        if (curEp > 1) {
            layouts.push({
                title: "◀ 上一集",
                url: $(baseUrl + "/ep/" + bkId + "-" + (curEp - 1)).rule(function() {
                    require(config.依赖);
                    setResult(getPlayPage(input));
                }),
                col_type: "text_3",
            });
        }
        layouts.push({
            title: "下一集 ▶",
            url: $(baseUrl + "/ep/" + bkId + "-" + (curEp + 1)).rule(function() {
                require(config.依赖);
                setResult(getPlayPage(input));
            }),
            col_type: "text_3",
        });
    }

    return layouts;
}
