<?php

namespace App\Admin\Locations\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'building' => ['required', 'string', 'max:100'],
            'floor_or_area' => ['nullable', 'string', 'max:100'],
        ];
    }
}
