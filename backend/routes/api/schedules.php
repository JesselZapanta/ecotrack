<?php

use App\Admin\Schedules\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->group(function () {
    Route::get('schedules', [ScheduleController::class, 'index']);
    Route::post('schedules/sweep', [ScheduleController::class, 'sweep']);
    Route::get('schedules/{schedule}', [ScheduleController::class, 'show']);
    Route::patch('schedules/{schedule}/status', [ScheduleController::class, 'status']);
});

Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::post('schedules', [ScheduleController::class, 'store']);
    Route::patch('schedules/{schedule}', [ScheduleController::class, 'update']);
    Route::delete('schedules/{schedule}', [ScheduleController::class, 'destroy']);
});
