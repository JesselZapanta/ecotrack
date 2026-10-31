<?php

namespace Database\Seeders;

use App\Models\WasteCategory;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Biodegradable', 'color_code' => '#2E7D4F', 'description' => 'Food scraps, leaves and other compostable waste.'],
            ['name' => 'Non-biodegradable', 'color_code' => '#2A2D2B', 'description' => 'Waste that does not decompose, bound for landfill or special handling.'],
            ['name' => 'Recyclable', 'color_code' => '#E3A908', 'description' => 'Paper, plastic, metal and glass that can be reprocessed.'],
        ];

        foreach ($categories as $category) {
            WasteCategory::updateOrCreate(['name' => $category['name']], $category);
        }
    }
}
