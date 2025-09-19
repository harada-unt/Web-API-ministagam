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
                createComment();
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

    // TODO: コメント削除ボタンの追加


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
                commentsContainer.innerHTML = '<p>コメントがありません。</p>';
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
                    </div>                  
                    <div class="card-body">
                        <p class="card-text">${comment.content}</p>
                    </div>
                </div>
                `;
                commentsContainer.appendChild(commentElement);
            })
        } catch (error) {
            // TODO: エラーメッセージの表示
            console.error('コメントの取得に失敗しました:', error);

            // test
            const commentsContainer = document.getElementById('commentsContainer');
            commentsContainer.innerHTML = '<p>コメントがありません。</p>';
        }
    }


    // コメントを投稿する
    // TODO: postIdはモーダルを開いたときに設定されたdata属性から取得する
    async function createComment() {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            const postId = document.getElementById('createCommentBtn').dataset.postId;
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