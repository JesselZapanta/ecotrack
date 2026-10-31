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
            ['name' => 'Main Building — Ground Floor — Left Side', 'building' => 'Main Building', 'floor_or_area' => 'Ground Floor — Left Side'],
            ['name' => 'Main Building — Ground Floor — Right Side', 'building' => 'Main Building', 'floor_or_area' => 'Ground Floor — Right Side'],
            ['name' => 'Main Building — Second Floor — Left Side', 'building' => 'Main Building', 'floor_or_area' => 'Second Floor — Left Side'],
            ['name' => 'Main Building — Second Floor — Right Side', 'building' => 'Main Building', 'floor_or_area' => 'Second Floor — Right Side'],
            ['name' => 'Main Building — Third Floor', 'building' => 'Main Building', 'floor_or_area' => 'Third Floor'],
        ];

        foreach ($locations as $location) {
            Location::updateOrCreate(['name' => $location['name']], $location);
        }
    }
}
