<?php

namespace App\Admin\WasteRecords\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWasteRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'category_id' => ['required', 'integer', 'exists:waste_categories,id'],
            'schedule_id' => ['nullable', 'integer', 'exists:collection_schedules,id'],
            'date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'quantity_kg' => ['required', 'numeric', 'min:0.01'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
    }
}
