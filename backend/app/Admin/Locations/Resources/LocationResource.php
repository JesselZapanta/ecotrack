<?php

namespace App\Admin\Locations\Resources;

use App\Models\Office;
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
            'offices' => $this->whenLoaded('offices', fn () => $this->offices
                ->where('type', Office::TYPE_OFFICE)
                ->map(fn ($office) => [
                    'id' => $office->id,
                    'name' => $office->name,
                ])
                ->values()),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
