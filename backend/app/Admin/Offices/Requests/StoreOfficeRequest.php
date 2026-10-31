<?php

namespace App\Admin\Offices\Requests;

use App\Models\Office;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOfficeRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('offices', 'name')->where(fn ($query) => $query->where('location_id', $this->input('location_id'))),
            ],
            'floor' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', Rule::in(Office::TYPES)],
            'status' => ['nullable', 'string', 'max:20'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
        ];
    }
}
