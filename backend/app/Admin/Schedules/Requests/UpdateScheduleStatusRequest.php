<?php

namespace App\Admin\Schedules\Requests;

use App\Models\CollectionSchedule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScheduleStatusRequest extends FormRequest
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
            'status' => ['required', 'string', Rule::in(CollectionSchedule::STATUSES)],
            'remark' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('remark', 'required|string|max:500', function () {
            return $this->input('status') === CollectionSchedule::STATUS_MISSED;
        });
    }
}
