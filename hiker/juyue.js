function yanzhengd(d, str, url, host, a, ua) {
    d.push({
        title: '人机验证',
        url: $('hiker://empty').rule((str, url, t, a, ua) => {
            var d = [];
            d.push({
                col_type: 'x5_webview_single',
                url: url,
                desc: 'list&&screen',
                extra: {
                    ua: !ua ? MOBILE_UA : PC_UA,
                    showProgress: false,
                    js: $.toString((str, url, t, a, ua) => {
                        function check() {
                            let nodes = document.querySelectorAll(str);
                            var co = fba.getCookie(url);
                            fba.log(co);
                            let condition;
                            if (a) {
                                condition = (!nodes || nodes.length === 0) && co;
                            } else {
                                condition = nodes && nodes.length > 0 && co;
                            }
                            if (condition) {
                                fba.putVar(t + 'ck', co);
                                fba.parseLazyRule($$$().lazyRule(() => {
                                    back();
                                }));
                            } else {
                                setTimeout(check, 500);
                            }
                        }
                        check();
                    }, str, url, t, a, ua)
                }
            });
            return setResult(d);
        }, str, url, host, a, ua),
        col_type: 'text_1'
    });
    return d;
}