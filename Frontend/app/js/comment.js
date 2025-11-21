document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://localhost';
    let authUser = null;

    function bindEventListeners() {
        // コメント関連のイベント
        bindCommentEvents();
    }

    function bindCommentEvents() {
        // コメント投稿ボタン
        const createCommentBtn = document.getElementById('createCommentBtn');
        if (createCommentBtn) {
            createCommentBtn.addEventListener('click', function() {
                const modal = document.getElementById('commentModal');
                const post_id = modal ? modal.dataset.currentPostId : null;
                if (post_id) {
                    createComment(post_id);
                } else {
                    alert('投稿IDが取得できません。');
                }
            });
        }

        // コメント件数をクリックするとコメント一覧取得
        document.addEventListener('click', function(e) {
            const link = e.target.closest('.comment-link');
            
            if (link) {
                const post_id = link.dataset.postId;
                
                // モーダルに投稿IDを保存
                const modal = document.getElementById('commentModal');
                if (modal) {
                    modal.dataset.currentPostId = post_id;
                }
                
                // コメント一覧を取得
                getComments(post_id);
            }
        });
    };

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

    // Cookieから特定の値を取得する関数
    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // コメント一覧を取得し表示する
    async function getComments(post_id) {

        // 日付フォーマット関数
        function formatDate(dateString) {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
    
             return `${year}/${month}/${day}`;
        }

        try {
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            const url = `${baseUrl}/api/v1/posts/${post_id}/comments`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`レスポンスステータス: ${response.status}`);
            }

            const comments = await response.json();
            const commentsData = comments.data;
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML = ''; // 既存のコメントをクリア
            
            // コンテナが存在しない場合の安全対策
            if (!commentsContainer) {
                console.error('commentsContainerが見つかりません');
                return;
            }

            // コメントデータが存在しない場合の処理
            if (commentsData.length === 0) {
                commentsContainer.innerHTML = `
                    <div class="text-center py-5" id="nocommentsMessage">
                        <i class="bi bi-chat display-1 text-muted"></i>
                        <h4 class="text-muted mt-3">まだコメントがありません</h4>
                        <p class="text-muted">コメントデータをがありません</p>
                    </div>
                `;
                return;
            }

            commentsData.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add("comment-card", "border-bottom", "mb-3");
                commentElement.innerHTML = `
                    <div class="comment-card border-bottom mb-3">
                        <div class="card-header d-flex">
                            <div class="me-auto p-2">${comment.user.name}</div>
                            <div class="p-2">${formatDate(comment.created_at)}</div>
                            <button type="button" id="commentDeleteBtn${comment.id}" class="btn btn-danger d-none">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>                  
                        <div class="card-body">
                            <p class="card-text">${comment.content}</p>
                        </div>
                    </div>
                `;

                if (authUser && authUser.id === comment.user_id) {
                    commentElement.querySelector(`#commentDeleteBtn${comment.id}`).classList.remove('d-none');

                }
                commentElement.querySelector(`#commentDeleteBtn${comment.id}`).addEventListener('click', function() {
                    deleteComment(comment.post_id, comment.id);
                });

                commentsContainer.appendChild(commentElement);
            });

        } catch (error) {
            // エラーメッセージの表示
            console.error('コメントの取得に失敗しました:', error);
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML =  `
                <div class="text-center py-5" id="nocommentsMessage">
                    <i class="bi bi-chat display-1 text-muted"></i>
                    <h4 class="text-muted mt-3">まだコメントがありません</h4>
                    <p class="text-muted">コメントデータをがありません</p>
                </div>
            `;
        }
    }


    // コメントを投稿する
    async function createComment(postId) {
        const xsrfToken = getCookieValue('XSRF-TOKEN');
        
        if (xsrfToken) {
            const content = document.getElementById('commentContent').value;

            try {
                const url = `${baseUrl}/api/v1/posts/${postId}/comments`;
                const response = await fetch(url, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                    },
                    body: JSON.stringify({ content })
                });

                if (response.ok) {
                    // コメント投稿成功時の処理
                    alert('コメントの投稿が完了しました。');
                    window.location.reload();

                    // 入力フォームをクリア
                    document.getElementById('commentContent').value = '';                
                } else {
                    const errorData = await response.json();

                    if (errorData.errors) {
                        document.getElementById('commentContentError').textContent = errorData.errors.content;
                    }
                }
            } catch (error) {
                console.error('サーバーエラーが発生しました。:', error);
                alert('コメントに失敗しました。');
                
            }
        }
    }


    // コメントを削除する
    async function deleteComment(post_id, comment_id) {
        if (confirm('このコメントを削除しますか？')) {
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            if (xsrfToken) {
                try {
                    const url = `${baseUrl}/api/v1/posts/${post_id}/comments/${comment_id}`;
                    const response = await fetch(url, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                        }
                    });

                    if (response.ok) {
                        // コメント削除成功時の処理
                        alert('コメントの削除が完了しました。');
                        window.location.reload();           
                    } else {
                        const errorData = await response.json();
                        alert(`コメントの削除に失敗しました: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('コメントの削除に失敗しました:', error);
                    alert('コメントの削除に失敗しました。');
                }
            }
        }
    }
    authUser = await fetchAuthUser();

    bindEventListeners();
});