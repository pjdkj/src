/*
该函数适用于原网站图片不分页的情况
imgSrc: string      // 必须：图片的src,多张图片默认以换行符分隔
viewer?: boolean    // 可选：查看大图插件，默认true，为false时禁用，微弱提升性能
tag?: string        // 可选：自定义html标签，插入到页面顶部，通常用于标题等,例如：`<h1 style='text-align:center;'>${java.getString("h1@text")}</h1>`
style?: string      // 可选：自定义标签样式，插入到<style></style>里，或写在阅读预留位置

阅读调用示例:
class.list-gallery@img@src
<js>
danyeHtml(result);
</js>
*/
function danyeHtml(imgSrc, viewer, tag, style) {
    /* ---------- 参数校验 ---------- */
    if (typeof imgSrc !== 'string' || imgSrc.trim() === '') {
        throw new Error('< error: imgSrc必须是非空字符串 >');
    }
    if (viewer !== undefined && typeof viewer !== 'boolean') {
        throw new TypeError(`< error: viewer 必须是 boolean，当前值：${JSON.stringify(viewer)} >`);
    }
    viewer = viewer !== false;

    if (tag && typeof tag !== 'string') {
        throw new TypeError(`< error: tag 必须是 string 类型，当前值：${JSON.stringify(tag)} >`);
    }
    if (tag && !/<[\S\s]*?>/.test(tag)) {
        throw new TypeError(`< error: 没有检测到html标签<***>，当前值：${JSON.stringify(tag)} >`);
    }
    tag = tag || "";

    if (style && typeof style !== 'string') {
        throw new TypeError(`< error: style 必须是 string 类型，当前值：${JSON.stringify(style)} >`);
    }
    if (style && !/\{[\S\s]*?\}/.test(style)) {
        throw new TypeError(`< error: 没有检测到style样式{***}，当前值：${JSON.stringify(style)} >`);
    }
    style = style || "";

    const list = imgSrc.split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');
    if (list.length === 0) {
        throw new Error(`< error: imgSrc 未包含任何有效图片地址,当前值：${JSON.stringify(imgSrc)} >`);
    }

    const imgArr = list.reduce((acc, url) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            acc.push(`<li><img data-src="${url}" alt="图片"></li>`);
        }
        return acc;
    }, []);

    let imgTags = imgArr.join('\n');

    //设置主题
    const { cache } = this;
    let background = cache.get("_BACK_GROUND_COLOR_") || "floralwhite";
    let width = cache.get("_PICTURE_MARGIN_LEFT_RIGHT_") || 95;
    let marginBottom = cache.get("_PICTURE_MARGIN_TOP_BOTTOM_") || 10;
    let borderRadius = cache.get("_PICTURE_BORDER_RADIUS_") || 10;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>图片</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.css">
    <style>
        :root {
            --item-width: ${width}vw;
            --aspect-ratio: 65/100;
        }

        body {
            margin: 0;
            padding: 10px 0;
            background-color: ${background};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
        }

        .gallery {
            list-style: none;
            padding: 0;
            margin: 0 auto;
            width: var(--item-width);
            max-width: 400px;
        }

            .gallery li {
                width: 100%;
                margin-bottom: ${marginBottom}px;
                background: ${background};
                border-radius: ${borderRadius}px;
                overflow: hidden;
                position: relative;
                height: 0;
                padding-top: calc(100% / (var(--aspect-ratio, 65/100)));
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

                .gallery li.error {
                    background: repeating-linear-gradient( 45deg, #f1f3f5, #f1f3f5 10px, #e9ecef 10px, #e9ecef 20px );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #ff6b6b;
                    font-size: 14px;
                }

                    .gallery li.error::after {
                        content: "加载失败";
                    }

            .gallery img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.4s ease-out;
                /* 提升图片渲染性能 */
                will-change: opacity;
            }

                .gallery img[loaded] {
                    opacity: 1;
                }
        #load-finish {
            text-align: center;
            color: #999;
            font-size: 14px;
            padding: 20px 0 10px;
        }
        ${style}
    </style>
