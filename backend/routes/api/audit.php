<?php

use App\Admin\Audit\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('audit-logs', [AuditLogController::class, 'index']);
});
