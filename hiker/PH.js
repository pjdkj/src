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
    let urls = {
        主页: 'https://cn.pornhub.com',
        最新精选: 'https://cn.pornhub.com/video',
        最热门: 'https://cn.pornhub.com/video?o=ht',
        最多观看: 'https://cn.pornhub.com/video?o=mv',
        最高分: 'https://cn.pornhub.com/video?o=tr',
        最长: 'https://cn.pornhub.com/video?o=lg',
    };
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
    let jingxuan = ['主页', '最新精选', '最热门', '最多观看', '最高分', '最长'];
    layouts.push({
        title: '精选',
        url: $(jingxuan, 2, '').select(() => {
            setItem('jx', input);
            setItem('p', '1');
            refreshPage(false);
        }),
        pic_url: 'hiker://images/icon_isou',
        col_type: 'icon_5',
    });
    layouts.push({
        title: '短片',
        url: 'https://cn.pornhub.com/shorties' + privacyMode,
        pic_url: 'hiker://images/bbs',
        col_type: 'icon_5',
    });
    layouts.push({
        title: '明星',
        url: $('hiker://empty/star?page=fypage&_t=0' + privacyMode).rule(() => {
            require(config.依赖);
            addListener('onClose', $.toString(() => { setItem('starParam', ''); }));
            setResult(getStars(MY_PAGE));
        }),
        pic_url: 'hiker://images/icon_hot',
        col_type: 'icon_5',
    });
    layouts.push({
        title: '分类',
        url: $('hiker://empty/sort' + privacyMode).rule(() => {
            require(config.依赖);
            setResult(getCategory());
        }),
        pic_url: 'hiker://images/icon_top',
        col_type: 'icon_5',
    });
    layouts.push({
        title: '设置',
        url: $('hiker://empty/setting' + privacyMode).rule((settingPage) => {
            setResult(settingPage());
        }, settingPage),
        pic_url: 'hiker://images/home_setting',
        col_type: 'icon_5',
    });
    let layout_style = '';
    switch (getItem('layout_style', '4')) {
        case '1': layout_style = 'pic_1_card'; break;
        case '2': layout_style = 'movie_1_left_pic'; break;
        case '3': layout_style = 'movie_1'; break;
        case '4': layout_style = 'movie_2'; break;
        default: layout_style = 'movie_2';
    }
    let jx1 = getItem('jx', '主页');
    let url = urls[jx1];
    let select = '';
    if (jx1 != '主页') {
        if (jx1 == '最新精选') {
            url = url + '?page=' + getItem('p', '1');
        } else {
            url = url + '&page=' + getItem('p', '1');
        }
        select = '.videoList&&li[data-video-id]';
    } else {
        select = '#singleFeedSection&&li[data-video-id]';
    }
    let res = fetch(url);
    pdfa(res, select).forEach(function (li) {
        try {
            layouts.push({
                title: pdfh(li, '.title&&Text'),
                img: pdfh(li, 'img&&data-path'),
                desc: pdfh(li, '.views&&Text'),
                url: $('https://cn.pornhub.com' + pdfh(li, '.title&&a&&href') + privacyMode).rule(() => {
                    log(MY_URL);
                    let layouts = [];
                    layouts.push({
                        url: MY_URL,
                        col_type: "x5_webView_single",
                        desc: "list&&screen",
                        extra: {
                            ua: MOBILE_UA
                        }
                    });
                    setResult(layouts);
                }),
                col_type: layout_style
            });
        } catch (e) { }
    });
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
                img: pdfh(li, 'img&&data-path'),
                desc: pdfh(li, '.videoViews&&Text') + '次观看',
                url: 'https://cn.pornhub.com' + pdfh(li, '.title&&a&&href') + privacyMode,
                col_type: layout_style,
            });
        } catch (e) { }
    });
    return layouts;
}
function getStars(page) {
    let layouts = [];
    let privacyMode = getItem('privacyMode', '#noHistory##noRecordHistory#');
    let sorts = ['最受欢迎', '最多观看', '最热门', '最多订阅', '字母顺序', '视频数量', '随机'];
    let params = ['', '&o=mv', '&o=t', '&o=ms', '&o=a', '&o=nv', '&o=r'];
    if (page == '1') {
        for (let i = 0; i < sorts.length; i++) {
            layouts.push({
                title: sorts[i],
                url: $('#noLoading#').lazyRule((params, i) => {
                    if (getItem('starParam', '') != params[i]) {
                        setItem('starParam', params[i]);
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }, params, i),
                col_type: 'text_4',
            })
        }
    }
    let url = 'https://cn.pornhub.com/pornstars' + '?page=' + page + getItem('starParam', '') + privacyMode;
    let res = fetch(url);
    pdfa(res, '#pornstarListSection&&li').forEach((li) => {
        layouts.push({
            title: pdfh(li, '.title&&Text'),
            desc: '0',
            img: pdfh(li, 'img&&data-thumb_url'),
            url: $('hiker://empty/star?page=fypage&_t=0' + privacyMode + '#immersiveTheme#').rule((getStarDetails, link) => {
                addListener('onClose', $.toString(() => {
                    setItem('starDetailParam', '');
                }));
                setResult(getStarDetails(link, getParam('page')));
            }, getStarDetails, pdfh(li, 'a&&href')),
            col_type: 'card_pic_2',
        });
    });
    return layouts
}
function getStarDetails(link, page) {
    function big(e) {
        return '<big>' + e + '</big>'
    }
    let layouts = [];
    let sorts = ['最佳', '最新', '最多观看', '最高分', '最长'];
    let params = ['', '&o=mr', '&o=mv', '&o=tr', '&o=lg'];
    let privacyMode = getItem('privacyMode', '#noHistory##noRecordHistory#');
    let url = 'https://cn.pornhub.com' + link + '/videos' + '?page=' + page + getItem('starDetailParam', '') + privacyMode;
    //log(url);
    let res = fetch(url);
    if (page == '1') {
        layouts.push({
            title: '‘‘’’' + big(pdfh(res, '.avatarWrapper&&img&&alt')),
            desc: pdfh(res, '.mobileRanksButton&&Text'),
            img: pdfh(res, '.avatarWrapper&&img&&src'),
            col_type: 'movie_1_vertical_pic_blur',
            extra: { gradient: true },
        });
        for (let i = 0; i < sorts.length; i++) {
            layouts.push({
                title: sorts[i],
                url: $('#noLoading#').lazyRule(
                    (params, i) => {
                        if (getItem('starDetailParam', '') != params[i]) {
                            setItem('starDetailParam', params[i]);
                            refreshPage(false);
                        }
                        return 'hiker://empty';
                    },
                    params,
                    i
                ),
                col_type: 'flex_button',
            });
        }
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
    pdfa(res, '.videoList,-1&&li[data-video-id]').forEach(function (li) {
        try {
            layouts.push({
                title: pdfh(li, '.title&&Text'),
                img: pdfh(li, 'img&&data-path'),
                desc: pdfh(li, '.views&&Text'),
                url: 'https://cn.pornhub.com' + pdfh(li, '.title&&a&&href') + privacyMode,
                col_type: layout_style,
            });
        } catch (e) { }
    });
    return layouts;
}
function getCategory() {
    let layouts = [];
    let privacyMode = getItem('privacyMode', '#noHistory##noRecordHistory#');
    let res = fetch('https://cn.pornhub.com/categories');
    pdfa(res, '#categoriesListingWrapper,1&&li.catPic').forEach((li, index) => {
        let idx = index % 4;
        let layoutStyle;
        if (idx < 2) {
            layoutStyle = 'card_pic_2_2_left';
        } else {
            layoutStyle = 'card_pic_2_2';
        }
        layouts.push({
            title: pdfh(li, 'a&&alt'),
            desc: pdfh(li, '.videoCount&&Text'),
            img: pdfh(li, 'img&&src'),
            url: $('hiker://empty/categories?page=fypage&_t=0' + privacyMode).rule((getCategoryDetails, link) => {
                addListener('onClose', $.toString(() => { setItem('categoryParam', ''); }));
                setResult(getCategoryDetails(link, getParam('page')));
            }, getCategoryDetails, pdfh(li, 'a&&href')),
            col_type: layoutStyle,
        });
    });
    return layouts;
}
function getCategoryDetails(link, page) {
    let layouts = [];
    let sorts = ['精选', '最多观看', '最热门', '最高分', '最长', '最新'];
    let params = ['', '&o=mv', '&o=ht', '&o=tr', '&o=lg', '&o=cm'];
    if (page == '1') {
        for (let i = 0; i < sorts.length; i++) {
            layouts.push({
                title: sorts[i],
                url: $('#noLoading#').lazyRule((params, i) => {
                    if (getItem('categoryParam', '') != params[i]) {
                        setItem('categoryParam', params[i]);
                        refreshPage(false);
                    }
                    return 'hiker://empty';
                }, params, i),
                col_type: 'scroll_button',
            })
        }
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
    if (/\?/.test(link)) {
        link = link + '&page=' + page;
    } else {
        link = link + '?page=' + page;
    };
    let url = 'https://cn.pornhub.com' + link + getItem('categoryParam', '') + privacyMode;
    //log(url)
    let res = fetch(url);
    pdfa(res, '.videoList&&li[data-video-id]').forEach(function (li) {
        try {
            layouts.push({
                title: pdfh(li, '.title&&Text'),
                img: pdfh(li, 'img&&data-path'),
                desc: pdfh(li, '.views&&Text'),
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
                small(b('更新日期：2025-05-14 &nbsp;&nbsp; By &nbsp; 平静')) +
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