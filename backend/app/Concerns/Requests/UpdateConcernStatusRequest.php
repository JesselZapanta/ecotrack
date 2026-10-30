<?php

namespace App\Concerns\Requests;

use App\Models\Concern;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateConcernStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(Concern::STATUSES)],
            'resolution_note' => [
                'nullable',
                'string',
                'min:5',
                'max:1000',
                Rule::requiredIf($this->input('status') === Concern::STATUS_RESOLVED),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'resolution_note.required' => 'Add a short note on how the concern was resolved.',
            'resolution_note.min' => 'Describe the resolution in at least 5 characters.',
        ];
    }
}
