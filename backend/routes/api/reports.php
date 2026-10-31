<?php

use App\Admin\Reports\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'role:admin,office,maintenance'])->group(function () {
    Route::get('reports/options', [ReportController::class, 'options']);
    Route::get('reports/waste-summary/pdf', [ReportController::class, 'pdf']);
    Route::get('reports/waste-summary', [ReportController::class, 'summary']);
});
