document.addEventListener('DOMContentLoaded', function() {
    // ユーザーの投稿を取得し表示する

    // 投稿のユーザーネームをクリックすると、そのユーザーのプロフィールページに遷移する
    function bindEventListeners() {
        const userName = document.getElementById('userName');
        if (userName) {
            userName.addEventListener('click', function() {
                const userId = userName.dataset.userId;
                window.location.href = `profile.html?userId=${userId}`;
                getUserPosts(userId);
            });
        }

        // プロフィールボタン
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                const userId = getUserId();

                if (!userId) {
                    window.location.href = `profile.html?userId=${userId}`;
                    getUserPosts(userId);
                } else {
                    alert('ログインが必要です。');
                    window.location.href = 'login.html';
                }
            })
        }
    }


    async function getUserPosts(userId) {
        try {
            const url = `http://localhost:8000/api/v1/users/${userId}/posts`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`レスポンスステータス: ${response.status}`);
            }

            const posts = await response.json();
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = ''; // 既存の投稿をクリア

            // 投稿データが存在しない場合の処理
            if (posts.length === 0) {
                postsContainer.innerHTML = `
                    <div class="text-center py-5" id="noPostsMessage">
                        <i class="bi bi-camera display-1 text-muted"></i>
                        <h4 class="text-muted mt-3">まだ投稿がありません</h4>
                        <p class="text-muted">投稿データをがありません</p>
                    </div>
                `;
                return;
            }

            posts.forEach(post => { 
                const postElement = document.createElement('div');
                postElement.classList.add('post-card');
                postElement.style.width = '35rem;';
                postElement.innerHTML = `
                <div class="post-card" style="width: 35rem;">
                    <div class="card-header d-flex">
                            <div class="me-auto p-2"><a id="userName" data-user-id="${post.user.id}">
                                ${post.user.name}
                            </a>
                        </div>
                        <div class="p-2">
                            ${post.created_at}
                        </div>
                    </div>

                    <img src="${post.image_path}" class="card-img-top" alt="投稿画像">

                    <div class="card-body">
                        <p class="card-text">${post.content}</p>
                    </div>
                    <div class="d-flex justify-content-end">
                        <a id="commentCount" class="card-link comment-link" data-bs-toggle="modal" data-bs-target="#commentModal" data-post-id="${post.id}">
                            コメント${post.comments_count}件
                        </a>
                    </div>
                </div>
                `;
                postsContainer.appendChild(postElement);
            });
        } catch (error) {
            // エラーメッセージの表示
            console.error('投稿の取得に失敗しました:', error);

            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = `
                <div class="text-center py-5" id="noPostsMessage">
                    <i class="bi bi-camera display-1 text-muted"></i>
                    <h4 class="text-muted mt-3">まだ投稿がありません</h4>
                    <p class="text-muted">投稿データを読み込めませんでした</p>
                </div>
            `;
            return;
        }
    }


    // 認証状態を確認してuserIdを取得
    async function getUserId() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const url = 'http://localhost:8000/api/v1/auth/user';
                const response = await fetch(url);
                if (response.ok) {
                    const user = await response.json();
                    return user.id;
                } else {
                    console.log('未認証ユーザー');
                    return null;
                }
            } catch (error) {
                console.error('ユーザー情報の取得に失敗しました:', error);
                return null;
            }
        } else {
            console.log('トークンが存在しません。未認証ユーザーとして扱います。');
            return null;
        }
    }

    bindEventListeners();
})