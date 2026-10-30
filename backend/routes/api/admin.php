<?php

use App\Admin\Categories\Controllers\CategoryController;
use App\Admin\Locations\Controllers\LocationController;
use App\Admin\Offices\Controllers\OfficeController;
use App\Admin\Users\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);
    Route::patch('users/{user}/status', [UserController::class, 'status']);
    Route::patch('users/{user}', [UserController::class, 'update']);

    Route::get('offices', [OfficeController::class, 'index']);
    Route::post('offices', [OfficeController::class, 'store']);
    Route::patch('offices/{office}/status', [OfficeController::class, 'status']);
    Route::patch('offices/{office}', [OfficeController::class, 'update']);

    Route::get('locations', [LocationController::class, 'index']);
    Route::post('locations', [LocationController::class, 'store']);
    Route::patch('locations/{location}/status', [LocationController::class, 'status']);
    Route::patch('locations/{location}', [LocationController::class, 'update']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::patch('categories/{category}/status', [CategoryController::class, 'status']);
    Route::patch('categories/{category}', [CategoryController::class, 'update']);
});
