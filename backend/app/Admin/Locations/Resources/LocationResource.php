<?php

namespace App\Admin\Locations\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'building' => $this->building,
            'floor_or_area' => $this->floor_or_area,
            'is_active' => (bool) $this->is_active,
            'offices' => $this->whenLoaded('offices', fn () => $this->offices->map(fn ($office) => [
                'id' => $office->id,
                'name' => $office->name,
            ])),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
