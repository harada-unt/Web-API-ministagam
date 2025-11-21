document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = 'http://localhost';
    
    // Cookieから特定の値を取得する関数
    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    async function getCsrfToken() {
        try {
            const url = `${baseUrl}/sanctum/csrf-cookie`;
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Csrfトークンの取得に失敗しました');
            }
            console.log('CSRFトークンの取得に成功しました');
            
        } catch (error) {
            console.error('CSRFトークンの取得に失敗しました:', error);
            throw error;
        }
    }

    function bindEventListeners() {
        // 認証関連のイベント
        bindAuthEvents();
    }

    function bindAuthEvents() {
        // ログインボタン
        const loginSubmitBtn = document.getElementById('loginSubmitBtn');
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', function() {
                authLogin();
            });
        }

        // ログアウトボタン
        const logoutBtn = document.getElementById('logoutBtn')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                authLogout();
            })
        }
    }

    // ログインIDとパスワードを使用して、ログインする。ログイン成功時に生成されたBearerトークンをローカルストレージに保存する。
    async function authLogin() {
        console.log('ログイン処理開始');

        // フォームからログインIDとパスワードを取得
        const login_id = document.getElementById('login_id').value;
        const password = document.getElementById('password').value;
       
        try {
            // CSRF トークン取得
            await getCsrfToken();

            // CSRF トークンを取得
            const xsrfToken = getCookieValue('XSRF-TOKEN');
            
            if (!xsrfToken) {
                throw new Error('CSRFトークンが見つかりません');
            }

            const url = `${baseUrl}/api/v1/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                },
                body: JSON.stringify({ login_id, password }),
            });

            if (response.ok) {
                const user = await response.json();
                console.log('ログインに成功しました:', user);

                // ホーム画面にリダイレクト
                window.location.href = 'index.html';
            } else {
                const errorData = await response.json();
                
                if (errorData.errors) {
                    document.getElementById('loginIdError').textContent = errorData.errors.login_id;
                    document.getElementById('passwordError').textContent = errorData.errors.password;
                } else {
                    document.getElementById('loginIdError').textContent = '';
                    document.getElementById('passwordError').textContent = '';
                    document.getElementById('loginError').textContent = errorData.message;
                }
            }
        } catch (error) {
            console.error('ログインに失敗しました:', error);
        }
    }

    // ログアウト処理
    async function authLogout() {
        if (confirm('ログアウトしますか？')) {
            try {
                const xsrfToken = getCookieValue('XSRF-TOKEN');
                const url = `${baseUrl}/api/v1/auth/logout`;
                const response = await fetch(url, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(xsrfToken && { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) })
                    }
                });
                if (response.ok) {
                    console.log('ログアウトに成功しました');
                } else {
                    console.error('ログアウトAPIでエラーが発生しました');
                }

                // 成功・失敗に関わらず、ホーム画面へ移動
                // Cookie認証なので、Cookieはサーバー側で削除される
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('ログアウト処理に失敗しました:', error);
                // 失敗してもホーム画面に移動
                window.location.href = 'index.html';
            }
        }
    }

    bindEventListeners();
});
