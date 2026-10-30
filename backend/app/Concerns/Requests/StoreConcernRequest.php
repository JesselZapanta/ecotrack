<?php

namespace App\Concerns\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Describe the problem so the crew knows what to expect.',
            'description.min' => 'Add a little more detail — at least 10 characters.',
            'photo.image' => 'The photo must be a JPG, PNG or WebP image.',
            'photo.max' => 'The photo must be 5 MB or smaller.',
        ];
    }
}
