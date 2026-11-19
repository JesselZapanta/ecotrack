<?php

use App\Concerns\Controllers\NavBadgeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    Route::get('nav-badges', [NavBadgeController::class, 'index']);
});
