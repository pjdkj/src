function homePage() {
    if (getItem('confirmButton', '0') == '0') {
        setItem('confirmButton', '1');
        confirm({
            title: '免责声明',
            content: "        本规则仅对网页源代码重新排版后显示，并不提供原始数据，仅供写源爱好者学习交流使用，请务必在导入24小时之内删除。此声明仅弹出一次，或在设置查看",
            confirm: $.toString(() => { return 'toast://我知道了' }),
            cancel: $.toString(() => { return 'toast://我知道了' }),
        })
    }
    let host = 'https://hanime1.me';
    let privacyMode = '#noHistory##noRecordHistory#';
    let layouts = [];
    layouts.push({
        url: $.toString(() => {
            setItem('query', input);
            setItem('page', '1');
            refreshPage(false);
        }),
        col_type: 'input',
        title: 'Search',
        extra: {
            defaultValue: getItem('query', '') == '' ? '' : getItem('query', '')
        }
    });
    let genre = ["全部", "里番", "泡面番", "Motion Anime", "3DCG", "2.5D", "2D动画", "AI生成", "MMD", "Cosplay"];
    layouts.push({
        title: getItem('genre', '全部') == '全部' ? '类型' : getItem('genre', '全部'),
        url: $(genre, 2, '类型').select(() => {
            setItem('genre', input);
            setItem('page', '1');
            refreshPage(false);
        }),
        col_type: 'text_5'
    });
    layouts.push({
        title: '标签',
        url: $('hiker://empty' + privacyMode).rule((setTags) => {
            let broad_1 = getItem('broad', '');
            let tag_1 = getItem('tags', '');
            addListener('onClose', $.toString((tag1, broad_1) => {
                let broad_2 = getItem('broad', '');
                let tag2 = getItem('tags', '');
                function isTagsEquivalent(str1, str2) {
                    const extractTags = (str) => {
                        let matches = str.match(/&tags%5B%5D=[^&]*/g);
                        return matches ? matches.sort() : [];
                    };

                    let tags1 = extractTags(str1);
                    let tags2 = extractTags(str2);
                    if (tags1.length !== tags2.length) {
                        return true;
                    }
                    for (let i = 0; i < tags1.length; i++) {
                        if (tags1[i] !== tags2[i]) {
                            return true;
                        }
                    }
                    return false;
                }
                if (broad_1 != broad_2) {
                    refreshPage(false);
                }
                if (isTagsEquivalent(tag1, tag2)) {
                    refreshPage(false);
                }
            }, tag_1, broad_1))
            setResult(setTags());
        }, setTags),
        col_type: 'text_5'
    });
    let sort = ["默认", "最新上市", "最新上传", "本日排行", "本周排行", "本月排行", "观看次数", "点赞比例", "时长最长", "他们在看"];
    layouts.push({
        title: getItem('sort', '默认') == '默认' ? '排序' : getItem('sort', '默认'),
        url: $(sort, 1, '排序').select(() => {
            setItem('sort', input);
            setItem('page', '1');
            refreshPage(false);
        }),
        col_type: 'text_5'
    });
    let date = ["全部", "今天", "本周", "本月", "今年", "2025年", "2024年", "2023年", "2022年", "2021年", "2020年", "2019年", "2018年", "2017年", "2016年", "2015年", "2014年", "2013年", "2012年", "2011年", "2010年", "2009年", "2008年", "2007年", "2006年", "2005年", "2004年", "2003年", "2002年", "2001年", "2000年", "1999年", "1998年", "1997年", "1996年", "1995年", "1994年", "1993年", "1992年", "1991年", "1990年"];
    layouts.push({
        title: getItem('date', '全部') == '全部' ? '日期' : getItem('date', '全部'),
        url: $(date, 3, '发布日期').select(() => {
            setItem('date', input);
            setItem('page', '1');
            refreshPage(false);
        }),
        col_type: 'text_5'
    });
    let duration = ["全部", "1 分钟 +", "5 分钟 +", "10 分钟 +", "20 分钟 +", "30 分钟 +", "60 分钟 +", "0 - 10 分钟", "0 - 20 分钟",];
    layouts.push({
        title: getItem('duration', '全部') == '全部' ? '时长' : getItem('duration', '全部'),
        url: $(duration, 1, '时长').select(() => {
            setItem('duration', input);
            setItem('page', '1');
            refreshPage(false);
        }),
        col_type: 'text_5'
    });
    let params = {
        "默认": "",
        "全部": "",
        "里番": "裏番",
        "泡面番": "泡麵番",
        "Motion Anime": "Motion Anime",
        "3DCG": "3DCG",
        "2.5D": "2.5D",
        "2D动画": "2D動畫",
        "AI生成": "AI生成",
        "MMD": "MMD",
        "Cosplay": "Cosplay",
        "最新上市": "最新上市",
        "最新上传": "最新上傳",
        "本日排行": "本日排行",
        "本周排行": "本週排行",
        "本月排行": "本月排行",
        "观看次数": "觀看次數",
        "点赞比例": "讚好比例",
        "时长最长": "時長最長",
        "他们在看": "他們在看",
        "1 分钟 +": "1+分鐘+%2B",
        "5 分钟 +": "5+分鐘+%2B",
        "10 分钟 +": "10+分鐘+%2B",
        "20 分钟 +": "20+分鐘+%2B",
        "30 分钟 +": "30+分鐘+%2B",
        "60 分钟 +": "60+分鐘+%2B",
        "0 - 10 分钟": "0+-+10+分鐘",
        "0 - 20 分钟": "0+-+20+分鐘",
        "今天": "過去+24+小時",
        "本周": "過去+1+週",
        "本月": "過去+1+個月",
        "今年": "過去+1+年",
        "2025年": "2025+年+",
        "2024年": "2024+年+",
        "2023年": "2023+年+",
        "2022年": "2022+年+",
        "2021年": "2021+年+",
        "2020年": "2020+年+",
        "2019年": "2019+年+",
        "2018年": "2018+年+",
        "2017年": "2017+年+",
        "2016年": "2016+年+",
        "2015年": "2015+年+",
        "2014年": "2014+年+",
        "2013年": "2013+年+",
        "2012年": "2012+年+",
        "2011年": "2011+年+",
        "2010年": "2010+年+",
        "2009年": "2009+年+",
        "2008年": "2008+年+",
        "2007年": "2007+年+",
        "2006年": "2006+年+",
        "2005年": "2005+年+",
        "2004年": "2004+年+",
        "2003年": "2003+年+",
        "2002年": "2002+年+",
        "2001年": "2001+年+",
        "2000年": "2000+年+",
        "1999年": "1999+年+",
        "1998年": "1998+年+",
        "1997年": "1997+年+",
        "1996年": "1996+年+",
        "1995年": "1995+年+",
        "1994年": "1994+年+",
        "1993年": "1993+年+",
        "1992年": "1992+年+",
        "1991年": "1991+年+",
        "1990年": "1990+年+"
    };

    let query1 = getItem('query', '');
    let broad1 = getItem('broad', '') == 'on' ? '&broad=on' : '';
    let tags1 = getItem('tags', '') == '' ? '' : getItem('tags', '');
    let genre1 = params[getItem('genre', '全部')];
    let sort1 = params[getItem('sort', '默认')];
    let date1 = params[getItem('date', '全部')];
    let duration1 = params[getItem('duration', '全部')];
    let page = getItem('page', '1') == '1' ? '' : '&page=' + getItem('page', '1');
    let url = host + `/search?query=${query1}&type=video&genre=${genre1}${broad1}${tags1}&sort=${sort1}&date=${date1}&duration=${duration1}${page}`;
    //log(url);
    let layout_style = 'movie_2';

    var cfHtml = getMyVar('hanime_cf_html', '');
    var cfCookie = getMyVar('hanime_cf_cookie', '');
    var res;
    if (cfHtml) {
        clearMyVar('hanime_cf_html');
        res = cfHtml;
    } else if (cfCookie) {
        res = fetchCodeByWebView(url, {headers: {Cookie: cfCookie}});
    } else {
        res = fetch(url);
    }
    var cfDetected = false;
    if (!cfHtml && (res.indexOf('Just a moment') !== -1 || res.indexOf('#cfts') !== -1 || res.indexOf('_cf_chl_opt') !== -1)) {
        cfDetected = true;
    }
    if (cfDetected) {
        if (cfCookie) {
            clearMyVar('hanime_cf_cookie');
        }
        layouts.push({
            col_type: 'x5_webview_single',
            url: url,
            desc: 'list&&screen',
            extra: {
                ua: 'Mozilla/5.0 (Linux; Android 16; 2211133C Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.138 Mobile Safari/537.36',
                showProgress: false,
                js: $.toString((targetUrl) => {
                    fba.setWebUa('Mozilla/5.0 (Linux; Android 16; 2211133C Build/BP2A.250605.031.A3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.7727.138 Mobile Safari/537.36');
                    function check() {
                        var nodes = document.querySelectorAll('.video-item-container');
                        var co = fba.getCookie(targetUrl);
                        if (nodes && nodes.length > 0 && co) {
                            var html = document.documentElement.outerHTML;
                            fba.putVar('hanime_cf_cookie', co);
                            fba.putVar('hanime_cf_html', html);
                            fba.parseLazyRule($$$().lazyRule(function () {
                                putMyVar('hanime_cf_cookie', getVar('hanime_cf_cookie'));
                                putMyVar('hanime_cf_html', getVar('hanime_cf_html'));
                                clearVar('hanime_cf_cookie');
                                clearVar('hanime_cf_html');
                                back();
                            }));
                        } else {
                            setTimeout(check, 500);
                        }
                    }
                    check();
                }, url)
            }
        });
        setResult(layouts);
        return;
    }
    let selector = '.horizontal-row--.video-item-container,0--.video-item-container,0&&.video-item-container';
    pdfa(res, selector).forEach(function (li) {
        try {
            layouts.push({
                title: pdfh(li, '.title&&Text'),
                img: pdfh(li, 'img&&src'),
                desc: pdfh(li, '.stat-item,1&&Text'),
                url: $('hiker://empty' + privacyMode).rule((getVideoDetail, url, privacyMode) => {
                    addListener('onClose', $.toString(() => {
                        setItem('videoUrl', '');
                        setItem('sign', '0');
                    }));
                    let vu = getItem('sign', '0') == 1 ? getItem('videoUrl', '') : url;
                    setResult(getVideoDetail(vu, privacyMode))
                }, getVideoDetail, pdfh(li, 'a,0&&href'), privacyMode),
                col_type: layout_style
            });
        } catch (e) { log(e) }
    });

    let page_item
    try { page_item = pdfh(res, '.pagination&&.page-item,-2&&Text') } catch (e) { page_item = false }
    if (page_item) {
        layouts.push(
            {
                col_type: 'blank_block',
            },
            {
                title: '上一页',
                url: $('').lazyRule(() => {
                    let p = Number(getItem('page', '1'));
                    if (p > 1) {
                        p = p - 1;
                        setItem('page', p.toString());
                    }
                    refreshPage();
                    return 'hiker://empty';
                }),
                col_type: 'text_3',
            },
            {
                title: getItem('page', '1') + ' / ' + page_item,
                url: $('', '页数').input(() => {
                    let p = parseInt(input.trim());
                    if (!isNaN(p)) {
                        setItem('page', p.toString());
                        refreshPage();
                        return 'hiker://empty';
                    } else {
                        return 'toast://请输入数字';
                    }
                }),
                col_type: 'text_3',
            },
            {
                title: '下一页',
                url: $('').lazyRule(() => {
                    let p = Number(getItem('page', '1'));
                    p = p + 1;
                    setItem('page', p.toString());
                    refreshPage();
                    return 'hiker://empty';
                }),
                col_type: 'text_3',
            }
        );
    }
    setResult(layouts);
}
function setTags(params, iconHost) {
    function colorFont(c, f) {
        return '<font color="' + c + '">' + f + '</font>'
    }
    function big(e) {
        return '<big>' + e + '</big>'
    }
    function small(e) {
        return '<small>' + e + '</small>'
    }
    function b(e) {
        return '<b>' + e + '</b>'
    }
    function br() {
        return '<br>'
    }
    //标签信息
    let ypsx = ["无码", "AI解码", "中文字幕", "中文配音", "同人作品", "断面图", "ASMR", "1080p", "60FPS"];
    let rwgx = ["近亲", "姐", "妹", "母", "女儿", "师生", "情侣", "青梅竹马", "同事"];
    let jssd = ["JK", "处女", "御姐", "熟女", "人妻", "女教师", "男教师", "女医生", "女病人", "护士", "OL", "女警", "大小姐", "偶像", "女仆", "巫女", "魔女", "修女", "风俗娘", "公主", "女忍者", "女战士", "女骑士", "魔法少女", "异种族", "天使", "妖精", "魔物娘", "魅魔", "吸血鬼", "女鬼", "兽娘", "乳牛", "机械娘", "碧池", "痴女", "雌小鬼", "不良少女", "傲娇", "病娇", "无口", "无表情", "眼神死", "正太", "伪娘", "扶他"];
    let wmsc = ["短发", "马尾", "双马尾", "丸子头", "巨乳", "乳环", "舌环", "贫乳", "黑皮肤", "晒痕", "眼镜娘", "兽耳", "尖耳朵", "异色瞳", "美人痣", "肌肉女", "白虎", "阴毛", "腋毛", "大屌", "着衣", "水手服", "体操服", "泳装", "比基尼", "死库水", "和服", "兔女郎", "围裙", "啦啦队", "丝袜", "吊袜带", "热裤", "迷你裙", "性感内衣", "紧身衣", "丁字裤", "高跟鞋", "睡衣", "婚纱", "旗袍", "古装", "哥德", "口罩", "刺青", "淫纹", "身体写字"];
    let qjcs = ["校园", "教室", "图书馆", "保健室", "游泳池", "爱情宾馆", "医院", "办公室", "浴室", "窗边", "公共厕所", "公众场合", "户外野战", "电车", "车震", "游艇", "露营帐篷", "电影院", "健身房", "沙滩", "温泉", "夜店", "监狱", "教堂"];
    let gsjq = ["纯爱", "恋爱喜剧", "后宫", "十指紧扣", "开大车", "NTR", "精神控制", "药物", "痴汉", "阿嘿颜", "精神崩溃", "猎奇", "BDSM", "捆绑", "眼罩", "项圈", "调教", "异物插入", "寻欢洞", "肉便器", "性奴隶", "胃凸", "强制", "轮奸", "凌辱", "性暴力", "逆强制", "女王样", "榨精", "母女丼", "姐妹丼", "出轨", "醉酒", "摄影", "睡眠奸", "机械奸", "虫奸", "性转换", "百合", "耽美", "时间停止", "异世界", "怪兽", "哥布林", "世界末日"];
    let xjtw = ["手交", "指交", "乳交", "乳头交", "肛交", "双洞齐下", "脚交", "素股", "拳交", "3P", "群交", "口交", "深喉咙", "口爆", "吞精", "舔蛋蛋", "舔穴", "69", "自慰", "腋交", "舔腋下", "发交", "舔耳朵", "舔脚", "内射", "外射", "颜射", "潮吹", "怀孕", "喷奶", "放尿", "排便", "骑乘位", "背后位", "颜面骑乘", "火车便当", "一字马", "性玩具", "飞机杯", "跳蛋", "毒龙钻", "触手", "兽交", "颈手枷", "扯头发", "掐脖子", "打屁股", "肉棒打脸", "阴道外翻", "男乳首责", "接吻", "舌吻", "POV"];
    let params = { "无码": "無碼", "AI解码": "AI解碼", "中文字幕": "中文字幕", "中文配音": "中文配音", "同人作品": "同人作品", "断面图": "斷面圖", "ASMR": "ASMR", "1080p": "1080p", "60FPS": "60FPS", "近亲": "近親", "姐": "姐", "妹": "妹", "母": "母", "女儿": "女兒", "师生": "師生", "情侣": "情侶", "青梅竹马": "青梅竹馬", "同事": "同事", "JK": "JK", "处女": "處女", "御姐": "御姐", "熟女": "熟女", "人妻": "人妻", "女教师": "女教師", "男教师": "男教師", "女医生": "女醫生", "女病人": "女病人", "护士": "護士", "OL": "OL", "女警": "女警", "大小姐": "大小姐", "偶像": "偶像", "女仆": "女僕", "巫女": "巫女", "魔女": "魔女", "修女": "修女", "风俗娘": "風俗娘", "公主": "公主", "女忍者": "女忍者", "女战士": "女戰士", "女骑士": "女騎士", "魔法少女": "魔法少女", "异种族": "異種族", "天使": "天使", "妖精": "妖精", "魔物娘": "魔物娘", "魅魔": "魅魔", "吸血鬼": "吸血鬼", "女鬼": "女鬼", "兽娘": "獸娘", "乳牛": "乳牛", "机械娘": "機械娘", "碧池": "碧池", "痴女": "痴女", "雌小鬼": "雌小鬼", "不良少女": "不良少女", "傲娇": "傲嬌", "病娇": "病嬌", "无口": "無口", "无表情": "無表情", "眼神死": "眼神死", "正太": "正太", "伪娘": "偽娘", "扶他": "扶他", "短发": "短髮", "马尾": "馬尾", "双马尾": "雙馬尾", "丸子头": "丸子頭", "巨乳": "巨乳", "乳环": "乳環", "舌环": "舌環", "贫乳": "貧乳", "黑皮肤": "黑皮膚", "晒痕": "曬痕", "眼镜娘": "眼鏡娘", "兽耳": "獸耳", "尖耳朵": "尖耳朵", "异色瞳": "異色瞳", "美人痣": "美人痣", "肌肉女": "肌肉女", "白虎": "白虎", "阴毛": "陰毛", "腋毛": "腋毛", "大屌": "大屌", "着衣": "著衣", "水手服": "水手服", "体操服": "體操服", "泳装": "泳裝", "比基尼": "比基尼", "死库水": "死庫水", "和服": "和服", "兔女郎": "兔女郎", "围裙": "圍裙", "啦啦队": "啦啦隊", "丝袜": "絲襪", "吊袜带": "吊襪帶", "热裤": "熱褲", "迷你裙": "迷你裙", "性感内衣": "性感內衣", "紧身衣": "緊身衣", "丁字裤": "丁字褲", "高跟鞋": "高跟鞋", "睡衣": "睡衣", "婚纱": "婚紗", "旗袍": "旗袍", "古装": "古裝", "哥德": "哥德", "口罩": "口罩", "刺青": "刺青", "淫纹": "淫紋", "身体写字": "身體寫字", "校园": "校園", "教室": "教室", "图书馆": "圖書館", "保健室": "保健室", "游泳池": "游泳池", "爱情宾馆": "愛情賓館", "医院": "醫院", "办公室": "辦公室", "浴室": "浴室", "窗边": "窗邊", "公共厕所": "公共廁所", "公众场合": "公眾場合", "户外野战": "戶外野戰", "电车": "電車", "车震": "車震", "游艇": "遊艇", "露营帐篷": "露營帳篷", "电影院": "電影院", "健身房": "健身房", "沙滩": "沙灘", "温泉": "溫泉", "夜店": "夜店", "监狱": "監獄", "教堂": "教堂", "纯爱": "純愛", "恋爱喜剧": "戀愛喜劇", "后宫": "後宮", "十指紧扣": "十指緊扣", "开大车": "開大車", "NTR": "NTR", "精神控制": "精神控制", "药物": "藥物", "痴汉": "痴漢", "阿嘿颜": "阿嘿顏", "精神崩溃": "精神崩潰", "猎奇": "獵奇", "BDSM": "BDSM", "捆绑": "綑綁", "眼罩": "眼罩", "项圈": "項圈", "调教": "調教", "异物插入": "異物插入", "寻欢洞": "尋歡洞", "肉便器": "肉便器", "性奴隶": "性奴隸", "胃凸": "胃凸", "强制": "強制", "轮奸": "輪姦", "凌辱": "凌辱", "性暴力": "性暴力", "逆强制": "逆強制", "女王样": "女王樣", "榨精": "榨精", "母女丼": "母女丼", "姐妹丼": "姐妹丼", "出轨": "出軌", "醉酒": "醉酒", "摄影": "攝影", "睡眠奸": "睡眠姦", "机械奸": "機械姦", "虫奸": "蟲姦", "性转换": "性轉換", "百合": "百合", "耽美": "耽美", "时间停止": "時間停止", "异世界": "異世界", "怪兽": "怪獸", "哥布林": "哥布林", "世界末日": "世界末日", "手交": "手交", "指交": "指交", "乳交": "乳交", "乳头交": "乳頭交", "肛交": "肛交", "双洞齐下": "雙洞齊下", "脚交": "腳交", "素股": "素股", "拳交": "拳交", "3P": "3P", "群交": "群交", "口交": "口交", "深喉咙": "深喉嚨", "口爆": "口爆", "吞精": "吞精", "舔蛋蛋": "舔蛋蛋", "舔穴": "舔穴", "69": "69", "自慰": "自慰", "腋交": "腋交", "舔腋下": "舔腋下", "发交": "髮交", "舔耳朵": "舔耳朵", "舔脚": "舔腳", "内射": "內射", "外射": "外射", "颜射": "顏射", "潮吹": "潮吹", "怀孕": "懷孕", "喷奶": "噴奶", "放尿": "放尿", "排便": "排便", "骑乘位": "騎乘位", "背后位": "背後位", "颜面骑乘": "顏面騎乘", "火车便当": "火車便當", "一字马": "一字馬", "性玩具": "性玩具", "飞机杯": "飛機杯", "跳蛋": "跳蛋", "毒龙钻": "毒龍鑽", "触手": "觸手", "兽交": "獸交", "颈手枷": "頸手枷", "扯头发": "扯頭髮", "掐脖子": "掐脖子", "打屁股": "打屁股", "肉棒打脸": "肉棒打臉", "阴道外翻": "陰道外翻", "男乳首责": "男乳首責", "接吻": "接吻", "舌吻": "舌吻", "POV": "POV" };
    let layouts = [];

    layouts.push({
        title: b('X5内核中转'),
        img: getItem('X5_mode', '0') == '1' ? 'https://raw.githubusercontent.com/pjdkj/src/main/icon/开.svg' : 'https://raw.githubusercontent.com/pjdkj/src/main/icon/关.svg',
        url: $('#noLoading#').lazyRule(() => {
            if (getItem('X5_mode', '0') == '1') {
                setItem('X5_mode', '0');
                updateItem('X5_mode', { img: 'https://raw.githubusercontent.com/pjdkj/src/main/icon/关.svg' });
            }
            else {
                setItem('X5_mode', '1');
                updateItem('X5_mode', { img: 'https://raw.githubusercontent.com/pjdkj/src/main/icon/开.svg' });
            }
            return 'hiker://empty';
        }),
        col_type: 'text_icon',
        extra: {
            id: 'X5_mode',
        },
    });

    layouts.push({
        title: b('广泛配对') + '&nbsp;' + small('包含一个标签即匹配，而非全部标签。'),
        img: getItem('broad', '') == 'on' ? 'https://raw.githubusercontent.com/pjdkj/src/main/icon/开.svg' : 'https://raw.githubusercontent.com/pjdkj/src/main/icon/关.svg',
        url: $('#noLoading#').lazyRule(() => {
            if (getItem('broad', '') == 'on') {
                setItem('broad', '');
                updateItem('broad', { img: 'https://raw.githubusercontent.com/pjdkj/src/main/icon/关.svg' });
            }
            else {
                setItem('broad', 'on');
                updateItem('broad', { img: 'https://raw.githubusercontent.com/pjdkj/src/main/icon/开.svg' });
            }
            return 'hiker://empty';
        }),
        col_type: 'text_icon',
        extra: {
            id: 'broad',
        },
    });

    layouts.push({
        title: b('影片属性'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    ypsx.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('人物关系'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    rwgx.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('角色设定'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    jssd.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('外貌身材'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    wmsc.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('情境场所'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    qjcs.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('故事剧情'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    gsjq.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    layouts.push({
        title: b('性交体位'),
        col_type: 'rich_text',
        extra: { lineSpacing: 8 },
    });
    xjtw.forEach((cur) => {
        layouts.push({
            title: cur,
            url: $('#noLoading#').lazyRule((c, p) => {
                let tags = getItem('tags', '');
                let tag1 = '&tags%5B%5D=' + p[c];
                if (tags.includes(tag1)) {
                    setItem('tags', tags.replace(tag1, ''));
                    updateItem(c, { extra: { backgroundColor: '' } });
                }
                else {
                    setItem('tags', tags + tag1);
                    updateItem(c, { extra: { backgroundColor: '#45DB5E' } });
                }
                return 'hiker://empty';
            }, cur, params),
            col_type: 'flex_button',
            extra: {
                id: cur,
                backgroundColor: getItem('tags', '').includes(params[cur]) ? '#45DB5E' : ''
            }
        })
    });
    return layouts
}
function getVideoDetail(url, privacyMode) {
    function colorFont(c, f) {
        return '<font color="' + c + '">' + f + '</font>'
    }
    function small(e) {
        return '<small>' + e + '</small>'
    }

    let layouts = [];
    let res = fetch(url + privacyMode);

    const videoLink = new Map()
    const size = new Set();
    let list = pdfa(res, '#player&&source')
    for (let i = 0; i < list.length; i++) {
        size.add(parseInt(pdfh(list[i], 'source&&size')));
        videoLink.set(parseInt(pdfh(list[i], 'source&&size')), pdfh(list[i], 'source&&src'))
    }
    let uid = Array.from(size).sort((a, b) => b - a);

    layouts.push({
        title: '',
        url: videoLink.get(uid[0]),
        img: pdfh(res, '#player&&poster'),
        desc: '0',
        col_type: 'card_pic_1'
    })
    layouts.push({
        title: pdfh(res, 'h3&&Text') + '<br>' + small(pdfh(res, 'h3+div&&Text')),
        col_type: 'rich_text'
    })
    layouts.push({
        title: '画质：',
        url: '',
        col_type: 'flex_button'
    })
    uid.forEach((id) => {
        layouts.push({
            title: id + 'p',
            url: videoLink.get(id),
            col_type: 'flex_button'
        })
    })

    const idMap = new Map();
    let relatedVideo = pdfa(res, '#playlist-scroll--.related-watch-wrap,-1&&.related-watch-wrap');
    relatedVideo.forEach((cur) => {
        let url = pdfh(cur, 'a,0&&href');
        const match = url.match(/v=(\d+)/)[1];
        if (match) {
            const id = parseInt(match, 10);
            idMap.set(id, url);
            idMap.set(id + 't', pdfh(cur, '.card-mobile-title&&Text'));
            idMap.set(id + 'i', pdfh(cur, 'img,1&&src'));
            idMap.set(id + 'a', pdfh(cur, '.card-mobile-genre-wrapper&&a&&Text'));
            idMap.set(id + 'd', pdfh(cur, '.card-mobile-duration,-1&&Text'));
        }
    })
    let startId = parseInt(url.match(/v=(\d+)/)[1]);

    const resultIds = new Set();
    resultIds.add(startId);

    let left = startId - 1;
    while (idMap.has(left)) {
        resultIds.add(left);
        left--;
    }

    let right = startId + 1;
    while (idMap.has(right)) {
        resultIds.add(right);
        right++;
    }

    let relatedURLS = Array.from(resultIds).sort((a, b) => a - b);
    if (relatedURLS.length > 1) {
        relatedURLS.forEach((cur) => {
            layouts.push({
                title: idMap.get(cur) == url ? '““””' + colorFont('#45DB5E', idMap.get(cur + 't')) : idMap.get(cur + 't'),
                url: $('#noLoading#').lazyRule((u, t) => {
                    setPageTitle(t);
                    setItem('videoUrl', u);
                    setItem('sign', '1');
                    refreshPage();
                    return 'hiker://empty';
                }, idMap.get(cur), idMap.get(cur + 't')),
                img: idMap.get(cur + 'i'),
                desc: idMap.get(cur + 'a') + '\n' + idMap.get(cur + 'd'),
                col_type: 'movie_1_left_pic'
            })
        })
    }
    return layouts
}