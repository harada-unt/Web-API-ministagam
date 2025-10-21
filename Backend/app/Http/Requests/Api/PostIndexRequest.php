<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class PostIndexRequest extends FormRequest
{
    /**
     * リクエストの認可
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * バリデーションルール
     */
    public function rules(): array
    {
        return [
            'page' => 'sometimes|integer|min:1|max:10000',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'sort' => 'sometimes|string|in:created_at,updated_at',
            'order' => 'sometimes|string|in:asc,desc',
        ];
    }

    /**
     * カスタムエラーメッセージ
     */
    public function messages(): array
    {
        return [
            'page.integer' => 'ページ番号は整数で指定してください。',
            'page.min' => 'ページ番号は1以上である必要があります。',
            'page.max' => 'ページ番号は10000以下である必要があります。',
            'per_page.integer' => '表示件数は整数で指定してください。',
            'per_page.min' => '表示件数は1以上である必要があります。',
            'per_page.max' => '表示件数は100以下である必要があります。',
            'sort.in' => 'ソート項目が不正です。',
            'order.in' => 'ソート順序が不正です。',
        ];
    }

    /**
     * バリデーション失敗時の処理
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => '無効な入力データです。',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY)
        );
    }

    /**
     * バリデーション後の値を取得（デフォルト値付き）
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        // デフォルト値を設定
        return array_merge([
            'page' => 1,
            'per_page' => 10,
            'sort' => 'created_at',
            'order' => 'desc',
        ], $validated);
    }
}