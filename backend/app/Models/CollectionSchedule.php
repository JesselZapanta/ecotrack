<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionSchedule extends Model
{
    public const STATUS_SCHEDULED = 'Scheduled';

    public const STATUS_COLLECTED = 'Collected';

    public const STATUS_MISSED = 'Missed';

    public const STATUS_CANCELLED = 'Cancelled';

    public const STATUSES = [
        self::STATUS_SCHEDULED,
        self::STATUS_COLLECTED,
        self::STATUS_MISSED,
        self::STATUS_CANCELLED,
    ];

    protected $fillable = [
        'scheduled_date',
        'window_start',
        'window_end',
        'recurrence_rule',
        'assigned_to',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date:Y-m-d',
        ];
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'schedule_location', 'collection_schedule_id', 'location_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(WasteCategory::class, 'schedule_category', 'schedule_id', 'waste_category_id');
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(StatusHistory::class)->orderByDesc('created_at');
    }

}
