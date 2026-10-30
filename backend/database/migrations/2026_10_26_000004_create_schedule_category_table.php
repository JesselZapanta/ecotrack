<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_category', function (Blueprint $table) {
            $table->foreignId('schedule_id')->constrained('collection_schedules')->cascadeOnDelete();
            $table->foreignId('waste_category_id')->constrained('waste_categories')->cascadeOnDelete();
            $table->primary(['schedule_id', 'waste_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_category');
    }
};
