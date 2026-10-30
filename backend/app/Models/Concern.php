<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Concern extends Model
{
    use HasFactory;

    public const STATUS_OPEN = 'Open';

    public const STATUS_ACKNOWLEDGED = 'Acknowledged';

    public const STATUS_RESOLVED = 'Resolved';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_ACKNOWLEDGED,
        self::STATUS_RESOLVED,
    ];

    protected $fillable = [
        'location_id',
        'office_id',
        'reported_by',
        'description',
        'photo_path',
        'status',
        'resolution_note',
        'resolved_at',
        'resolved_by',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
