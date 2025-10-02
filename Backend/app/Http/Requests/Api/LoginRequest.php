<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class LoginRequest extends FormRequest
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
            'login_id' => ['required', 'string', 'max: 12'],
            'password' => ['required', 'string', 'min: 8', 'max:36'],
        ];
    }

    public function messages(): array
    {
        return [
            'login_id.required' => 'ログインは必須です。',
            'login_id.max' => 'ログインIDは12文字以内で入力してください。',
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
