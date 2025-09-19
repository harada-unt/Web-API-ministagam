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

            // コンテナが存在しない場合の安全対策   
            if (!postsContainer) {
                console.error('postsContainerが見つかりません');
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
            console.error('投稿の取得に失敗しました:', error);
            alert('投稿の取得に失敗しました。');
        }
    }

    bindEventListeners();
})