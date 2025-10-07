document.addEventListener('DOMContentLoaded', function() {

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

        // コメント削除ボタン
        const deleteCommentBtn = document.getElementById('deleteCommentBtn');
        if (deleteCommentBtn) {
            deleteCommentBtn.addEventListener('click', function() {
                deleteComment();
            })
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
            const url = `http://localhost:80/api/v1/posts/${post_id}/comments`;
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


                commentElement.querySelector(`#commentDeleteBtn${comment.id}`).addEventListener('click', function() {
                    deleteComment(comment.post_id, comment.id);
                });

                // コメントのユーザーIDと認証済みユーザーIDが一致する場合、削除ボタンを表示する
                displayDeleteBtn(comment.user_id, comment.id);
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
        const token = localStorage.getItem('authToken');
        
        if (token) {
            const content = document.getElementById('commentContent').value;

            try {
                const url = `http://localhost:80/api/v1/posts/${postId}/comments`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
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
                    alert(`コメントの投稿に失敗しました: ${errorData.message}`);
                }
            } catch (error) {
                console.error('サーバーエラーが発生しました。:', error);
                alert('コメントに失敗しました。');
                
            }
        }
    }

    // コメントのユーザーIDと認証済みユーザーIDが一致する場合、削除ボタンを表示する
    async function displayDeleteBtn(commentUserId, commentId) {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const url = 'http://localhost:80/api/v1/auth/user';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    const authUser = user.data.user.id;
                    console.log(authUser, commentUserId);
                    if (authUser === commentUserId) {
                        const commentDeleteBtn = document.getElementById(`commentDeleteBtn${commentId}`);
                        if (commentDeleteBtn) {
                            commentDeleteBtn.classList.remove('d-none');
                            commentDeleteBtn.dataset.postId = commentUserId; // 投稿IDをデータ属性に設定
                        }
                    }
                } else {
                    console.log('認証ユーザーの取得に失敗しました。');
                }
            } catch (error) {
                console.error('認証ユーザーの取得に失敗しました:', error);
            }
        }
    }


    // コメントを削除する
    async function deleteComment(post_id, comment_id) {
        alert('このコメントを削除しますか？');
        if (true) {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const url = `http://localhost:80/api/v1/posts/${post_id}/comments/${comment_id}`;
                    const response = await fetch(url, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
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
    

    bindEventListeners();

});