<?php

namespace App\Providers;

use App\Models\CollectionSchedule;
use App\Models\Concern;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use App\Models\WasteCategory;
use App\Models\WasteRecord;
use App\Observers\AuditObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $observer = AuditObserver::class;

        User::observe($observer);
        Office::observe($observer);
        Location::observe($observer);
        WasteCategory::observe($observer);
        CollectionSchedule::observe($observer);
        WasteRecord::observe($observer);
        Concern::observe($observer);
    }
}
