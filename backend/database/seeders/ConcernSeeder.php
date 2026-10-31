<?php

namespace Database\Seeders;

use App\Models\Concern;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConcernSeeder extends Seeder
{
    public function run(): void
    {
        $locations = Location::pluck('id', 'name');
        $users = User::get(['id', 'email', 'office_id'])->keyBy('email');

        $concerns = [
            [
                'location' => 'Main Building — Ground Floor — Left Side',
                'reporter' => 'educ@tcgc.edu.ph',
                'status' => Concern::STATUS_OPEN,
                'description' => 'Overflowing bin at the entrance — the lid no longer closes and waste is spilling onto the walkway.',
                'created_at' => now()->subDays(2),
            ],
            [
                'location' => 'Main Building — Ground Floor — Left Side',
                'reporter' => 'business@tcgc.edu.ph',
                'status' => Concern::STATUS_ACKNOWLEDGED,
                'description' => 'Sacks of residual waste were left beside the collection point overnight instead of inside the bin.',
                'created_at' => now()->subDays(3),
            ],
            [
                'location' => 'Main Building — Ground Floor — Left Side',
                'reporter' => 'educ@tcgc.edu.ph',
                'status' => Concern::STATUS_RESOLVED,
                'description' => 'Missed pickup last Friday; the bin was full and starting to smell.',
                'resolution_note' => 'Crew collected the backlog the next morning; the bin was emptied and washed.',
                'created_at' => now()->subDays(6),
                'resolved_at' => now()->subDays(5),
            ],
            [
                'location' => 'Annex Building — Ground Floor',
                'reporter' => 'ben@tcgc.edu.ph',
                'status' => Concern::STATUS_OPEN,
                'description' => 'Broken wheel on the green bin near the Annex entrance — hard to move during collection.',
                'created_at' => now()->subDay(),
            ],
            [
                'location' => 'Senior High School Building — Ground Floor',
                'reporter' => 'ben@tcgc.edu.ph',
                'status' => Concern::STATUS_RESOLVED,
                'description' => 'Improper disposal: recyclables mixed with food waste at the SHS collection point.',
                'resolution_note' => 'Recyclables were segregated and the collection point was relabelled.',
                'created_at' => now()->subDays(8),
                'resolved_at' => now()->subDays(7),
            ],
            [
                'location' => 'Main Building — Second Floor — Right Side',
                'reporter' => 'business@tcgc.edu.ph',
                'status' => Concern::STATUS_OPEN,
                'description' => 'Collection point is blocked by stacked chairs, so the crew cannot reach the bins.',
                'created_at' => now()->subHours(4),
            ],
        ];

        foreach ($concerns as $concern) {
            Concern::updateOrCreate(
                ['description' => $concern['description']],
                [
                    'location_id' => $locations[$concern['location']] ?? null,
                    'office_id' => $users[$concern['reporter']]?->office_id,
                    'reported_by' => $users[$concern['reporter']]?->id,
                    'status' => $concern['status'],
                    'resolution_note' => $concern['resolution_note'] ?? null,
                    'resolved_at' => $concern['resolved_at'] ?? null,
                    'resolved_by' => $concern['status'] === Concern::STATUS_RESOLVED
                        ? $users['admin@tcgc.edu.ph']?->id
                        : null,
                    'created_at' => $concern['created_at'],
                    'updated_at' => $concern['resolved_at'] ?? $concern['created_at'],
                ]
            );
        }
    }
}
