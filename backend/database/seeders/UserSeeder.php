<?php

namespace Database\Seeders;

use App\Models\Office;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

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
                'office' => 'PFOM Office',
            ],
            [
                'name' => 'Mang Ben',
                'username' => 'ben',
                'email' => 'ben@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
                'office' => 'PFOM Office',
            ],
            [
                'name' => 'Ate Cora',
                'username' => 'cora',
                'email' => 'cora@tcgc.edu.ph',
                'role' => User::ROLE_MAINTENANCE,
                'office' => 'PFOM Office',
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
            [
                'name' => 'ICS Office',
                'username' => 'ics',
                'email' => 'ics@tcgc.edu.ph',
                'role' => User::ROLE_OFFICE,
                'office' => 'Institute of Computer Studies',
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

        $this->seedOfficeUsers();
    }

    private function seedOfficeUsers(): void
    {
        $officeUsers = Office::query()
            ->where('type', 'Office')
            ->orderBy('name')
            ->get();

        foreach ($officeUsers as $office) {
            $exists = User::query()
                ->where('office_id', $office->id)
                ->where('role', User::ROLE_OFFICE)
                ->exists();

            if ($exists) {
                continue;
            }

            $base = Str::slug($office->name) ?: 'office-'.$office->id;
            $username = $base;
            $suffix = 2;

            while (
                User::query()
                    ->where('username', $username)
                    ->orWhere('email', $username.'@tcgc.edu.ph')
                    ->exists()
            ) {
                $username = $base.'-'.$suffix;
                $suffix++;
            }

            User::create([
                'name' => $office->name,
                'username' => $username,
                'email' => $username.'@tcgc.edu.ph',
                'password' => 'password',
                'role' => User::ROLE_OFFICE,
                'office_id' => $office->id,
                'is_active' => true,
            ]);
        }
    }
}
