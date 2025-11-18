document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://127.0.0.1';
    let authUser = null;

    function bindEventListeners() {
        // ヘッダーボタン
        bindHeaderEvents();
    
        // フッターボタン
        bindFooterEvents();
    }

    // Cookieから特定の値を取得する関数
    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

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
                handleProfileClick();
            });
        }
        async function handleProfileClick() {
            const user_id = authUser ? authUser.id : null;
            
            if (user_id) {
                localStorage.setItem('user_id', user_id);
                window.location.href = 'profile.html';
            } else {
                alert('ログインが必要です。');
                window.location.href = 'login.html';
            }
        }

        // ユーザー名リンククリックでプロフィールへ遷移
        document.addEventListener('click', function(e) {
            const link = e.target.closest('.username-link');
            if (link) {
                const user_id = link.dataset.userId;
                localStorage.setItem('user_id', user_id);
                window.location.href = 'profile.html';
                getUserPosts(user_id);
            }
        });
    }


    /**
     * 認証状態のUI表示
     */
    function showAuthenticatedUI(authUser) {
        // ヘッダーの表示切替
        document.getElementById('authButtons').classList.add('d-none');
        // ユーザー名を表示
        document.getElementById('userNameDisplay').textContent = authUser.name;
        document.getElementById('userNameDisplay').addEventListener('click', function() {
            localStorage.setItem('user_id', authUser.id);
            window.location.href = 'profile.html';
        });
    
        // フッターの表示切替
        document.getElementById('postBtn').classList.remove('d-none');
        document.getElementById('profileBtn').classList.remove('d-none');
    
        // コメントモーダルの入力フォームを表示
        if (document.getElementById('commentForm')) {
            document.getElementById('commentForm').classList.remove('d-none')
        }
    }
    
    
    /**
     * 非認証状態のUI表示
     */
    function showUnauthenticatedUI() {
        // ヘッダーの表示切替
        document.getElementById('authButtons').classList.remove('d-none');
    
        // フッターのボタンを非表示
        document.getElementById('postBtn').classList.add('d-none');
        document.getElementById('profileBtn').classList.add('d-none');
    
        // コメントモーダルの入力フォームを非表示
        if (document.getElementById('commentForm')) {
            document.getElementById('commentForm').classList.add('d-none')
        }
    }

    authUser = await fetchAuthUser();
   
    if (authUser) {
        showAuthenticatedUI(authUser);
    }  else {
        showUnauthenticatedUI();
    }

    bindEventListeners();
});

