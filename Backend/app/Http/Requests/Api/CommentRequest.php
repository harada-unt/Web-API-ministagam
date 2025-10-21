<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;


class  CommentRequest extends FormRequest
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
            'content' => ['required', 'max: 50'],
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => '本文は必須です。',
            'content.max' => '本文は50文字以内で入力してください。',
            'image.required' => '画像ファイルを選択してください。',
            'image.image' => '画像ファイルを選択してください。',
            'image.mimes' => '画像ファイルはjpg, jpeg, png, gif形式である必要があります。',
            'image.max' => '画像ファイルは5MB以内である必要があります。'
        ];
    }

    protected function failledValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => '無効な入力データです',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY)
        );
    }

}
