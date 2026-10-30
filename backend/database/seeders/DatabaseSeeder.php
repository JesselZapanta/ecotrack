<?php

namespace Database\Seeders;

use Database\Seeders\Audit\AuditLogSeeder;
use Database\Seeders\Categories\CategorySeeder;
use Database\Seeders\Concerns\ConcernSeeder;
use Database\Seeders\Locations\LocationSeeder;
use Database\Seeders\Offices\OfficeSeeder;
use Database\Seeders\Schedules\ScheduleSeeder;
use Database\Seeders\Users\UserSeeder;
use Database\Seeders\WasteRecords\WasteRecordSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            LocationSeeder::class,
            OfficeSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ScheduleSeeder::class,
            WasteRecordSeeder::class,
            ConcernSeeder::class,
            AuditLogSeeder::class,
        ]);
    }
}
