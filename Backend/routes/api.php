<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;

Route::prefix('v1/')->group(function() {

    /**
     * ユーザー関連
     */
    Route::prefix('/users')->group(function() {
        Route::post('/register', [UserController::class, 'register']);

        /**
         * 認証が必要なルート
         */
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::put('/profile', [UserController::class, 'changeProfile']);
        });
    });


    /**
     * 認証関連
     */
    Route::prefix('/auth')->group(function() {

        Route::post('/login', [AuthController::class, 'login']);

        /**
        * 認証が必要なルート
         */
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
        });
    });


    /**
     * 投稿関連
     */
    Route::prefix('/posts')->group(function() {
        Route::get('', [PostController::class, 'getPost']);
        Route::get('/{user_id}', [PostController::class, 'getUserPost']);

        /**
        * 認証が必要なルート
         */
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('', [PostController::class, 'createPost']);
            Route::delete('/{post_id}', [PostController::class, 'deletePost']);
        });


        /**
         * コメント関連
         */
        Route::get('/{post_id}/comments', [CommentController::class, 'getComment']);

        /**
        * 認証が必要なルート
         */
        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/{post_id}/comments', [CommentController::class, 'createComment']);
            Route::delete('/{post_id}/comments/{comment_id}', [CommentController::class, 'deleteComment']);
        });
    });
});