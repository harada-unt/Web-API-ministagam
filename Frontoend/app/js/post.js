document.addEventListener('DOMContentLoaded', function() {

    function bindEventListeners() {
        // 投稿関連のイベント
        bindPostEvents();
    }

    function bindPostEvents() {
        const createPostBtn = document.getElementById('createPostBtn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', function() {
                // 投稿作成APIを呼び出す
                createPost();
            });
        }

        const deletePostBtn = document.getElementById('deletePostBtn');
        if (deletePostBtn) {
            deletePostBtn.addEventListener('click', function() {
                // 投稿削除APIを呼び出す
                deletePost();
            });
        }
    }

    // TODO: 投稿削除ボタン: 自分がログインしているならトークンから認証済みユーザーを特定し、認証済みuserIDと投稿のuserIDが一致した場合のみボタンを表示する


    // 投稿を取得し表示する
    async function getPosts() {
        try {
            const url = 'http://localhost:8000/api/v1/posts';
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`レスポンスステータス: ${response.status}`);
            }
            
            const posts = await response.json();
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = ''; // 既存の投稿をクリア

            // コンテナが存在しない場合の安全対策
            if (!postsContainer) {
                console.error('postContentが見つかりません');
                return;
            }

            // 投稿データが存在しない場合の処理
            if (posts.length === 0) {
                postsContainer.innerHTML = '<p>投稿がありません。</p>';
                return;
            }

            posts.forEach(post => { 
                const postElement = document.createElement('div');
                postElement.classList.add('post-card');
                postElement.style.width = '35rem;';
                postElement.innerHTML = `
                <div class="post-card" style="width: 35rem;">
                    <div class="card-header d-flex">
                        <div class="me-auto p-2"><a id="userName" data-user-id="${post.user.id}">${post.user.name}</a></div>
                        <div class="p-2">${post.created_at}</div>
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
            // TODO: エラーメッセージの表示
            console.error('投稿の取得に失敗しました:', error);

            // test
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = '<p>投稿データを読み込めませんでした</p>';
            return;
        }
    }


    // 投稿データの登録
    async function createPost() {
        const token = localStorage.getItem('authToken');

        if (token) {
            const content = document.getElementById('postContent').value;
            const imageFile = document.getElementById('postImage').files[0];

            // TODO: バリデーション

            const formData = new FormData();
            formData.append('content', content);
            formData.append('image', imageFile);


            try {
                const url = 'http://localhost:8000/api/v1/posts';
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    // 投稿成功時の処理
                    alert('投稿が成功しました。');
                    // フォームのリセット
                    document.getElementById('postContent').value = '';
                    document.getElementById('postImage').value = '';
                    // 投稿一覧の更新
                    document.getElementById('postsContainer').innerHTML = '';
                    getPosts();
                } else {
                    const errorData = await response.json();
                    alert(`投稿に失敗しました: ${errorData.message}`);
                }
            } catch (error) {
                console.error('投稿の作成に失敗しました:', error);
                alert('投稿の作成に失敗しました。');
            }
        }
    }


    // 投稿データの削除
    async function deletePost() {
        const token = localStorage.getItem('authToken');
        if (token) {
            const postId = document.getElementById('deletePostBtn').dataset.postId;

            try {
                const url = `http://localhost:8000/api/v1/posts/${postId}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // 投稿削除成功時の処理
                    alert('投稿の削除が完了しました。');
                    // 投稿一覧の更新
                    document.getElementById('postsContainer').innerHTML = '';
                    getPosts();
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
        
    bindEventListeners();
    getPosts();
    checkAuthStatus();
});