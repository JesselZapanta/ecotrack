<?php

namespace App\Admin\Schedules\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $scheduledDate = $this->scheduled_date instanceof \Carbon\CarbonInterface
            ? $this->scheduled_date->format('Y-m-d')
            : substr((string) $this->scheduled_date, 0, 10);

        return [
            'id' => $this->id,
            'scheduled_date' => $scheduledDate,
            'window_start' => substr((string) $this->window_start, 0, 5),
            'window_end' => substr((string) $this->window_end, 0, 5),
            'recurrence_rule' => $this->recurrence_rule,
            'status' => $this->status,
            'notes' => $this->notes,
            'assigned_to' => $this->assigned_to,
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee ? [
                'id' => $this->assignee->id,
                'name' => $this->assignee->name,
            ] : null),
            'locations' => $this->whenLoaded('locations', fn () => $this->locations->map(fn ($location) => [
                'id' => $location->id,
                'name' => $location->name,
                'building' => $location->building,
            ])->values()),
            'categories' => $this->whenLoaded('categories', fn () => $this->categories->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'color_code' => $category->color_code,
            ])->values()),
            'history' => StatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
