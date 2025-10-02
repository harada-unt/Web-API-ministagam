<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Comment;
use App\Models\Post;
use App\Http\Controllers\Controller;
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
            $comments = Comment::where('post_id', $post_id)
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $comments,
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'コメントの取得に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }


    public function createComment(Request $request, $post_id) {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'content' => 'required|max:50'
            ], [
                'content.required' => 'コメント内容は必須です。',
                'content.max' => 'コメントは50文字以内で入力してください。'
            ]);

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
            $post = Post::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => '投稿が見つかりません。'
                ], Response::HTTP_NOT_FOUND);
            }

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
