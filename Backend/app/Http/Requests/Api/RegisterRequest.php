<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;


class RegisterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max: 12'],
            'login_id' => ['required', 'string', 'max: 24', 'unique:users'],
            'password' => ['required', 'string', 'min: 8', 'max: 36', ]
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'ユーザー名は必須です。',
            'name.max' => 'ユーザー名は12文字以内で入力してください。',
            'login_id.required' => 'ログインIDは必須です。',
            'login_id.max' => 'ログインIDは24文字以内で入力してください。',
            'login_id.unique' => 'このログインIDは使用できません。',
            'password.required' => 'パスワードは必須です。',
            'password.min' => 'パスワードは8~36文字以内で入力してください。',
            'password.max' => 'パスワードは8~36文字以内で入力してください。'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => '無効な入力データです',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY)
        );
    }
}
