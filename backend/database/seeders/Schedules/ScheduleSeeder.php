<?php

namespace Database\Seeders\Schedules;

use App\Models\CollectionSchedule;
use App\Models\Location;
use App\Models\User;
use App\Models\WasteCategory;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@tcgc.edu.ph')->first();
        $ben = User::where('email', 'ben@tcgc.edu.ph')->first();
        $cora = User::where('email', 'cora@tcgc.edu.ph')->first();

        if (! $ben || ! $cora) {
            return;
        }

        $locations = Location::pluck('id', 'name');
        $categories = WasteCategory::pluck('id', 'name');

        $today = now()->format('Y-m-d');
        $tomorrow = now()->addDay()->format('Y-m-d');
        $yesterday = now()->subDay()->format('Y-m-d');

        $schedules = [
            [
                'scheduled_date' => $tomorrow,
                'window_start' => '07:00',
                'window_end' => '09:00',
                'recurrence_rule' => 'once',
                'assignee' => $ben->id,
                'status' => CollectionSchedule::STATUS_SCHEDULED,
                'notes' => 'Main lobby pickup',
                'locations' => ['Main Building — Ground Floor — Left Side'],
                'categories' => ['Recyclable'],
            ],
            [
                'scheduled_date' => $today,
                'window_start' => '07:00',
                'window_end' => '09:00',
                'recurrence_rule' => 'once',
                'assignee' => $ben->id,
                'status' => CollectionSchedule::STATUS_SCHEDULED,
                'notes' => 'Morning canteen run',
                'locations' => ['Main Building — Ground Floor — Left Side'],
                'categories' => ['Biodegradable'],
            ],
            [
                'scheduled_date' => $today,
                'window_start' => '09:30',
                'window_end' => '11:00',
                'recurrence_rule' => null,
                'assignee' => $ben->id,
                'status' => CollectionSchedule::STATUS_COLLECTED,
                'notes' => null,
                'locations' => ['Main Building — Third Floor'],
                'categories' => ['Recyclable'],
            ],
            [
                'scheduled_date' => $yesterday,
                'window_start' => '07:00',
                'window_end' => '09:00',
                'recurrence_rule' => null,
                'assignee' => $ben->id,
                'status' => CollectionSchedule::STATUS_SCHEDULED,
                'notes' => 'Still pending — shows as overdue',
                'locations' => ['Main Building — Ground Floor — Left Side'],
                'categories' => ['Biodegradable'],
            ],
            [
                'scheduled_date' => $yesterday,
                'window_start' => '07:00',
                'window_end' => '09:00',
                'recurrence_rule' => null,
                'assignee' => $cora->id,
                'status' => CollectionSchedule::STATUS_MISSED,
                'notes' => 'Rain, reschedule requested',
                'locations' => ['Main Building — Third Floor'],
                'categories' => ['Non-biodegradable'],
            ],
            [
                'scheduled_date' => $tomorrow,
                'window_start' => '07:00',
                'window_end' => '09:00',
                'recurrence_rule' => 'weekly',
                'assignee' => $ben->id,
                'status' => CollectionSchedule::STATUS_SCHEDULED,
                'notes' => 'Covered court — all bins',
                'locations' => ['Main Building — Ground Floor — Right Side'],
                'categories' => ['Biodegradable', 'Recyclable'],
            ],
            [
                'scheduled_date' => $yesterday,
                'window_start' => '13:00',
                'window_end' => '15:00',
                'recurrence_rule' => null,
                'assignee' => $cora->id,
                'status' => CollectionSchedule::STATUS_COLLECTED,
                'notes' => null,
                'locations' => ['Main Building — Third Floor'],
                'categories' => ['Non-biodegradable'],
            ],
            [
                'scheduled_date' => $tomorrow,
                'window_start' => '14:00',
                'window_end' => '15:30',
                'recurrence_rule' => 'once',
                'assignee' => $cora->id,
                'status' => CollectionSchedule::STATUS_SCHEDULED,
                'notes' => 'Admin building — full sweep, all categories',
                'locations' => ['Main Building — Second Floor — Right Side'],
                'categories' => ['Biodegradable', 'Recyclable', 'Non-biodegradable'],
            ],
        ];

        foreach ($schedules as $entry) {
            $schedule = CollectionSchedule::updateOrCreate(
                [
                    'scheduled_date' => $entry['scheduled_date'],
                    'window_start' => $entry['window_start'],
                    'assigned_to' => $entry['assignee'],
                    'notes' => $entry['notes'],
                ],
                [
                    'window_end' => $entry['window_end'],
                    'recurrence_rule' => $entry['recurrence_rule'],
                    'status' => $entry['status'],
                    'created_by' => $admin?->id,
                ]
            );

            $locationIds = collect($entry['locations'])
                ->map(fn ($name) => $locations[$name] ?? null)
                ->filter()
                ->values()
                ->all();
            $schedule->locations()->sync($locationIds);

            $categoryIds = collect($entry['categories'])
                ->map(fn ($name) => $categories[$name] ?? null)
                ->filter()
                ->values()
                ->all();
            $schedule->categories()->sync($categoryIds);

            if ($schedule->statusHistories()->count() === 0) {
                $schedule->statusHistories()->create([
                    'old_status' => null,
                    'new_status' => CollectionSchedule::STATUS_SCHEDULED,
                    'changed_by' => $admin?->id,
                ]);

                if ($entry['status'] !== CollectionSchedule::STATUS_SCHEDULED) {
                    $schedule->statusHistories()->create([
                        'old_status' => CollectionSchedule::STATUS_SCHEDULED,
                        'new_status' => $entry['status'],
                        'changed_by' => $entry['assignee'],
                        'remark' => $entry['status'] === CollectionSchedule::STATUS_MISSED ? 'Rain' : null,
                    ]);
                }
            }
        }
    }
}
