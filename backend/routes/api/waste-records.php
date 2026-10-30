<?php

use App\Admin\WasteRecords\Controllers\WasteRecordController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api'])->group(function () {
    Route::get('waste-records', [WasteRecordController::class, 'index']);
    Route::get('waste-records/{wasteRecord}', [WasteRecordController::class, 'show']);
});

Route::middleware(['auth:api', 'role:admin,maintenance'])->group(function () {
    Route::post('waste-records', [WasteRecordController::class, 'store']);
});

Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::patch('waste-records/{wasteRecord}', [WasteRecordController::class, 'update']);
    Route::delete('waste-records/{wasteRecord}', [WasteRecordController::class, 'destroy']);
});
