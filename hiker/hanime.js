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
    let privacyMode = getItem('privacyMode', '#noHistory##noRecordHistory#');
    let layouts = [];
    layouts.push({
        url: $.toString((privacyMode) => {
            return $('hiker://empty/search?page=fypage&key=' + input + privacyMode).rule(() => {
                require(config.依赖);
                addListener('onClose', $.toString(() => { setItem('searchParam', ''); }));
                setResult(searchVideo(getParam('key', ''), MY_PAGE));
            });
        }, privacyMode),
        col_type: 'input',
        title: 'Search',
    });
    let genre = ["全部", "里番", "泡面番", "Motion Anime", "3DCG", "2.5D", "2D动画", "AI生成", "MMD", "Cosplay"];
    let genreValue = {
        "全部": "全部",
        "里番": "裏番",
        "泡面番": "泡麵番",
        "Motion Anime": "Motion Anime",
        "3DCG": "3DCG",
        "2.5D": "2.5D",
        "2D动画": "2D動畫",
        "AI生成": "AI生成",
        "MMD": "MMD",
        "Cosplay": "Cosplay"
    };
    layouts.push({
        title: getItem('genre', '全部') == '全部' ? '类型' : getItem('genre', '全部'),
        url: $(genre, 2, '类型').select(() => {
            setItem('genre', input);
            setItem('p', '1');
            refreshPage(false);
        }),
        col_type: 'flex_button'
    });
    layouts.push({
        title: '标签',
        url: 'https://cn.pornhub.com/shorties' + privacyMode,
        col_type: 'flex_button'
    });
    let sort = ["默认", "最新上市", "最新上传", "本日排行", "本周排行", "本月排行", "观看次数", "点赞比例", "时长最长", "他们在看"];
    let sortValue = {
        "默认": "",
        "最新上市": "最新上市",
        "最新上传": "最新上傳",
        "本日排行": "本日排行",
        "本周排行": "本週排行",
        "本月排行": "本月排行",
        "观看次数": "觀看次數",
        "点赞比例": "讚好比例",
        "时长最长": "時長最長",
        "他们在看": "他們在看"
    }
    layouts.push({
        title: getItem('sort', '默认') == '' ? '排序': getItem('sort', '默认'),
        url: $(sort, 1, '排序').select(() => {
            setItem('sort', input);
            setItem('p', '1');
            refreshPage(false);
        }),
        col_type: 'flex_button'
    });

    layouts.push({
        title: '日期',
        url: $('hiker://empty/sort' + privacyMode).rule(() => {
            require(config.依赖);
            setResult(getCategory());
        }),
        col_type: 'flex_button'
    });
    layouts.push({
        title: '时长',
        url: $('hiker://empty/setting' + privacyMode).rule((settingPage) => {
            setResult(settingPage());
        }, settingPage),
        col_type: 'flex_button'
    });

    let layout_style = '';
    switch (getItem('layout_style', '4')) {
        case '1': layout_style = 'pic_1_card'; break;
        case '2': layout_style = 'movie_1_left_pic'; break;
        case '3': layout_style = 'movie_1'; break;
        case '4': layout_style = 'movie_2'; break;
        default: layout_style = 'movie_2';
    }
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
    if (jx1 != '主页') {
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
    }
    setResult(layouts);
}
function searchVideo(key, page) {
    let layouts = [];
    if (page == '1') {
        layouts.push(
            {
                title: '最相关',
                url: $('#noLoading#').lazyRule(() => {
                    if (getItem('searchParam', '') != '') {
                        setItem('searchParam', '');
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }),
                col_type: 'flex_button',
            },
            {
                title: '最新',
                url: $('#noLoading#').lazyRule(() => {
                    if (getItem('searchParam', '') != '&o=mr') {
                        setItem('searchParam', '&o=mr');
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }),
                col_type: 'flex_button',
            },
            {
                title: '最多观看',
                url: $('#noLoading#').lazyRule(() => {
                    if (getItem('searchParam', '') != '&o=mv') {
                        setItem('searchParam', '&o=mv');
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }),
                col_type: 'flex_button',
            },
            {
                title: '最高分',
                url: $('#noLoading#').lazyRule(() => {
                    if (getItem('searchParam', '') != '&o=tr') {
                        setItem('searchParam', '&o=tr');
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }),
                col_type: 'flex_button',
            },
            {
                title: '最长',
                url: $('#noLoading#').lazyRule(() => {
                    if (getItem('searchParam', '') != '&o=lg') {
                        setItem('searchParam', '&o=lg');
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }),
                col_type: 'flex_button',
            }
        );
    }
    let layout_style = '';
    switch (getItem('layout_style', '4')) {
        case '1':
            layout_style = 'pic_1_card';
            break;
        case '2':
            layout_style = 'movie_1_left_pic';
            break;
        case '3':
            layout_style = 'movie_1';
            break;
        case '4':
            layout_style = 'movie_2';
            break;
        default:
            layout_style = 'movie_2';
    }
    let privacyMode = getItem('privacyMode', '#noHistory##noRecordHistory#');
    let url = 'https://cn.pornhub.com/video/search?search=' + key + '&page=' + page + getItem('searchParam', '') + privacyMode;
    let res = fetch(url);
    pdfa(res, '#videoListSearchResults&&li[data-video-id]').forEach(function (li) {
        try {
            layouts.push({
                title: pdfh(li, '.title&&Text'),
                img: pdfh(li, 'img&&data-path') + '@headers={"Referer":"https://cn.pornhub.com/"}',
                desc: pdfh(li, '.videoViews&&Text') + '次观看',
                url: 'https://cn.pornhub.com' + pdfh(li, '.title&&a&&href') + privacyMode,
                col_type: layout_style,
            });
        } catch (e) { }
    });
    return layouts;
}
function settingPage() {
    require(config.依赖);

    let layouts = [];
    let ls = getItem('layout_style', '4');
    setPageTitle('设置');
    layouts.push(
        {
            title: small(b('布局')),
            img: 'hiker://images/home_setting',
            col_type: 'avatar',
        },
        {
            title: b('一列大图'),
            img: ls == '1' ? 'hiker://images/icon_rect_selected' : 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                let sty = getItem('layout_style', '4');
                if (sty != '1') {
                    setItem('layout_style', '1');
                    updateItem('style1', { img: 'hiker://images/icon_rect_selected' });
                    updateItem('style' + sty, { img: 'hiker://images/icon_rect' });
                    //refreshPage(false);
                }
                return 'hiker://empty';
            }),
            col_type: 'text_icon',
            extra: {
                id: 'style1',
            },
        },
        {
            title: b('一列图左'),
            img: ls == '2' ? 'hiker://images/icon_rect_selected' : 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                let sty = getItem('layout_style', '4');
                if (sty != '2') {
                    setItem('layout_style', '2');
                    updateItem('style2', { img: 'hiker://images/icon_rect_selected' });
                    updateItem('style' + sty, { img: 'hiker://images/icon_rect' });
                    //refreshPage(false);
                }
                return 'hiker://empty';
            }),
            col_type: 'text_icon',
            extra: {
                id: 'style2',
            },
        },
        {
            title: b('一列图右'),
            img: ls == '3' ? 'hiker://images/icon_rect_selected' : 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                let sty = getItem('layout_style', '4');
                if (sty != '3') {
                    setItem('layout_style', '3');
                    updateItem('style3', { img: 'hiker://images/icon_rect_selected' });
                    updateItem('style' + sty, { img: 'hiker://images/icon_rect' });
                    //refreshPage(false);
                }
                return 'hiker://empty';
            }),
            col_type: 'text_icon',
            extra: {
                id: 'style3',
            },
        },
        {
            title: b('一行两列'),
            img: ls == '4' ? 'hiker://images/icon_rect_selected' : 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                let sty = getItem('layout_style', '4');
                if (sty != '4') {
                    setItem('layout_style', '4');
                    updateItem('style4', { img: 'hiker://images/icon_rect_selected' });
                    updateItem('style' + sty, { img: 'hiker://images/icon_rect' });
                    //refreshPage(false);
                }
                return 'hiker://empty';
            }),
            col_type: 'text_icon',
            extra: {
                id: 'style4',
            },
        },
        {
            col_type: 'line_blank',
        }
    );
    layouts.push(
        {
            title: small(b('其它')),
            img: 'hiker://images/home_setting',
            col_type: 'avatar',
        },
        {
            title: b('隐身模式'),
            img: getItem('privacyMode', '#noHistory##noRecordHistory#') == '' ? 'hiker://images/icon_rect' : 'hiker://images/icon_rect_selected',
            url: $('#noLoading#').lazyRule(() => {
                let pm = getItem('privacyMode', '#noHistory##noRecordHistory#');
                if (pm == '') {
                    setItem('privacyMode', '#noHistory##noRecordHistory#');
                    updateItem('privacyMode', { img: 'hiker://images/icon_rect_selected' });
                } else {
                    setItem('privacyMode', '')
                    updateItem('privacyMode', { img: 'hiker://images/icon_rect' });
                }
                return 'hiker://empty';
            }),
            col_type: 'text_icon',
            extra: {
                id: 'privacyMode'
            }
        },
        {
            title: b('占位文字'),
            img: 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                return 'toast://开发中';
            }),
            col_type: 'text_icon',
        },
        {
            title: b('占位文字'),
            img: 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                return 'toast://开发中';
            }),
            col_type: 'text_icon',
        },
        {
            title: b('占位文字'),
            img: 'hiker://images/icon_rect',
            url: $('#noLoading#').lazyRule(() => {
                return 'toast://开发中';
            }),
            col_type: 'text_icon',
        },
        {
            col_type: 'line_blank',
        }
    );
    layouts.push(
        {
            title:
                small(b('更新日期：2026-02-05 &nbsp;&nbsp; By &nbsp; 平静')) +
                br() +
                small('1.返回后刷新') +
                br() +
                small(colorFont('#ff2700', '2.禁止转载')),
            col_type: 'rich_text',
            extra: { lineSpacing: 8 },
        },
        {
            col_type: 'line_blank',
        }
    );
    layouts.push(
        {
            title: '‘‘’’<big>免责声明</big>',
            url: 'hiker://empty',
            col_type: 'text_center_1',
        },
        {
            title: small('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;本规则仅对网页源代码重新排版后显示，并') + small(colorFont('#ff2700', '不提供原始数据')) + small('仅供写源爱好者学习交流使用，请务必在导入') + small(colorFont('#ff2700', '24小时之内删除')) + small('。'),
            col_type: 'rich_text',
            extra: { lineSpacing: 8 },
        }
    );
    return layouts;
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