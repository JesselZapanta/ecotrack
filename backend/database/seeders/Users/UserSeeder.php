<?php

namespace Database\Seeders\Users;

use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $offices = Office::pluck('id', 'name');

        $users = [
            [
                'name' => 'Admin TCGC',
                'username' => 'admin',
                'email' => 'admin@tcgc.edu.ph',
                'role' => User::ROLE_ADMIN,
                'office' => "College President's Office",
            ],
            [
                'name' => 'Mang Ben',
                'username' => 'ben',
                'email' => 'ben@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
                'office' => null,
            ],
            [
                'name' => 'Ate Cora',
                'username' => 'cora',
                'email' => 'cora@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
                'office' => null,
            ],
            [
                'name' => 'Office - Education',
                'username' => 'educ',
                'email' => 'educ@tcgc.edu.ph',
                'role' => User::ROLE_OFFICE,
                'office' => 'Institute of Teacher Education',
            ],
            [
                'name' => 'Office - Business',
                'username' => 'business',
                'email' => 'business@tcgc.edu.ph',
                'role' => User::ROLE_OFFICE,
                'office' => 'Institute of Business and Financial Services',
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
                    'office_id' => $user['office'] ? $offices[$user['office']] ?? null : null,
                    'is_active' => true,
                ]
            );
        }
    }
}
