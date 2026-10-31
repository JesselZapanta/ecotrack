<?php

namespace App\Admin\Reports\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'category_id' => ['nullable', 'integer', 'exists:waste_categories,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date_from.required' => 'Choose a start date.',
            'date_to.required' => 'Choose an end date.',
            'date_to.after_or_equal' => 'The end date must be on or after the start date.',
        ];
    }
}
