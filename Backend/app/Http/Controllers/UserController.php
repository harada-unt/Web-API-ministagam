<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\ChangeProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

class UserController extends Controller
{
    /**
     * 新規ユーザー登録
     * @param \App\Http\Requests\Api\RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request)
    {
        DB::beginTransaction();
        try {
            User::create([
                'name' => $request->name,
                'login_id' => $request->login_id,
                'password' => Hash::make($request->password),
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'messaage' => 'ユーザー登録が完了しました。'
            ], Response::HTTP_CREATED);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'サーバーエラーが発生しました。',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    public function changeProfile(ChangeProfileRequest $request)
    {
        DB::beginTransaction();
        try {

            $user = User::find(auth()->user()->id);

            // 更新データの準備
            $updateData = [];
            if ($request->filled('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'プロフィールを更新しました。',
                'data' => $user
            ], Response::HTTP_OK);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'サーバーエラーが発生しました。',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
