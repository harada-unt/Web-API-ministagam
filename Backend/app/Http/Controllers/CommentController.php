<?php

namespace App\Http\Controllers;

use App\Http\Requests\Api\CommentRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Exception;

class CommentController extends Controller
{
    /**
     * 指定した投稿のコメント一覧を新しい順に取得する
     * @param mixed $post_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getComment($post_id) {
        try{
            // post_idの型をチェック数字以外はエラーを返す
            if (!is_numeric($post_id)) {
                return response()->json([
                    'message' => '無効な投稿IDです。'
                ], Response::HTTP_BAD_REQUEST);
            }
            // 投稿の存在チェック
            $post = Post::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => '投稿が見つかりません'
                ], Response::HTTP_NOT_FOUND);
            }

            $comments = Comment::where('post_id', $post_id)
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => CommentResource::collection($comments),
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'コメントの取得に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }


    public function createComment(CommentRequest $request, $post_id) {
        DB::beginTransaction();
        try {
            // バリデーション済みのパラメータを取得
            $validated = $request->validated();

            // post_idの型をチェック数字以外はエラーを返す
            if (!is_numeric($post_id)) {
                return response()->json([
                    'message' => '無効な投稿IDです。'
                ], Response::HTTP_BAD_REQUEST);
            }
            // 投稿の存在チェック
            $post = Post::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => '投稿が見つかりません'
                ], Response::HTTP_NOT_FOUND);
            }

            $comment = Comment::create([
                'post_id' => $post_id,
                'user_id' => auth()->user()->id,
                'content' => $validated['content'],
            ]);

            // コメント数を更新
            $post->increment('comment_count');

            DB::commit();

            return response()->json([
                'message' => 'コメントしました。',
                'data' => $comment,
            ], Response::HTTP_CREATED);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'コメントの作成に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function deleteComment($post_id, $comment_id) {
        DB::beginTransaction();
        try {
            // post_idの型をチェック数字以外はエラーを返す
            if (!is_numeric($post_id)) {
                return response()->json([
                    'message' => '無効な投稿IDです。'
                ], Response::HTTP_BAD_REQUEST);
            }
            // comment_idの型をチェック数字以外はエラーを返す
            if (!is_numeric($comment_id)) {
                return response()->json([
                    'message' => '無効なコメントIDです。'
                ], status: Response::HTTP_BAD_REQUEST);
            }

            // 投稿の存在チェック
            $post = Post::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => '投稿が見つかりません。'
                ], Response::HTTP_NOT_FOUND);
            }
            // コメントの存在チェック
            $coment = Comment::find($comment_id);
            if (!$coment) {
                return response()->json([
                    'message' => 'コメントが見つかりません。'
                ], Response::HTTP_NOT_FOUND);
            }

            // 自分のコメントかどうかチェック
            $comment = Comment::find($comment_id);
            $user = auth()->user();
            if ($comment->user_id !== $user->id) {
                return response()->json([
                    'message' => '自分のコメントのみ削除できます。'
                ], Response::HTTP_FORBIDDEN);
            }

            $comment->delete();

            // コメント数を更新
            $post->decrement('comment_count');

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'コメントを削除しました。'
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'コメントの削除に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }
}
