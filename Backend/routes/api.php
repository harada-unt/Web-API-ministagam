<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;


// ユーザー登録
Route::post('v1/users/register', [UserController::class, 'register']);
// 投稿一覧取得
Route::get('v1/posts', [PostController::class, 'getPost']);
// 指定ユーザーの投稿一覧取得
Route::get('v1/posts/{user_id}', [PostController::class, 'getUserPost']);
// 指定投稿のコメント一覧取得
Route::get('v1/posts/{post_id}/comments', [CommentController::class, 'getComment']);

// 認証処理（セッション必要、但し認証前）
Route::middleware(['auth-api'])->group(function () {
    Route::post('v1/auth/login', [AuthController::class, 'login']);
});

/**
 * 認証が必要なルート
 */
Route::middleware(['auth-api', 'auth:sanctum'])->group(function () {
    // ログアウト
    Route::post('v1/auth/logout', [AuthController::class, 'logout']);
    // 認証ユーザー情報取得
    Route::get('v1/auth/user', [AuthController::class, 'user']);
    // プロフィール変更
    Route::put('v1/users/profile', [UserController::class, 'changeProfile']);
    // 新規投稿作成
    Route::post('v1/posts', [PostController::class, 'createPost']);
    // 投稿削除
    Route::delete('v1/posts/{post_id}', [PostController::class, 'deletePost']);
    // コメント作成
    Route::post('v1/posts/{post_id}/comments', [CommentController::class, 'createComment']);
    // コメント削除
    Route::delete('v1/posts/{post_id}/comments/{comment_id}', [CommentController::class, 'deleteComment']);
});