</head>
<body>
    ${tag}
    <ul class="gallery">
        ${imgTags}
    </ul>
    <div id="load-finish">已加载全部内容</div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.js"></script>
    <script>
        const CONFIG = {
            retry: { maxAttempts: 3, initialDelay: 1000, backoff: 2 },
            viewer: ${viewer},
            viewerParams: { toolbar: { zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1 }, transition: false, navbar: false, title: false },
            load: { concurrency: 3, batchDelay: 300 }
        };

        // Viewer实例管理 - 优化更新频率
        const viewerManager = {
            instance: null,
            updateTimer: null,
            init() {
                if (this.instance) return;
                this.instance = new Viewer(document.querySelector('.gallery'), {
                    ...CONFIG.viewerParams,
                    url: 'data-src'
                });
            },
            update() {
                if (!this.instance) return; 
                if (this.updateTimer) clearTimeout(this.updateTimer);
                this.updateTimer = setTimeout(() => {
                    this.instance?.update();
                    this.updateTimer = null;
                }, 100);
            },
            destroy() {
                if (this.instance) {
                    try {
                        this.instance.destroy();
                        document.querySelectorAll('.viewer-container').forEach(container => container.remove());
                    } catch (e) {
                        console.error('Viewer销毁失败:', e);
                    }
                    this.instance = null;
                }
            }
        };

        // 图片加载控制
        const imageLoader = {
            loadingCount: 0, // 当前加载中的图片数
            imageQueue: [],  // 待加载图片队列

            // 初始化加载队列
            initQueue() {
                this.imageQueue = Array.from(document.querySelectorAll('.gallery img'));
                // 启动并发加载
                this.loadNextBatch();
            },

            // 加载下一批图片
            loadNextBatch() {
                // 还有待加载图片 && 当前加载数 < 最大并发数
                while (this.imageQueue.length > 0 && this.loadingCount < CONFIG.load.concurrency) {
                    const img = this.imageQueue.shift();
                    this.loadImage(img);
                }
            },

            // 单张图片加载逻辑
            loadImage(img, attempt = 1) {
                // 防止重复加载
                if (img.hasAttribute('loading') || img.src || img.parentElement.classList.contains('error')) {
                    this.loadingCount--;
                    this.loadNextBatch();
                    return;
                }

                img.setAttribute('loading', '');
                this.loadingCount++;

                const src = img.dataset.src;
                const tempImg = new Image();

                tempImg.onload = () => {
                    // 提前计算宽高比，减少布局闪烁
                    const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;
                    img.parentElement.style.setProperty('--aspect-ratio', aspectRatio);

                    img.src = src;
                    img.setAttribute('loaded', '');
                    img.removeAttribute('loading');

                    this.loadingCount--;
                    this.scheduleViewerUpdate();

                    // 延迟加载下一批，避免瞬间请求
                    setTimeout(() => {
                        this.loadNextBatch();
                    }, CONFIG.load.batchDelay);
                };

                tempImg.onerror = () => {
                    img.removeAttribute('loading');
                    this.handleError(img, attempt);
                };

                // 超时处理
                tempImg.timeoutId = setTimeout(() => {
                    tempImg.onerror();
                }, 10000); // 10秒超时

                tempImg.src = src;
            },

            // 错误处理
            handleError(img, attempt) {
                this.loadingCount--;

                // 重试次数未达上限
                if (attempt < CONFIG.retry.maxAttempts) {
                    const delay = CONFIG.retry.initialDelay * Math.pow(CONFIG.retry.backoff, attempt - 1);
                    setTimeout(() => {
                        // 重新加入队列末尾
                        this.imageQueue.push(img);
                        this.loadNextBatch();
                    }, delay);
                } else {
                    // 重试失败
                    img.parentElement.classList.add('error');
                    img.alt = '图片加载失败';
                    this.scheduleViewerUpdate();
                    // 加载下一张
                    this.loadNextBatch();
                }
            },

            scheduleViewerUpdate() {
                viewerManager.update();
            }
        };

        // 页面初始化
        document.addEventListener('DOMContentLoaded', () => {
            if (CONFIG.viewer) viewerManager.init();
            imageLoader.initQueue();
        });

        // 窗口变化时防抖更新
        window.addEventListener('resize', () => {
            viewerManager.update();
        });

        // 页面卸载时销毁
        window.addEventListener('beforeunload', () => {
            viewerManager.destroy();
        });
    </script>
