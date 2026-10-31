<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Office extends Model
{
    use HasFactory;

    public const TYPE_OFFICE = 'Office';

    public const TYPE_LECTURE_ROOM = 'Lecture Room';

    public const TYPE_LABORATORY = 'Laboratory';

    public const TYPE_FACILITY = 'Facility';

    public const TYPES = [
        self::TYPE_OFFICE,
        self::TYPE_LECTURE_ROOM,
        self::TYPE_LABORATORY,
        self::TYPE_FACILITY,
    ];

    protected $fillable = [
        'name',
        'floor',
        'type',
        'status',
        'contact_person',
        'location_id',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
