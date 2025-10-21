<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\Api\LoginRequest;
use Illuminate\support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use Exception;

class AuthController extends Controller
{
    /**
     * ログインIDとパスワードで認証し、セッションを開始する
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->only('login_id', 'password');
        if (!Auth::guard('web')->attempt($credentials) ) {
            return response()->json([
                'message' => 'ログインIDまたはパスワードが正しくありません。',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $request->session()->regenerate();
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
