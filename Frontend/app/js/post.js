document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://127.0.0.1';
    let authUser = null; // 認証済みユーザー
    let currentPage = 1; // 現在のページ番号
    let isLoading = false; // ロード中フラグ
    let hasMorePosts = true; // 追加の投稿があるかどうかのフラグ
    let observer = null; // Intersection Observerのインスタンス

    function bindEventListeners() {
        // 投稿関連のイベント
        bindPostEvents();
    }

    function bindPostEvents() {
        const postForm = document.getElementById('postForm');
        if (postForm) {
            postForm.addEventListener('submit', function(e) {
                e.preventDefault(); // フォームのデフォルトの送信を防止
                createPost(e.target);
            });
        }
    }

    // Intersection Observer の設定
    function setupInfiniteScrollObserver() {
        // センチネル要素を作成（監視対象）
        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.height = '1px';
        
        const timeline = document.getElementById('timeline');
        if (timeline) {
            timeline.appendChild(sentinel);
        }

        // Intersection Observer のオプション
        const options = {
            root: null, // ビューポートを基準
            rootMargin: '200px', // 200px手前で発火
            threshold: 0.1 // 10%見えたら発火
        };

        // Observerを作成
        observer = new IntersectionObserver(callback, options);
        observer.observe(sentinel);
    }

    // Observerを停止
    function stopObserver() {
        if (observer) {
            observer.disconnect();
        }
    }

    // Observerを再開
    function restartObserver() {
        const sentinel = document.getElementById('scroll-sentinel');
        if (observer && sentinel) {
            observer.observe(sentinel);
        }
    }

    function callback(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMorePosts) {
                // センチネルが画面内に入った
                currentPage++;
                getPosts(currentPage, false);
            }
        });
    }
    
    // Cookieから特定の値を取得する関数
    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // 認証済みユーザーIDを取得
    async function fetchAuthUser() {
        try {
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            if (!xsrfToken) {
                return null;
            }

            const url = `${baseUrl}/api/v1/auth/user`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                },
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                return data.user;
            } else {
                return null;
            }
        } catch (error) {
            console.error('ユーザー情報の取得に失敗しました:', error);
            return null;
        }
    }

    // 投稿を取得し表示する
    async function getPosts(page = 1, clearExisting = true) {

        isLoading = true;
        if (clearExisting) {
            showLoadingIndicator();
        }

        // 日付フォーマット関数
        function formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
    
             return `${year}/${month}/${day}`;
            }

        try {
            const url = `${baseUrl}/api/v1/posts?page=${page}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`レスポンスステータス: ${response.status}`);
            }
            
            const posts = await response.json();
            const postsData = posts.data;
            const postsContainer = document.getElementById('timeline');

            if (clearExisting) {
                // 初回読み込み時は既存の投稿をクリア
                postsContainer.innerHTML = ''; 
            }

            // ページネーションの確認
            if (posts.current_page >= posts.pagination.last_page) {
                hasMorePosts = false;
                stopObserver(); // 監視を停止
                if (!clearExisting) {
                    console.log('これ以上投稿はありません');
                }
            }

            // 投稿データが存在しない場合の処理
            if (postsData.length === 0 && page === 1) {
                postsContainer.innerHTML = `
                    <div class="text-center vh-100 py-5" id="noPostsMessage">
                        <i class="bi bi-camera display-1 text-muted"></i>
                        <h4 class="text-muted mt-3">まだ投稿がありません</h4>
                        <p class="text-muted">投稿データをがありません</p>
                    </div>
                `;
                stopObserver(); // 監視を停止
                return;
            }

            const sentinel = document.getElementById('scroll-sentinel');
            postsData.forEach(post => { 
                const postElement = document.createElement('article');
                postElement.classList.add("d-flex", "justify-content-center");
                postElement.innerHTML = `
                <div class="post-card" style="width: 35rem;">
                    <div class="card-header d-flex">
                        <div class="me-auto p-2">
                            <a class="username-link" data-user-id="${post.user.id}">
                                ${post.user.name}
                            </a>
                        </div>
                        <div class="p-2">
                            ${formatDate(post.created_at)}
                        </div>
                        <button type="button" id="postDeleteBtn${post.id}" class="deletePostBtn btn btn-danger d-none">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>

                    <img src="${post.image_path}" class="card-img-top" alt="投稿画像">

                    <div class="card-body">
                        <p class="card-text">${post.content}</p>
                    </div>

                    <div class="d-flex justify-content-end">
                        <a class="card-link comment-link" data-bs-toggle="modal" data-bs-target="#commentModal" data-post-id="${post.id}">
                            コメント${post.comment_count}件
                        </a>
                    </div>
                </div>
                `;

                // センチネルの前に挿入
                if (sentinel) {
                    postsContainer.insertBefore(postElement, sentinel);
                } else {
                    postsContainer.appendChild(postElement);
                }

                // authUser が存在して、投稿者と一致したら削除ボタンを表示
                if (authUser && authUser.id === post.user.id) {
                    postElement.querySelector(`#postDeleteBtn${post.id}`).classList.remove('d-none');
                }
                postElement.querySelector(`#postDeleteBtn${post.id}`).addEventListener('click', function() {                
                    deletePost(post.id);
                });
            });

            // 初回読み込み時のみ、Intersection Observerを設定
            if(clearExisting && postsData.length > 0) {
                stopObserver(); // 既存の監視を停止
                setupInfiniteScrollObserver();
            }

        } catch (error) {
            // エラーメッセージの表示
            console.error('投稿の取得に失敗しました:', error);

            if (page === 1) {
                const postsContainer = document.getElementById('timeline');
                postsContainer.innerHTML = `
                    <div class="text-center vh-100 py-5" id="noPostsMessage">
                        <i class="bi bi-camera display-1 text-muted"></i>
                        <h4 class="text-muted mt-3">まだ投稿がありません</h4>
                        <p class="text-muted">投稿データを読み込めませんでした</p>
                    </div>
                `;
                stopObserver();
            } else {
                alert('投稿データの読み込みに失敗しました。');
            }
        } finally {
            isLoading = false;
            hideLoadingIndicator();
        }
    }

    // ローディング表示
    function showLoadingIndicator() {
        let loader = document.getElementById('loading-indicator');
        
        // ローディング要素が存在しない場合は作成
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-indicator';
            loader.className = 'vh-100 text-center py-4';
            loader.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">読み込み中...</span>
                </div>
                <p class="mt-2 text-muted">読み込み中...</p>
            `;
            
            // センチネルの前に挿入
            const sentinel = document.getElementById('scroll-sentinel');
            const container = document.getElementById('timeline');
            
            if (sentinel && container) {
                container.insertBefore(loader, sentinel);
            } else if (container) {
                container.appendChild(loader);
            }
        }
        
        loader.style.display = 'block';
    }

    function hideLoadingIndicator() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // 投稿データの登録
    async function createPost(form) {
        console.log('投稿作成処理開始');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const xsrfToken = getCookieValue('XSRF-TOKEN');

        if (xsrfToken) {
            // TODO: バリデーション

            try {
                const url = `${baseUrl}/api/v1/posts`;
                const response = await fetch(url, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                    },
                    body: formData
                });

                if (response.ok) {
                    // 投稿成功時の処理
                    alert('投稿が成功しました。');

                    // リダイレクトしmodalを閉じる
                    window.location.href = 'index.html';
                    const postModalEl = document.getElementById('postModal');
                    if (postModalEl) {
                        postModalEl.setAttribute('data-bs-toggle', 'modal');
                    }
                } else {
                    const errorData = await response.json();

                    if (errorData.errors) {
                        document.getElementById('postImageError').textContent = errorData.errors.image;
                        document.getElementById('postContentError').textContent = errorData.errors.content;
                    }
                }
            } catch (error) {
                console.error('投稿の作成に失敗しました:', error);
                alert('投稿の作成に失敗しました。');
            }
        }
    }


    // 投稿データの削除
    async function deletePost(post_id) {
        console.log('投稿削除処理開始');
        // 本当に削除するか確認
        if (confirm('この投稿を削除しますか？')) {
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            if (xsrfToken) {
                try {

                    const url = `${baseUrl}/api/v1/posts/${post_id}`;
                    const response = await fetch(url, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                        }
                    });

                    if (response.ok) {
                        // 投稿削除成功時の処理
                        alert('投稿の削除が完了しました。');
                        // 投稿一覧の更新
                        window.location.href = 'index.html';
                    } else {
                        const errorData = await response.json();
                        alert(`投稿の削除に失敗しました: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('投稿の削除に失敗しました:', error);
                    alert('投稿の削除に失敗しました。');
                }   
            }
        }
    }


    authUser = await fetchAuthUser();

    
    await getPosts(1, true);
    bindEventListeners();
});