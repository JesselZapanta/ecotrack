<?php

namespace App\Admin\WasteRecords\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWasteRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['sometimes', 'integer', 'exists:locations,id'],
            'category_id' => ['sometimes', 'integer', 'exists:waste_categories,id'],
            'schedule_id' => ['nullable', 'integer', 'exists:collection_schedules,id'],
            'date' => ['sometimes', 'date_format:Y-m-d', 'before_or_equal:today'],
            'quantity_kg' => ['sometimes', 'numeric', 'min:0.01'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}
