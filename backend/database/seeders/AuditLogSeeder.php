<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@tcgc.edu.ph')->first();
        $ben = User::where('email', 'ben@tcgc.edu.ph')->first();

        $logs = [
            ['user' => $admin, 'action' => 'created', 'entity_type' => 'Schedule', 'entity_id' => 1, 'description' => 'Created Schedule #1', 'minutes' => 45],
            ['user' => $admin, 'action' => 'updated', 'entity_type' => 'Office', 'entity_id' => 2, 'description' => 'Updated Office #2', 'minutes' => 40],
            ['user' => $ben, 'action' => 'status_changed', 'entity_type' => 'Schedule', 'entity_id' => 3, 'description' => 'Changed status of Schedule #3 to Collected', 'minutes' => 30],
            ['user' => $admin, 'action' => 'activated', 'entity_type' => 'Location', 'entity_id' => 5, 'description' => 'Activated Location #5', 'minutes' => 20],
            ['user' => $admin, 'action' => 'deactivated', 'entity_type' => 'Waste category', 'entity_id' => 2, 'description' => 'Deactivated Waste category #2', 'minutes' => 12],
            ['user' => $ben, 'action' => 'created', 'entity_type' => 'Waste record', 'entity_id' => 1, 'description' => 'Created Waste record #1', 'minutes' => 5],
        ];

        foreach ($logs as $log) {
            AuditLog::create([
                'user_id' => $log['user']?->id,
                'action' => $log['action'],
                'entity_type' => $log['entity_type'],
                'entity_id' => $log['entity_id'],
                'description' => $log['description'],
                'meta' => null,
                'created_at' => now()->subMinutes($log['minutes']),
                'updated_at' => now()->subMinutes($log['minutes']),
            ]);
        }
    }
}
