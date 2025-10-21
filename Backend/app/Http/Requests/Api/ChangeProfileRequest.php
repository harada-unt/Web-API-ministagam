<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class ChangeProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max: 12'],
            'password' => ['nullable', 'string', 'min: 8', 'max: 36'],
        ];
    }
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // nameとpasswordが両方とも未入力の場合のみエラー
            if (!$this->filled('name') && !$this->filled('password')) {
                $validator->errors()->add('name', 'ユーザー名またはパスワードのいずれかは入力必須です。');
                $validator->errors()->add('password', 'ユーザー名またはパスワードのいずれかは入力必須です。');
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.max' => 'ユーザー名は12文字以内で入力してください。',
            'password.min' => 'パスワードは8~36文字以内で入力してください。',
            'password.max' => 'パスワードは8~36文字以内で入力してください。',
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
