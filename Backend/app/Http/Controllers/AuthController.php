<?php

namespace App\Http\Controllers;

use App\Http\Requests\Api\LoginRequest;
use Illuminate\support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * ログインIDとパスワードで認証し、新しいセッションを生成して返す
     * @param \App\Http\Requests\Api\LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        // authenticate() メソッドで認証処理を実行
        $request->authenticate();

        // 認証成功後のセッション再生成
        $request->session()->regenerate();

        // 認証済みユーザーの取得
        $user = Auth::guard('web')->user();

        return response()->json([
            'status' => 'success',
            'message' => 'ログインしました。',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ]
            ],
            'meta' => [
                'timestamp' => now()->toISOString(),
                'request_id' => (string) \Str::uuid(),
            ]
        ], Response::HTTP_OK);
    }


    /**
     * トークンを削除することでログアウトする。
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json([
            'status' => 'success',
            'message' => 'ログアウトしました。',
            'meta' => [
                'timestamp' => now()->toISOString(),
                'request_id' => (string) \Str::uuid(),
            ]
        ], Response::HTTP_OK);
    }


    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ], Response::HTTP_OK);
    }
}
