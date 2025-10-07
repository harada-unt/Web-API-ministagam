document.addEventListener('DOMContentLoaded', function() {
    
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

        // TODO: バリデーション
        // 必須チェック


        // 桁数チェック
       

        try {
            const url = 'http://localhost:80/api/v1/auth/login';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login_id, password })
            });

            if (response.ok) {
                const login = await response.json();
                const token = login.data.token

                // ローカルストレージにトークンを保存
                localStorage.setItem('authToken', token);

                // ホーム画面にリダイレクト
                window.location.href = 'index.html';
            } else {
                const errorData = await response.json();
                alert(`ログインに失敗しました: ${errorData.message}`);
            }
        } catch (error) {
            console.error('ログインに失敗しました:', error);
            alert('ログインに失敗しました。');
        }
    }

    // ログアウト
    async function authLogout() {
        // 本当にログアウトするか確認
        alert('ログアウトしますか？');
        if (true) {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // TODO response
                    const url = 'http://localhost:80/api/v1/auth/logout';
                    // ローカルストレージからトークンを削除
                    localStorage.removeItem('authToken');
                    // ホーム画面にリダイレクト
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('ログアウト処理に失敗しました:', error);
                // 失敗してもログを残してトークンを削除
                localStorage.removeItem('authToken');
            }
        }

    }

    bindEventListeners();
});
