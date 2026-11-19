<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['name' => 'Annex Building — Ground Floor', 'building' => 'Annex Building', 'floor_or_area' => 'Ground Floor'],
            ['name' => 'Annex Building — Second Floor', 'building' => 'Annex Building', 'floor_or_area' => 'Second Floor'],
            ['name' => 'Senior High School Building — Ground Floor', 'building' => 'Senior High School Building', 'floor_or_area' => 'Ground Floor'],
            ['name' => 'Senior High School Building — Second Floor', 'building' => 'Senior High School Building', 'floor_or_area' => 'Second Floor'],
            ['name' => 'Main Building — Ground Floor — Left Wing', 'building' => 'Main Building', 'floor_or_area' => 'Ground Floor — Left Wing'],
            ['name' => 'Main Building — Ground Floor — Right Wing', 'building' => 'Main Building', 'floor_or_area' => 'Ground Floor — Right Wing'],
            ['name' => 'Main Building — Second Floor — Left Wing', 'building' => 'Main Building', 'floor_or_area' => 'Second Floor — Left Wing'],
            ['name' => 'Main Building — Second Floor — Right Wing', 'building' => 'Main Building', 'floor_or_area' => 'Second Floor — Right Wing'],
            ['name' => 'Main Building — Third Floor', 'building' => 'Main Building', 'floor_or_area' => 'Third Floor'],
            ['name' => 'Covered Court', 'building' => 'Covered Court', 'floor_or_area' => 'Open Area'],
        ];

        foreach ($locations as $location) {
            Location::updateOrCreate(['name' => $location['name']], $location);
        }
    }
}
