<?php

namespace App\Http\Controllers;
use App\Http\Requests\Api\PostRequest;
use App\Models\Post;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PostIndexRequest;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Storage;
use Exception;


class PostController extends Controller
{
    /**
     * 投稿一覧取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPost(PostIndexRequest $request) {
        try {
            // バリデーション済みのパラメータを取得
            $validated = $request->validated();

            $perPage = $validated['per_page'];
            $sort = $validated['sort'];
            $order = $validated['order'];

            $posts = Post::with('user:id,name')
                ->orderBy($sort, $order)
                ->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'current_page' => $posts->currentPage(),
                'data' => PostResource::collection($posts),
                // pagenation用データ
                'pagination' => [
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                    'first_page_url' => $posts->url(1),
                    'last_page' => $posts->lastPage(),
                    'last_page_url' => $posts->url($posts->lastPage()),
                    'next_page_url' => $posts->nextPageUrl(),
                    'from' => $posts->firstItem(),
                    'path' => $posts->path(),
                    'links' => $posts->linkCollection(),
                    'has_more_pages' => $posts->hasMorePages(),
                    'prev_page_url' => $posts->previousPageUrl(),
                    'to' => $posts->lastItem(),
                ],
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'request_id' => (string) \Str::uuid(),
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
    public function getUserPost(PostIndexRequest $request, $user_id) {
        try {
            // バリデーション済みのパラメータを取得
            $validated = $request->validated();
            $perPage = $validated['per_page'];
            $sort = $validated['sort'];
            $order = $validated['order'];

            $posts = Post::with('user:id,name')
                ->where('user_id', $user_id)
                ->where('deleted_at', null)
                ->orderBy($sort, $order)
                ->paginate($perPage);

            if ($posts->isEmpty()) {
                return response()->json([
                    'message' => '指定されたユーザーの投稿が見つかりません。'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => 'success',
                'current_page' => $posts->currentPage(),
                'data' => PostResource::collection($posts),
                // pagenation用データ
                'pagination' => [
                    'first_page_url' => $posts->url(page: 1),
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
                ],
                'meta' => [
                    'timestamp' => now()->toISOString(),
                    'request_id' => (string) \Str::uuid(),
                ]
            ], Response::HTTP_OK);
        } catch (Exception $e) {
            return response()->json([
                'message' => '投稿の取得に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }


    /**
     * 新規投稿の作成
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPost(PostRequest $request) {
        DB::beginTransaction();
        try {
            $user = auth()->user();
            $imagePath = $request->file('image')->store('posts', 'public');
            $post = Post::create([
                        'user_id' => $user->id,
                        'content' => $request->content,
                        'image_path' => $imagePath,
                    ]);
            DB::commit();

            return response()->json([
                "message" => "投稿しました。",
                "data" => new PostResource($post),
            ], Response::HTTP_CREATED);

        } catch (Exception $e) {
            DB::rollBack();
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
            // post_idの型をチェック数字以外はエラーを返す
            if (!is_numeric($post_id)) {
                return response()->json([
                    'message' => '無効な投稿IDです。'
                ], Response::HTTP_BAD_REQUEST);
            }

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
                'message' => '投稿の削除に失敗しました。'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        };
    }
}