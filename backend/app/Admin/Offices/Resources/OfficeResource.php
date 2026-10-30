<?php

namespace App\Admin\Offices\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'floor' => $this->floor,
            'type' => $this->type,
            'status' => $this->status,
            'contact_person' => $this->contact_person,
            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', fn () => $this->location ? [
                'id' => $this->location->id,
                'name' => $this->location->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
