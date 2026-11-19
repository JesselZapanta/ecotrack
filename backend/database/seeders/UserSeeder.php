<?php

namespace Database\Seeders;

use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $officeId = Office::where('name', 'PFOM Office')->value('id');

        $users = [
            [
                'name' => 'Admin TCGC',
                'username' => 'admin',
                'email' => 'admin@tcgc.edu.ph',
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Mang Ben',
                'username' => 'ben',
                'email' => 'ben@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
            ],
            [
                'name' => 'Ate Cora',
                'username' => 'cora',
                'email' => 'cora@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'username' => $user['username'],
                    'password' => 'password',
                    'role' => $user['role'],
                    'office_id' => $officeId,
                    'is_active' => true,
                ]
            );
        }
    }
}
