<?php

namespace Database\Seeders;

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
