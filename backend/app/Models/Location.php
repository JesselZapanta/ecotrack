<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'building',
        'floor_or_area',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function offices(): HasMany
    {
        return $this->hasMany(Office::class);
    }

    public function schedules(): BelongsToMany
    {
        return $this->belongsToMany(CollectionSchedule::class, 'schedule_location', 'location_id', 'collection_schedule_id');
    }
}
