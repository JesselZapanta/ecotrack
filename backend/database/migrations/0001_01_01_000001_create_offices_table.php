<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('floor')->nullable();
            $table->string('type', 50)->default('Office');
            $table->string('status', 20)->default('Active');
            $table->string('contact_person')->nullable();
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->timestamps();

            $table->unique(['name', 'location_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offices');
    }
};
