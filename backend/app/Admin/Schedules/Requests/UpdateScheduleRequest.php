<?php

namespace App\Admin\Schedules\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScheduleRequest extends FormRequest
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
            'scheduled_date' => ['sometimes', 'required', 'date', 'date_format:Y-m-d'],
            'window_start' => ['sometimes', 'required', 'date_format:H:i'],
            'window_end' => ['sometimes', 'required', 'date_format:H:i', 'after:window_start'],
            'recurrence_rule' => ['nullable', 'string', Rule::in(['once', 'daily', 'weekly'])],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'location_ids' => ['sometimes', 'required', 'array', 'min:1', 'max:50'],
            'location_ids.*' => ['integer', 'exists:locations,id'],
            'category_ids' => ['sometimes', 'required', 'array', 'min:1', 'max:20'],
            'category_ids.*' => ['integer', 'distinct', 'exists:waste_categories,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
