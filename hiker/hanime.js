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
        url: 'https://cn.pornhub.com/shorties' + privacyMode,
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
        "1 分钟 +": "1+分鐘++",
        "5 分钟 +": "5+分鐘++",
        "10 分钟 +": "10+分鐘++",
        "20 分钟 +": "20+分鐘++",
        "30 分钟 +": "30+分鐘++",
        "60 分钟 +": "60+分鐘++",
        "0 - 10 分钟": "0+-+10+分鐘",
        "0 - 20 分钟": "0+-+20+分鐘",
    };

    let layout_style = 'movie_2';

    //let jx1 = getItem('jx', '主页');
    //let url = urls[jx1];
    //let select = '';
    //if (jx1 != '主页') {
    //    if (jx1 == '最新精选') {
    //        url = url + '?page=' + getItem('p', '1');
    //    } else {
    //        url = url + '&page=' + getItem('p', '1');
    //    }
    //    select = '.videoList&&li[data-video-id]';
    //} else {
    //    select = '#singleFeedSection&&li[data-video-id]';
    //}
    //let res = fetch(url);
    //pdfa(res, select).forEach(function (li) {
    //    try {
    //        layouts.push({
    //            title: pdfh(li, '.title&&Text'),
    //            img: pdfh(li, 'img&&data-path') + '@headers={"Referer":"https://cn.pornhub.com/"}',
    //            desc: pdfh(li, '.views&&Text'),
    //            url: 'https://cn.pornhub.com' + pdfh(li, '.title&&a&&href') + privacyMode,
    //            col_type: layout_style
    //        });
    //    } catch (e) { }
    //});

    layouts.push(
        {
            col_type: 'blank_block',
        },
        {
            title: '上一页',
            url: $('').lazyRule(() => {
                let p = Number(getItem('p', '1'));
                if (p > 1) {
                    p = p - 1;
                    setItem('p', p.toString());
                }
                refreshPage();
                return 'hiker://empty';
            }),
            col_type: 'text_3',
        },
        {
            title: '自选页',
            url: $('', '页数').input(() => {
                let p = parseInt(input.trim());
                if (!isNaN(p)) {
                    setItem('p', p.toString());
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
                let p = Number(getItem('p', '1'));
                p = p + 1;
                setItem('p', p.toString());
                refreshPage();
                return 'hiker://empty';
            }),
            col_type: 'text_3',
        }
    );

    setResult(layouts);
}

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