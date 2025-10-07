<?php

namespace App\Http\Controllers;
use App\Models\Post;
use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Storage;
use Exception;


class PostController extends Controller
{
    /**
     * 投稿一覧取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPost() {
        try {
            $posts = Post::with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'current_page' => $posts->currentPage(),
                'data' => PostResource::collection($posts),
                // pagenation用データ
                'pagination' => [
                    'first_page_url' => $posts->url(1),
                    'from' => $posts->firstItem(),
                    'last_page' => $posts->lastPage(),
                    'last_page_url' => $posts->url($posts->lastPage()),
                    'links' => $posts->linkCollection(),
                    'next_page_url' => $posts->nextPageUrl(),
                    'path' => $posts->path(),
                    'per_page' => $posts->perPage(),
                    'prev_page_url' => $posts->previousPageUrl(),
                    'to' => $posts->lastItem(),
                    'total' => $posts->total(),
                ]
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            return response()->json([
                'message' => '投稿の取得に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }


    /**
     * 特定ユーザーの投稿一覧取得
     * @param mixed $user_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserPost($user_id) {
        $posts = Post::with('user:id,name')
            ->where('user_id', $user_id)
            ->where('deleted_at', null)
            ->orderBy('created_at', 'desc')
            ->paginate(perPage: 10);

        return response()->json([
            'status' => 'success',
            'current_page' => $posts->currentPage(),
            'data' => PostResource::collection($posts),
            // pagenation用データ
            'pagination' => [
                'first_page_url' => $posts->url(1),
                'from' => $posts->firstItem(),
                'last_page' => $posts->lastPage(),
                'last_page_url' => $posts->url($posts->lastPage()),
                'links' => $posts->linkCollection(),
                'next_page_url' => $posts->nextPageUrl(),
                'path' => $posts->path(),
                'per_page' => $posts->perPage(),
                'prev_page_url' => $posts->previousPageUrl(),
                'to' => $posts->lastItem(),
                'total' => $posts->total(),
            ]
        ], Response::HTTP_OK);
    }


    /**
     * 新規投稿の作成
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPost(Request $request) {
        try {
            $validated = $request->validate([
                'content' => 'required|max:50',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            ], [
                'conten.required' => '投稿本文は必須です。',
                'content.max' => '投稿本文は50文字以内で入力してください。',
                'image.required' => '画像ファイルを選択してください。',
                'image.image' => '画像ファイルを選択してください。',
                'image.mimes' => '画像ファイルはjpg, jpeg, png, gif形式である必要があります。',
                'image.max' => '画像ファイルは5MB以内である必要があります。',

            ]);

            $user = auth()->user();
            $imagePath = $request->file('image')->store('posts', 'public');
            $post = Post::create([
                        'user_id' => $user->id,
                        'content' => $validated['content'],
                        'image_path' => $imagePath,
                    ]);

            return response()->json([
                "message" => "投稿しました。",
                "data" => $post
            ], Response::HTTP_CREATED);

        } catch (Exception $e) {
            return response()->json([
                'message' => '投稿の作成に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }


    /**
     * 指定された投稿を削除する
     * @param mixed $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePost($post_id) {
        DB::beginTransaction();
        try {
            $post = Post::find($post_id);
            if (!$post) {
                return response()->json([
                    'message' => '投稿が見つかりません。'
                ], Response::HTTP_NOT_FOUND);
            }

            $user = auth()->user();
            if ($post->user_id !== $user->id) {
                return response()->json([
                    'message' => '自分の投稿のみ削除できます。',
                ], Response::HTTP_FORBIDDEN);
            }

            Storage::disk('public')->delete($post->image_path);
            $post->comments()->delete();
            $post->delete();

            DB::commit();

            return response()->json([
                "status" => 'success',
                'message' => '投稿を削除しました。'
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => '投稿の作成に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }
}