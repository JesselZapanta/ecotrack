<?php

namespace App\Admin\Users\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'full_name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'office_id' => $this->office_id,
            'office' => $this->whenLoaded('office', fn () => $this->office ? [
                'id' => $this->office->id,
                'name' => $this->office->name,
                'location' => $this->office->location ? [
                    'id' => $this->office->location->id,
                    'name' => $this->office->location->name,
                ] : null,
            ] : null),
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'redirect' => $this->homePath(),
        ];
    }
}
