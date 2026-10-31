<?php

use App\Concerns\Controllers\ConcernController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->group(function () {
    Route::get('concerns/locations', [ConcernController::class, 'locations']);
    Route::get('concerns', [ConcernController::class, 'index']);
    Route::post('concerns', [ConcernController::class, 'store']);
    Route::get('concerns/{concern}', [ConcernController::class, 'show']);
});

Route::middleware(['auth:api', 'role:admin,maintenance'])->group(function () {
    Route::patch('concerns/{concern}/status', [ConcernController::class, 'status']);
});
