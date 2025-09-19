document.addEventListener('DOMContentLoaded', function() {
    console.log('アプリケーション開始');

    function bindEventListeners() {
        // ヘッダーボタン
        bindHeaderEvents();
    
        // フッターボタン
        bindFooterEvents();
    }
    
    
    /**
     * ヘッダーのイベント
     */
    function bindHeaderEvents() {
        // ログインボタン
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                window.location.href = 'login.html';
            });
        }
    
        // 新規登録ボタン
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                window.location.href = 'register.html';
            });
        }
    
        // プロフィール編集ボタン
        const changeProfileBtn = document.getElementById('changeProfileBtn');
        if (changeProfileBtn) {
            changeProfileBtn.addEventListener('click', function() {
                window.location.href = 'change-profile.html';
            });
        }
    }
    

    /**
     * フッターのイベント
     */
    function bindFooterEvents() {
        // ホームボタン
        const homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            homeBtn.addEventListener('click', function() {
                window.location.href = 'index.html';
            });
        }
    
        // プロフィールボタン
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
    }
    
    
    /**
     * 認証状態の確認
     */
    async function checkAuthStatus() {
        // 認証トークンの取得
        const token = localStorage.getItem('authToken');
    
        if (token) {    
            try {
                const url = 'http://localhost:8000/api/v1/auth/user';
                const response = await fetch(url);
                if (response.ok) {
                    const user = await response.json();
                    // 認証状態のUI表示
                    showAuthenticatedUI(user);
                } else {
                    console.log('未認証ユーザー');
                    // 非認証状態のUI表示
                    showUnauthenticatedUI();
                }
            } catch (error) {
                console.error('認証状態の確認に失敗しました。', error);
                // 非認証状態のUI表示
                showUnauthenticatedUI();
            }
        } else {
            console.log('トークンが存在しません。未認証ユーザーとして扱います。');
            // 非認証状態のUI表示
            showUnauthenticatedUI();
        }
    }
    
    /**
     * 認証状態のUI表示
     */
    function showAuthenticatedUI(user) {
        // ヘッダーの表示切替
        document.getElementById('authButtons').classList.add('d-none');
        // ユーザー名を表示
        document.getElementById('userNameDisplay').textContent = user.username;
    
        // フッターの表示切替
        document.getElementById('postBtn').classList.remove('d-none');
        document.getElementById('profileBtn').classList.remove('d-none');
    
        // コメントモーダルの入力フォームを表示
        document.getElementById('commentForm').classList.remove('d-none')
    }
    
    /**
     * 非認証状態のUI表示
     */
    function showUnauthenticatedUI() {
        // ヘッダーの表示切替
        document.getElementById('authButtons').classList.remove('d-none');
    
        // test
        // document.getElementById('authButtons').classList.add('d-none');
        // document.getElementById('userNameDisplay').textContent = "user.username";
    
        // フッターのボタンを非表示
        // document.getElementById('postBtn').classList.add('d-none');
        // document.getElementById('profileBtn').classList.add('d-none');
    
        // コメントモーダルの入力フォームを非表示
        document.getElementById('commentForm').classList.add('d-none')
    }

    bindEventListeners();
    checkAuthStatus();
    
});

