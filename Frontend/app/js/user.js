document.addEventListener('DOMContentLoaded', function() {
    const baseUrl = 'http://127.0.0.1:80';

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
        // ユーザー関連のイベント
        bindUserEvents();
    }

    function bindUserEvents() {
        // 新規登録ボタン
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault(); // フォームのデフォルトの送信を防止
                registerUser(e.target);
            })
        }

        // プロフィール更新ボタン
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault(); // フォームのデフォルトの送信を防止
                changeProfile(e.target);
            })
        }
    }

    // ユーザー登録
    async function registerUser(form) {
        console.log('ユーザー登録処理開始');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // バリデーション
        if (data.password !== data.passwordConfirm) {
            alert('パスワードが一致しません。');
            return;
        }
        if (data.password.length < 8) {
            alert('パスワードは8文字以上で入力してください。');
            return;
        }
        
        try {
            const url = `${baseUrl}/api/v1/users/register`
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('ユーザー登録が完了しました。ログインしてください。');
                window.location.href = 'login.html';
            }
            else {
                const errorData = await response.json();
                alert(`ユーザー登録に失敗しました: ${errorData.message}`);
            }
        } catch (error) {
            console.error('ユーザー登録に失敗しました:', error);
            alert('ユーザー登録に失敗しました。');
        }
    }


    // プロフィール変更
    async function changeProfile(form) {
        const xsrfToken = getCookieValue('XSRF-TOKEN');
        console.log('ユーザー登録処理開始');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // バリデーション
        if (data.password !== data.passwordConfirm) {
            alert('パスワードが一致しません。');
            return;
        }
        
        // パスワードの入力がある場合、8文字以上であることを確認  入力がない場合はスキップ
        if (data.password && data.password.length < 8) {
            alert('パスワードは8文字以上で入力してください。');
            return;
        }

        if (xsrfToken) {
            try {
                const url =  `${baseUrl}/api/v1/users/profile`;
                const response = await fetch(url, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                    'content-type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                },
                body: JSON.stringify(data)
                });

                if (response.ok) {
                    // プロフィール更新成功時の処理
                    alert('プロフィールの更新が完了しました。')
                    window.location.href = 'profile.html';
                } else {
                    const errorData = await response.json();
                    alert(`プロフィールの更新に失敗しました: ${errorData.message}`);
                }
            } catch (error) {
                console.error('プロフィールの更新に失敗しました:', error);
                alert('プロフィールの更新に失敗しました。');
            }
        }
    }

    bindEventListeners();
});