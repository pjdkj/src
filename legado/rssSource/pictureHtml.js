/*
适用于原网页图片不分页的情况
imgSrc(String)阅读获取的图片src,多张图片默认以换行符分隔

调用示例:
class.list-gallery@img@src
<js>
danyeHtml(result);
</js>
*/
function danyeHtml(imgSrc) {
    if (typeof imgSrc !== 'string' || imgSrc.trim() === '') {
        throw new Error('参数必须是非空字符串');
    }

    const list = imgSrc.split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

    if (list.length === 0) {
        throw new Error('图片列表为空');
    }

    const imgArr = list.reduce((acc, url) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            acc.push(`<li><img data-src="${url}" alt="图片"></li>`);
        }
        return acc;
    }, []);

    let imgTags = '\n' + imgArr.join('\n') + '\n';

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>图片</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.css">
    <style>
        :root {
            --item-width: 97vw;
            --aspect-ratio: 65/100;
        }

        body {
            margin: 0;
            padding: 20px 0;
            background-color: floralwhite;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
        }

        .gallery {
            list-style: none;
            padding: 0;
            margin: 0 auto;
            width: calc(var(--item-width) - 30px);
            max-width: 400px;
        }

            .gallery li {
                width: 100%;
                margin-bottom: 15px;
                background: floralwhite;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                height: 0;
                padding-top: calc(100% / (var(--aspect-ratio, 3/4)));
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                /* 预加载占位，减少闪烁 */
                background: #f8f9fa;
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
    </style>
</head>
<body>
    <ul class="gallery">
        ${imgTags}
    </ul>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.js"></script>
    <script>
        const CONFIG = {
            retry: {
                maxAttempts: 3,
                initialDelay: 1000,
                backoff: 2
            },
            viewer: {
                toolbar: {
                    zoomIn: 1,
                    zoomOut: 1,
                    oneToOne: 1,
                    reset: 1
                },
                transition: false,
                navbar: false,
                title: false
            },
            // 并发控制配置
            load: {
                concurrency: 3, // 同时加载的图片数量
                batchDelay: 300 // 批次加载延迟（ms）
            }
        };

        // Viewer实例管理 - 优化更新频率
        const viewerManager = {
            instance: null,
            updateTimer: null,
            init() {
                if (this.instance) return;
                this.instance = new Viewer(document.querySelector('.gallery'), {
                    ...CONFIG.viewer,
                    url: 'data-src'
                });
            },
            // 防抖更新，减少DOM操作
            update() {
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

        // 图片加载控制 - 核心优化
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

                // 移除时间戳，利用浏览器缓存
                const src = img.dataset.src;
                const tempImg = new Image();

                tempImg.onload = () => {
                    // 提前计算宽高比，减少布局闪烁
                    const aspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;
                    if (aspectRatio > 1) {
                        img.parentElement.style.setProperty('--aspect-ratio', 4/3);
                    }

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

                // 优化：添加超时处理
                tempImg.timeoutId = setTimeout(() => {
                    tempImg.onerror();
                }, 10000); // 10秒超时

                tempImg.src = src;
            },

            // 错误处理（修复重试计数）
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
            viewerManager.init();
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
 适用于原网页图片分多页加载
 params是一个对象，必须包含：
    - totalPage: string  //总页数
    - baseUrl: string  //基础URL，用于拼接下一页URL
    - pageUrlTemplate: string  //下一页URL模板，必须包含{baseUrl}和{page}占位符
    - imageSelector: string  //img标签选择器CSS，用于从页面中提取图片的img标签
 */
function duoyeHtml(params) {
    // 参数校验
    if (typeof params !== 'object' || params === null) {
        throw new Error('参数必须是一个对象');
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>图片</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.css">
    <style>
        :root {
            --item-width: 97vw;
            --aspect-ratio: 65/100;
        }

        body {
            margin: 0;
            padding: 20px 0;
            background-color: floralwhite;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            min-height: 100vh;
        }

        .gallery {
            list-style: none;
            padding: 0;
            margin: 0 auto;
            width: calc(var(--item-width) - 30px);
            max-width: 400px;
        }

            .gallery li {
                width: 100%;
                margin-bottom: 15px;
                background: floralwhite;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
                height: 0;
                padding-top: calc(100% / (var(--aspect-ratio, 3/4)));
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
    </style>
</head>
<body>
    <ul class="gallery"></ul>
    <div id="load-status"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.0/viewer.min.js"></script>
    <script>
        const CONFIG = {
            totalPage: ${params.totalPage},
            baseUrl: "${params.baseUrl}",
            pageUrlTemplate: "${params.pageUrlTemplate}",
            imageSelector: "${params.imageSelector}",
            errorText: "加载失败",
            endText: "已加载全部内容",
            loadPages: 2,
            retry: { maxAttempts: 3, initialDelay: 1000, backoff: 2 },
            viewer: { toolbar: { zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1 }, transition: false, navbar: false, title: false },
            selectors: { gallery: '.gallery', loadStatus: '#load-status', sentinel: '#load-sentinel' },
            observer: { rootMargin: '800px', threshold: 0.01 },
            imageLoad: {
                batchSize: 3, // 每批加载3张
                viewportFirst: true, // 首屏图片优先加载
                cache: true // 启用图片缓存
            }
        };

        let page = 1;
        let isLoading = false;
        let loadFailed = false;
        let pageObserver = null;
        const imageAbortControllers = new Map();

        // --- 1. Viewer.js 管理 ---
        const viewerManager = {
            instance: null,
            updateTimer: null,
            init() {
                if (this.instance) return;
                this.instance = new Viewer(document.querySelector(CONFIG.selectors.gallery), {
                    ...CONFIG.viewer,
                    url: 'data-src'
                });
            },
            // 防抖更新Viewer，减少重绘
            update() {
                clearTimeout(this.updateTimer);
                this.updateTimer = setTimeout(() => {
                    this.instance?.update();
                }, 100);
            },
            destroy() {
                clearTimeout(this.updateTimer);
                this.instance?.destroy();
                // 中断所有未完成的图片请求
                imageAbortControllers.forEach(controller => controller.abort());
                imageAbortControllers.clear();
            }
        };

        // --- 2. 图片加载逻辑 ---
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
                        this.handleSuccess(img, tempImg);
                        imageAbortControllers.delete(img);
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
                if (aspectRatio > 1) {
                    img.parentElement.style.setProperty('--aspect-ratio', '4 / 3');
                }
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

        // --- 3. 页面级无限滚动触发 ---
        function initPagination() {
            const sentinel = document.createElement('div');
            sentinel.id = CONFIG.selectors.sentinel.slice(1);
            document.querySelector(CONFIG.selectors.gallery).after(sentinel);

            pageObserver = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && !isLoading && !loadFailed) {
                    loadMorePages();
                }
            }, CONFIG.observer);
            pageObserver.observe(sentinel);
        }

        // --- 4. 页面数据请求 ---
        async function fetchPage(p) {
            try {
                const url = CONFIG.pageUrlTemplate.replace("{baseUrl}", CONFIG.baseUrl).replace("{page}", p);
                const response = await fetch(url);
                if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
                const text = await response.text();
                const doc = new DOMParser().parseFromString(text, 'text/html');
                return Array.from(doc.querySelectorAll(CONFIG.imageSelector)).map(img => img.src);
            } catch (error) {
                throw new Error('第' + p + '页加载失败: ' + error.message);
            }
        }

        // --- 5. 图片DOM插入 + 优化加载 ---
        function appendImagesToDOM(imageUrls) {
            const fragment = document.createDocumentFragment();
            const gallery = document.querySelector(CONFIG.selectors.gallery);
            const newImgs = [];

            imageUrls.forEach(src => {
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.dataset.src = src;
                img.alt = '写真';
                li.appendChild(img);
                fragment.appendChild(li);
                newImgs.push(img);
            });

            gallery.appendChild(fragment);
            // 启动顺序加载
            imageLoader.loadImagesInOrder(newImgs);
            viewerManager.update();
        }

        // --- 6. 加载下一页数据 ---
        async function loadMorePages() {
            if (page > CONFIG.totalPage) {
                document.querySelector(CONFIG.selectors.loadStatus).textContent = CONFIG.endText;
                pageObserver?.disconnect();
                return;
            }

            isLoading = true;
            document.querySelector(CONFIG.selectors.loadStatus).textContent = '加载中...';

            try {
                const promises = [];
                for (let i = 0; i < CONFIG.loadPages && (page + i) <= CONFIG.totalPage; i++) {
                    promises.push(fetchPage(page + i));
                }

                const results = await Promise.all(promises);
                const allNewImages = results.flat();

                if (allNewImages.length > 0) {
                    appendImagesToDOM(allNewImages);
                    page += CONFIG.loadPages;
                } else {
                    throw new Error("未获取到新图片");
                }

                if (page > CONFIG.totalPage) {
                    document.querySelector(CONFIG.selectors.loadStatus).textContent = CONFIG.endText;
                    pageObserver?.disconnect();
                }

            } catch (error) {
                console.error(error);
                document.querySelector(CONFIG.selectors.loadStatus).innerHTML = '< span style = "color:red" >' + CONFIG.errorText + '</span >';
                loadFailed = true;
            } finally {
                isLoading = false;
            }
        }

        // --- 初始化 ---
        document.addEventListener('DOMContentLoaded', () => {
            viewerManager.init();
            initPagination();
            loadMorePages();
        });

        window.addEventListener('resize', () => viewerManager.update());
        window.addEventListener('beforeunload', () => viewerManager.destroy());
    </script>
</body>
</html>`;
}