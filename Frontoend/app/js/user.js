document.addEventListener('DOMContentLoaded', function() {
    function bindEventListeners() {
        // ユーザー関連のイベント
        bindUserEvents();
    }

    function bindUserEvents() {
        // 新規登録ボタン
        const registerUserBtn = document.getElementById('registerUserBtn');
        if (registerUserBtn) {
            registerUserBtn.addEventListener('click', function() {
                registerUser();
            })
        }

        // プロフィール更新ボタン
        const changeProfileBtn = document.getElementById('changeProfileBtn');
        if (changeProfileBtn) {
            changeProfileBtn.addEventListener('click', function() {
                changeProfile();
            })
        }
    }

    // ユーザー登録
    async function registerUser() {
        const userName = document.getElementById('userName').value;
        const loginId = document.getElementById('loginId').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;


        // TODO: バリデーション
        if (password !== passwordConfirm) {
            alert('パスワードと確認用パスワードが一致しません。');
            return;
        }

        const formData = new FormData();
        formData.append('userName', userName);
        formData.append('loginId', loginId);
        formData.append('password', password);

        try {
            const url = 'http://localhost:8000/api/v1/users/register'
            const response = await fetch(url, {
                method: 'POST',
                body: formData
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
    async function changeProfile() {
        const token = localStorage.getItem('authToken');

        if (token) {
            const userName = document.getElementById('userName').value;
            const password = document.getElementById('password').value;
            const passwordCofirm = document.getElementById('passwordConfirm').value;
            //  TODO: バリデーション

            const formData = new FormData();
            formData.append('userName', userName);
            formData.append('password', password);
            
            try {
                const url = 'http://localhost:8000/api/v1/users/profile';
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
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