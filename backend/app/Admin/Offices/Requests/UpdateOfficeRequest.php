<?php

namespace App\Admin\Offices\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOfficeRequest extends FormRequest
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
        $office = $this->route('office');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('offices', 'name')
                    ->ignore($office?->id)
                    ->where(fn ($query) => $query->where('location_id', $this->input('location_id', $office?->location_id))),
            ],
            'floor' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:20'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'location_id' => ['sometimes', 'required', 'integer', 'exists:locations,id'],
        ];
    }
}
