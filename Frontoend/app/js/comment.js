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
                const postId = createCommentBtn.dataset.postId;
                createComment(postId);
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
        const commentCount = document.getElementById('commentCount');
        if (commentCount) {
            commentCount.addEventListener('click', function() {
                const postId = commentCount.dataset.postId;
                getComments(postId);
            })
        }
    }


    // コメント一覧を取得し表示する
    async function getComments(postId) {
        try {
            const url = `http://localhost:8000/api/v1/posts/${postId}/comments`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`レスポンスステータス: ${response.status}`);
            }
            const comments = await response.json();
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML = ''; // 既存のコメントをクリア
            
            // コンテナが存在しない場合の安全対策   
            if (!commentsContainer) {
                console.error('commentsContainerが見つかりません');
                return;
            }

            // コメントデータが存在しない場合の処理
            if (comments.length === 0) {
                commentsContainer.innerHTML = `
                    <div class="text-center py-5" id="nocommentsMessage">
                        <i class="bi bi-chat display-1 text-muted"></i>
                        <h4 class="text-muted mt-3">まだコメントがありません</h4>
                        <p class="text-muted">コメントデータをがありません</p>
                    </div>
                `;
                return;
            }

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment-card border-bottom mb-3');
                commentElement.innerHTML = `
                    <div class="comment-card border-bottom mb-3">
                        <div class="card-header d-flex">
                            <div class="me-auto p-2">${comment.user.name}</div>
                            <div class="p-2">${comment.created_at}</div>
                            <button type="button" id="deleteCommentBtn" class="btn btn-danger d-none" data-comment-id="${comment.id}" data-post-id${comment.post.id}>
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>                  
                        <div class="card-body">
                            <p class="card-text">${comment.content}</p>
                        </div>
                    </div>

                    <form id="commentForm" class="d-none">
                        <div class="mb-3">
                            <textarea class="form-control" id="commentContent" rows="3" placeholder="コメントする" maxlength="100" required></textarea>
                        </div>
                        <div class="modal-footer">    
                            <button type="button" class="btn btn-secondary d-flex justify-content-end" data-bs-dismiss="modal">キャンセル</button>
                            <button type="button" id="createCommentBtn" class="btn btn-primary d-flex justify-content-end" data-post-id="${comment.post.id}>コメント</button>
                        </div>
                    </form>
                `;


                // 認証済みユーザーの場合のみ、コメント投稿フォームを表示する
                displayCommentForm();


                // コメントのユーザーIDと認証済みユーザーIDが一致する場合、削除ボタンを表示する
                displayDeleteBtn(comment.user.id);
                commentsContainer.appendChild(commentElement);
            })
        } catch (error) {
            // エラーメッセージの表示
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
                const url = `http://localhost:8000/api/v1/posts/${postId}/comments`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ content })
                });

                if (response.ok) {
                    // コメント投稿成功時の処理
                    alert('コメントの投稿が完了しました。');
                    // コメント一覧を再取得して表示
                    getComments(postId);
                    // 入力フォームをクリア
                    document.getElementById('commentContent').value = '';                
                } else {
                    const errorData = await response.json();
                    alert(`コメントの投稿に失敗しました: ${errorData.message}`);
                }
            } catch (error) {
                console.error('コメントの投稿に失敗しました:', error);
                alert('コメントの投稿に失敗しました。');
                
            }
        }
    }


    // 認証済みユーザーの場合のみ、コメント投稿フォームを表示する
    async function displayCommentForm() {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const url = 'http://localhost:8000/api/v1/auth/user';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const commentForm = document.getElementById('commentForm');
                    if (commentForm) {
                        commentForm.classList.remove('d-none');
                    }
                } else {
                    console.log('認証トークンが一致しません。');
                }
            } catch (error) {
                console.error('認証ユーザーの取得に失敗しました:', error);
            }
        }
    }


    // コメントのユーザーIDと認証済みユーザーIDが一致する場合、削除ボタンを表示する
    async function displayDeleteBtn(commentUserId) {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const url = 'http://localhost:8000/api/v1/auth/user';
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const authUser = await response.json();
                    if (authUser.id === commentUserId) {
                        const deleteCommentBtn = document.getElementById('deleteCommentBtn');
                        if (deleteCommentBtn) {
                            deleteCommentBtn.classList.remove('d-none');
                            deleteCommentBtn.dataset.postId = commentUserId; // 投稿IDをデータ属性に設定
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
    async function deleteComment() {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            const postId = document.getElementById('deleteCommentBtn').dataset.postId;
            const commentId = document.getElementById('deleteCommentBtn').dataset.commentId;

            try {
                const url = `http://localhost:8000/api/v1/posts/${postId}/comments/${commentId}`;
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // コメント削除成功時の処理
                    alert('コメントの削除が完了しました。');
                    // コメント一覧を再取得して表示
                    getComments(postId);             
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
    

    bindEventListeners();

});