</body>
</html>`;
}

/*
该函数适用于原网站图片分多页加载的情况，通过“下一页”链接逐页抓取图片并展示在单一页面中。
let config = {
    html?: string,              // 二选一：第一页 HTML（优先复用已经得到的第一页请求结果）
    firstPageUrl?: string,      // 二选一：第一页 URL（html 不存在时必须，会再次请求）
    host?: string,              // 可选：默认使用baseUrl解析相对路径链接，有误时手动填写
    nextPageSelector: string,   // 必须：下一页链接的 CSS 选择器
    imageSelector: string,      // 必须：图片CSS选择器
    viewer?: boolean,           // 可选：查看大图插件，默认true，为false时禁用，微弱提升性能
    lazy?: boolean,             // 可选：默认true，为false时直接按第一页到最后一页顺序加载全部图片
    batchSize?: number,         // 可选：lazy: true时生效，每批加载页数，默认2，页面将要划到底时加载下一批
    tag?: string,               // 可选：自定义html标签，插入到页面顶部，通常用于标题等，例如：`<h1 style='text-align:center;'>${java.getString("h1@text")}</h1>`
    style?: string              // 可选：自定义标签样式，插入到<style></style>里，或写在阅读预留位置
}

阅读调用示例:
<js>
let config = {
    html: String(result),
    nextPageSelector: '.pagelist>a:contains(下一页)',
    imageSelector: "figure img"
}
duoyeHtml(config)
</js>
 */
function duoyeHtml(config) {
    /* ---------- 参数校验 ---------- */
    if (Object.prototype.toString.call(config) !== '[object Object]') {
        throw new TypeError('< error: config 必须是对象 >');
    }

    let {
        html = '',
        firstPageUrl = '',
        host = String(this.baseUrl),
        nextPageSelector = '',
        imageSelector = '',
        viewer = true,
        lazy = true,
        batchSize = 2,
        tag = '',
        style = ''
    } = config;

    if (html && typeof html !== 'string') {
        throw new TypeError(`< error: html 必须是 string 类型，当前值：${JSON.stringify(html)} >`);
    }
    if (!html && (!firstPageUrl || typeof firstPageUrl !== 'string')) {
        throw new TypeError(`< error: html 不存在时，必须提供 firstPageUrl，当前值：${JSON.stringify(firstPageUrl)} >`);
    }
    if (html && firstPageUrl && typeof firstPageUrl !== 'string') {
        throw new TypeError(`< error: firstPageUrl 必须是 string 类型，当前值：${JSON.stringify(firstPageUrl)} >`);
    }
    if (host && typeof host !== 'string') {
        throw new TypeError(`< error: host 必须是 string 类型，当前值：${JSON.stringify(host)} >`);
    }
    if (typeof nextPageSelector !== 'string' || !nextPageSelector.trim()) {
        throw new TypeError(`< error: nextPageSelector 必须是非空字符串，当前值：${JSON.stringify(nextPageSelector)} >`);
    }
    if (typeof imageSelector !== 'string' || !imageSelector.trim()) {
        throw new TypeError(`< error: imageSelector 必须是非空字符串，当前值：${JSON.stringify(imageSelector)} >`);
    }
    if (typeof viewer !== 'boolean') {
        throw new TypeError(`< error: viewer 必须是 boolean，当前值：${JSON.stringify(viewer)} >`);
    }
    if (typeof lazy !== 'boolean') {
        throw new TypeError(`< error: lazy 必须是 boolean，当前值：${JSON.stringify(lazy)} >`);
    }
    if (!Number.isInteger(batchSize) || batchSize <= 0) {
        throw new TypeError(`< error: batchSize 必须是正整数，当前值：${JSON.stringify(batchSize)} >`);
    }
    if (tag && typeof tag !== 'string') {
        throw new TypeError(`< error: tag 必须是 string 类型，当前值：${JSON.stringify(tag)} >`);
    }
    if (tag && !/<[\S\s]*?>/.test(tag)) {
        throw new TypeError(`< error: 没有检测到html标签<***>，当前值：${JSON.stringify(tag)} >`);
    }
    if (style && typeof style !== 'string') {
        throw new TypeError(`< error: style 必须是 string 类型，当前值：${JSON.stringify(style)} >`);
    }
    if (style && !/\{[\S\s]*?\}/.test(style)) {
        throw new TypeError(`< error: 没有检测到style样式{***}，当前值：${JSON.stringify(style)} >`);
    }

    const { java, cache } = this;
    //设置主题
    let background = cache.get("_BACK_GROUND_COLOR_") || "floralwhite";
    let width = cache.get("_PICTURE_MARGIN_LEFT_RIGHT_") || 95;
    let marginBottom = cache.get("_PICTURE_MARGIN_TOP_BOTTOM_") || 10;
    let borderRadius = cache.get("_PICTURE_BORDER_RADIUS_") || 10;

    // 复用第一页 HTML
    let FIRST_PAGE_IMG = html
        ? java.getStringList(`${imageSelector}@src`, html)
        : [];
    let SECOND_PAGE_URL = html
        ? java.getString(`${nextPageSelector}@href`, html)
        : '';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>图片</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.css">
    <style>
        :root {
            --item-width: ${width}vw;
            --aspect-ratio: 65/100;
        }

        body {
            margin: 0;
            padding: 10px 0;
            background-color: ${background};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
        }

        .gallery {
            list-style: none;
            padding: 0;
            margin: 0 auto;
            width: var(--item-width);
            max-width: 400px;
        }

            .gallery li {
                width: 100%;
                margin-bottom: ${marginBottom}px;
                background: ${background};
                border-radius: ${borderRadius}px;
                overflow: hidden;
                position: relative;
                height: 0;
                padding-top: calc(100% / (var(--aspect-ratio, 65/100)));
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }

            .gallery img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.4s ease-out;
            }

                .gallery img[loaded] {
                    opacity: 1;
                }

                .gallery img.error {
                    filter: grayscale(1);
                    background: repeating-linear-gradient(45deg, #f1f3f5, #f1f3f5 10px, #e9ecef 10px, #e9ecef 20px);
                    color: #ff6b6b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

        #load-status {
            text-align: center;
            padding: 15px;
            color: #666;
        }

        ${style}
    </style>
</head>
<body>
    ${tag}
    <ul class="gallery"></ul>
    <div id="load-status"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.js"></script>
    <script>
        const CONFIG = {
            imageSelector: ${JSON.stringify(imageSelector)},
            nextPageSelector: ${JSON.stringify(nextPageSelector)},
            viewer: ${viewer},
            lazy: ${lazy},
            batchSize: ${batchSize},
            imageLoad: {
                batchSize: 3, // 每批加载3张
                viewportFirst: true, // 首屏图片优先加载
                cache: true // 启用图片缓存
            },
            retry: { maxAttempts: 3, initialDelay: 1000, backoff: 2 },
            viewerParams: { toolbar: { zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1 }, transition: false, navbar: false, title: false },
            observer: { rootMargin: '800px', threshold: 0.01 }
        };

        let isLoading = false;
        let loadFailed = false;
        let noMorePages = false;
        let pageObserver = null;
        let pendingPageResolve = null;

        const pageQueue = [];
        const visitedPages = new Set();
        const imageAbortControllers = new Map();

        /* --- Viewer 管理 --- */
        const viewerManager = {
            instance: null,
            timer: null,
            init() {
                if (this.instance) return;
                this.instance = new Viewer(document.querySelector('.gallery'), {
                    ...CONFIG.viewerParams,
                    url: 'data-src'
                });
            },
            update() {
                if (!this.instance) return;
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.instance?.update();
                }, 100);
            },
            destroy() {
                clearTimeout(this.timer);
                this.instance?.destroy();
                // 中断所有未完成的图片请求
                imageAbortControllers.forEach(controller => controller.abort());
                imageAbortControllers.clear();
            }
        };

        /* --- 图片加载器 --- */
        const imageLoader = {
            // 异步串行分批加载图片
            async loadImagesInOrder(imgs) {
                if (!imgs.length) return;

                // 步骤1：分离首屏/非首屏图片
                const [viewportImgs, otherImgs] = CONFIG.imageLoad.viewportFirst
                    ? this.splitViewportImages(imgs)
                    : [[], imgs];

                // 步骤2：先加载首屏图片
                await this.loadImageBatch(viewportImgs);
                // 步骤3：分批加载剩余图片
                for (let i = 0; i < otherImgs.length; i += CONFIG.imageLoad.batchSize) {
                    const batch = otherImgs.slice(i, i + CONFIG.imageLoad.batchSize);
                    await this.loadImageBatch(batch);
                }
            },

            // 加载单批图片
            async loadImageBatch(imgs) {
                if (!imgs.length) return Promise.resolve();
                const promises = imgs.map(img => this.loadImage(img));
                await Promise.allSettled(promises); // 不阻塞批次加载
            },

            // 分离视口内/外图片
            splitViewportImages(imgs) {
                const viewportImgs = [];
                const otherImgs = [];
                const viewportHeight = window.innerHeight;

                imgs.forEach(img => {
                    const rect = img.getBoundingClientRect();
                    // 图片进入/即将进入视口（提前200px）
                    const isInViewport = rect.top < viewportHeight + 200 && rect.bottom > -200;
                    isInViewport ? viewportImgs.push(img) : otherImgs.push(img);
                });
                return [viewportImgs, otherImgs];
            },

            // 加载单张图片
            loadImage(img) {
                // 跳过已加载/失败/加载中的图片
                if (img.hasAttribute('loaded') || img.classList.contains('error')) return Promise.resolve();
                if (img.hasAttribute('loading')) return new Promise(resolve => {
                    // 监听加载完成（避免重复请求）
                    const onLoad = () => { resolve(); img.removeEventListener('load', onLoad); };
                    const onError = () => { resolve(); img.removeEventListener('error', onError); };
                    img.addEventListener('load', onLoad);
                    img.addEventListener('error', onError);
                });

                // 标记加载中
                img.setAttribute('loading', '');
                // 初始化重试次数（存在则复用）
                const attempt = parseInt(img.dataset.retryAttempt || 1);
                // 创建中断控制器
                const controller = new AbortController();
                const signal = controller.signal;
                imageAbortControllers.set(img, controller);

                return new Promise((resolve) => {
                    const src = CONFIG.imageLoad.cache && attempt === 1
                        ? img.dataset.src
                        : img.dataset.src + '?t=' + Date.now();

                    const tempImg = new Image();
                    tempImg.signal = signal;

                    tempImg.onload = () => {
                        imageAbortControllers.delete(img);
                        this.handleSuccess(img, tempImg);
                        resolve();
                    };

                    tempImg.onerror = () => {
                        this.handleError(img, attempt).then(resolve).catch(resolve);
                        imageAbortControllers.delete(img);
                    };

                    // 监听中断信号
                    signal.addEventListener('abort', () => {
                        img.removeAttribute('loading');
                        resolve();
                    });

                    tempImg.src = src;
                });
            },

            // 加载成功处理
            handleSuccess(img, tempImg) {
                img.removeAttribute('loading');
                // 提前计算宽高比，减少布局抖动
                const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;
                img.parentElement.style.setProperty('--aspect-ratio', aspectRatio);
                // 异步设置src，避免阻塞主线程
                requestAnimationFrame(() => {
                    img.src = tempImg.src;
                    img.setAttribute('loaded', '');
                    viewerManager.update();
                });
            },

            // 加载失败处理（严谨的重试逻辑）
            async handleError(img, attempt) {
                img.removeAttribute('loading');
                // 达到最大重试次数
                if (attempt >= CONFIG.retry.maxAttempts) {
                    img.classList.add('error');
                    img.alt = '图片加载失败';
                    viewerManager.update();
                    return;
                }

                // 记录当前重试次数
                img.dataset.retryAttempt = attempt + 1;
                // 计算退避时间（指数退避）
                const delay = CONFIG.retry.initialDelay * Math.pow(CONFIG.retry.backoff, attempt - 1);

                // 延迟重试
                await new Promise(resolve => setTimeout(resolve, delay));
                // 重试加载
                await this.loadImage(img);
            }
        };

        /* --- DOM 插入 --- */
        function appendImagesToDom(urls) {
            const gallery = document.querySelector('.gallery');
            const frag = document.createDocumentFragment();
            const imgs = [];

            urls.forEach(src => {
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.dataset.src = src;
                li.appendChild(img);
                frag.appendChild(li);
                imgs.push(img);
            });

            gallery.appendChild(frag);
            imageLoader.loadImagesInOrder(imgs);
        }

        /* --- 解析相对链接 --- */
        function resolveNextUrl(href, pageUrl) {
            if (!href || typeof href !== 'string') return null;

            const trimmed = href.trim();
            if (!trimmed) return null;

            // pageUrl 必须是 http(s)
            if (!/^https?:\/\//i.test(pageUrl)) return null;

            try {
                const url = new URL(trimmed, pageUrl).href;
                if (url === pageUrl) return null; // 防止自循环
                return url;
            } catch (e) {
                console.warn('URL resolve failed:', trimmed, pageUrl);
                return null;
            }
        }

        /* --- 页面解析 --- */
        function parsePage(htmlText, baseUrl) {
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
            const images = [...doc.querySelectorAll(CONFIG.imageSelector)].map(i => i.src);

            let nextUrl = null;
            const next = doc.querySelector(CONFIG.nextPageSelector);
            if (next?.getAttribute('href')) {
                nextUrl = resolveNextUrl(next.getAttribute('href'), baseUrl);
            }

            return { images, nextUrl };
        }

        /* --- 页面入队通知 --- */
        function notifyPageEnqueued() {
            if (pendingPageResolve) {
                pendingPageResolve();
                pendingPageResolve = null;
            }
        }

        /* --- 页面请求 --- */
        async function fetchPage(url) {
            if (visitedPages.has(url)) return null;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('HTTP error! status: ' + res.status);
                visitedPages.add(url);
                return res.text();
            } catch (e) {
                throw new Error('页面加载失败: ' + e.message);
            }
        }

        /* --- 单页加载 --- */
        async function loadSinglePage() {
            const url = pageQueue.shift();
            if (!url) return;

            const html = await fetchPage(url);
            if (!html) return;

            const { images, nextUrl } = parsePage(html, url);
            appendImagesToDom(images);
            if (nextUrl && !visitedPages.has(nextUrl)) {
                pageQueue.push(nextUrl);
                notifyPageEnqueued();
            } else {
                noMorePages = true;
            }
        }

        /* --- 调度器 --- */
        async function consumePages() {
            if (isLoading || loadFailed) return;
            isLoading = true;

            try {
                let count = 0;
                while (!noMorePages || pageQueue.length > 0) {
                    // 队列暂时为空，等待 loadSinglePage 解析出 nextUrl
                    if (pageQueue.length === 0) {
                        await new Promise(resolve => {
                            if (!pendingPageResolve) {
                                pendingPageResolve = () => {
                                    resolve();
                                    pendingPageResolve = null;
                                };
                            }
                        });
                        continue;
                    }

                    await loadSinglePage();
                    count++;

                    // lazy 模式：达到批次上限就暂停，等待下一次触发
                    if (CONFIG.lazy && count >= CONFIG.batchSize) {
                        break;
                    }
                }
                // 更新加载状态
                if (noMorePages && pageQueue.length === 0) {
                    document.getElementById('load-status').textContent = '已加载全部图片';
                    pageObserver?.disconnect();
                } else {
                    document.getElementById('load-status').textContent = '加载中...';
                }
            } catch (e) {
                console.error(e);
                loadFailed = true;

                if (pendingPageResolve) {
                    pendingPageResolve();
                    pendingPageResolve = null;
                }

                const loadStatus = document.querySelector('#load-status');
                if (loadStatus) {
                    loadStatus.innerHTML = '<span id="retry-load" style="color:red; cursor:pointer; text-decoration:underline;">加载失败，点击重试</span>';
                    const retryBtn = document.getElementById('retry-load');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', () => {
                            loadFailed = false;
                            noMorePages = pageQueue.length === 0 ? false : noMorePages;

                            if (pendingPageResolve) {
                                pendingPageResolve();
                                pendingPageResolve = null;
                            }

                            loadStatus.textContent = '重新加载中...';
                            consumePages();
                        }, { once: true });
                    }
                }

            } finally {
                isLoading = false;
            }
        }

        /* --- 初始化 --- */
        document.addEventListener('DOMContentLoaded', async () => {
            if (CONFIG.viewer) viewerManager.init();

            if (${!!html}) {
                appendImagesToDom(${JSON.stringify(FIRST_PAGE_IMG)});
                let nextUrl = resolveNextUrl(${JSON.stringify(SECOND_PAGE_URL)}, ${JSON.stringify(host)});
                if (nextUrl) pageQueue.push(nextUrl);
                else noMorePages = true;
            } else {
                pageQueue.push(${JSON.stringify(firstPageUrl)});
            }

            if (CONFIG.lazy) {
                const sentinel = document.createElement('div');
                document.body.appendChild(sentinel);

                pageObserver = new IntersectionObserver(
                    e => e[0].isIntersecting && consumePages(),
                    CONFIG.observer
                );
                pageObserver.observe(sentinel);
            }

            consumePages();
            
        });
        window.addEventListener('resize', () => viewerManager.update());
        window.addEventListener('beforeunload', () => viewerManager.destroy());
    </script>
</body>
</html>`;
}