<?php

namespace Database\Seeders\WasteRecords;

use App\Models\CollectionSchedule;
use App\Models\User;
use App\Models\WasteRecord;
use Illuminate\Database\Seeder;

class WasteRecordSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@tcgc.edu.ph')->first();

        // Waste records only exist for collected schedules.
        $collected = CollectionSchedule::query()
            ->where('status', CollectionSchedule::STATUS_COLLECTED)
            ->with(['locations:id', 'categories:id'])
            ->orderBy('scheduled_date')
            ->get();

        $quantities = [12.50, 6.20, 8.00, 1.40, 9.30];

        foreach ($collected as $index => $schedule) {
            $location = $schedule->locations->first();
            $category = $schedule->categories->first();

            if (! $location || ! $category) {
                continue;
            }

            WasteRecord::updateOrCreate(
                ['schedule_id' => $schedule->id],
                [
                    'location_id' => $location->id,
                    'category_id' => $category->id,
                    'date' => $schedule->scheduled_date instanceof \Carbon\CarbonInterface
                        ? $schedule->scheduled_date->format('Y-m-d')
                        : substr((string) $schedule->scheduled_date, 0, 10),
                    'quantity_kg' => $quantities[$index % count($quantities)],
                    'remarks' => null,
                    'created_by' => $admin?->id,
                ]
            );
        }
    }
}
