<?php

namespace App\Models;

use Database\Factories\WasteCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WasteCategory extends Model
{
    /** @use HasFactory<WasteCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'color_code',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function schedules(): BelongsToMany
    {
        return $this->belongsToMany(CollectionSchedule::class, 'schedule_category', 'waste_category_id', 'schedule_id');
    }
}
