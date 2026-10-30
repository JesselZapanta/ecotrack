<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_location', function (Blueprint $table) {
            $table->foreignId('collection_schedule_id')->constrained('collection_schedules')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->primary(['collection_schedule_id', 'location_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_location');
    }
};
