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
        const loginId = document.getElementById('loginId').value;
        const password = document.getElementById('password').value;

        // TODO: バリデーション
        // 空欄チェック
        // 桁数チェック

        if (!loginId || !password) {
            alert('ログインIDとパスワードを入力してください。');
            return;
        }

        try {
            const url = 'http://localhost:8000/api/v1/auth/login';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginId, password })
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;

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

    // ログ
    アウト
    async function authLogout() {
        // 本当にログアウトするか確認
        alert('ログアウトしますか？');
        if (true) {
            const token = localStorage.getItem('authToken');
            if (token) {
                // ローカルストレージからトークンを削除
                localStorage.removeItem('authToken');
                // ホーム画面にリダイレクト
                window.location.href = 'index.html';
            } 
        }

    }

    bindEventListeners();
});
