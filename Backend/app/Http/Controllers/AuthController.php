<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\Api\LoginRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use Exception;

class AuthController extends Controller
{

    /**
     * ログインIDとパスワードで認証し、新しいトークンを生成し返す。
     * @param \App\Http\Requests\Api\LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        try {
            $user = User::where('login_id', $request->login_id)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json( [
                    'message' => 'ログインIDまたはパスワードが正しくありません。',
                ], Response::HTTP_UNAUTHORIZED);
            }

            // 既存のトークンを削除 (同一ユーザーの多重ログイン防止)
            $user->tokens()->delete();

            // 新しいトークンを生成
            $token = $user->createToken('api-token', ['*'], now()->addDays(30))->plainTextToken;

            return response()->json([
                'message' => 'ログインしました。',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => now()->addDays(30)->toISOString(),
                ],
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'request_id' => (string) \Str::uuid(),
                ]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            logger()->error('Login failed', [
                'error' => $e->getMessage(),
                'login_id' => $request->login_id,
            ]);

            return response()->json([
                'message' => 'ログイン処理中にエラーが発生しました。',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * トークンを削除することでログアウトする。
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        $user = auth()->user();
        $token = $user->currentAccessToken();
        $expiresAt = $token->expires_at;
        try {
            // 現在のトークンの有効期限を確認
            if ($expiresAt && Carbon::now()->greaterThan($expiresAt)) {
                $token->delete();
                return response()->json([
                    'message' => 'トークンの有効期限が切れています。',
                ], Response::HTTP_UNAUTHORIZED);
            }

            $token->delete();
            return response()->json([
                'message' => 'ログアウトしました。',
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'request_id' => (string) \Str::uuid(),
                ]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            $token->delete();
            return response()->json([
                'ログアウトに失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    public function user()
    {
        try {
            // 認証ユーザーの取得
            $user = auth()->user();

            if (!$user) {
                return response()->json([
                    'message' => 'ユーザー情報が見つかりません。再度ログインしてください。',
                ], Response::HTTP_UNAUTHORIZED);
            }

            $userStats = [
                'id' => $user->id,
                'name' => $user->name,
                'login_id' => $user->login_id,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ];

            return response()->json([
                'message' => 'ユーザー情報を取得しました。',
                'data' => [
                    'user' => $userStats
                ]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'ユーザー情報の取得に失敗しました。',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }
}
