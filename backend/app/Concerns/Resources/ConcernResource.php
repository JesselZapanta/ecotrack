<?php

namespace App\Concerns\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConcernResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $location = null;
        if ($this->relationLoaded('location') && $this->location) {
            $location = [
                'id' => $this->location->id,
                'name' => $this->location->name,
                'building' => $this->location->building,
                'floor_or_area' => $this->location->floor_or_area,
            ];
        }

        $reporter = null;
        if ($this->relationLoaded('reporter') && $this->reporter) {
            $reporter = [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
                'role' => $this->reporter->role,
            ];
        }

        $office = null;
        if ($this->relationLoaded('office') && $this->office) {
            $office = [
                'id' => $this->office->id,
                'name' => $this->office->name,
            ];
        }

        $resolver = null;
        if ($this->relationLoaded('resolver') && $this->resolver) {
            $resolver = [
                'id' => $this->resolver->id,
                'name' => $this->resolver->name,
            ];
        }

        return [
            'id' => $this->id,
            'description' => $this->description,
            'status' => $this->status,
            'photo_path' => $this->photo_path,
            'photo_url' => $this->photo_path ? '/storage/'.ltrim($this->photo_path, '/') : null,
            'resolution_note' => $this->resolution_note,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'resolved_by' => $resolver,
            'created_at' => $this->created_at?->toIso8601String(),
            'location' => $location,
            'office' => $office,
            'reporter' => $reporter,
        ];
    }
}
