<?php

namespace Database\Seeders\Offices;

use App\Models\Location;
use App\Models\Office;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder
{
    public function run(): void
    {
        $locations = Location::pluck('id', 'name');

        foreach ($this->groups() as $locationName => $rooms) {
            $locationId = $locations[$locationName] ?? null;

            if (! $locationId) {
                continue;
            }

            foreach ($rooms as $room) {
                Office::updateOrCreate(
                    ['name' => $room['room_name'], 'location_id' => $locationId],
                    [
                        'floor' => $room['floor'],
                        'type' => $room['type'],
                        'status' => $room['status'],
                        'contact_person' => null,
                    ]
                );
            }
        }
    }

    private function groups(): array
    {
        return [
            'Annex Building — Ground Floor' => [
                ['room_name' => 'AB-102', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-103', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-104', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-105', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'ROTC Office', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'ARMORY', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Crim Lab', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Crim Lab 1', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Crim Lab 2', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Crim Lab 3', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Crim Lab 4', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Annex Ground Floor)', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Annex Building — Second Floor' => [
                ['room_name' => 'AB-201', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-202', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-203', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-204', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-205', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-206', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-207', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-208', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-209', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'AB-210', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Annex Second Floor)', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Senior High School Building — Ground Floor' => [
                ['room_name' => 'SHS-101', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'SHS-102', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Rest Room (SHS Ground Floor)', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Senior High School Building — Second Floor' => [
                ['room_name' => 'SHS-201', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'SHS-202', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Rest Room (SHS Second Floor)', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Main Building — Ground Floor — Left Side' => [
                ['room_name' => 'OJT & Placement Alumni Affairs', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Scholarship & Welfare Office', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Records Section', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'College Registrar', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Accounting & Cashier', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'VP for Administration and Finance', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Security Services NC II Assessment Center', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Criminal Justice Education', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Student Affairs Office', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Computer Studies', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'GADTC Development Training Center', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Midwifery', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Business and Financial Services', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Teacher Education', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Institute of Arts and Sciences', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Main Ground Floor Left)', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Food Court', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Main Building — Ground Floor — Right Side' => [
                ['room_name' => 'Medical and Dental Clinic', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'MB-105', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-103 (Demo Room)', 'floor' => 'Ground Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-102 (Midwifery Skills Laboratory)', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'PFOM', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Maintenance/Student Assistant', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Dance Studio', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Music Room', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Audio Visual Room', 'floor' => 'Ground Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'College Information System Office', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Quality Management Development Office', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Accreditation Room', 'floor' => 'Ground Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Main Ground Floor Right)', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Elevator (Main Ground Floor)', 'floor' => 'Ground Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Main Building — Second Floor — Left Side' => [
                ['room_name' => 'VP for Academic Affairs', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => "Dean's Office", 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'MB-214', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-212', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-210 (Steno Lab)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-208', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-206 (Business Center)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-204', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Moot Court', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Guidance Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'MB-203 (Computer Laboratory 5)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-205 (Computer Laboratory 4)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-207 (Computer Laboratory 3)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-209 (Computer Laboratory 2)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-209 (Math Lab)', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Main Second Floor Left)', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'VIP Lounge', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => "Visitor's Lounge", 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Elevator (Main Second Floor)', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Main Building — Second Floor — Right Side' => [
                ['room_name' => 'Faculty & Staff Lounge', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Speech Laboratory', 'floor' => 'Second Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-208 (Second Floor Right)', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-226 (Demo Room)', 'floor' => 'Second Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'College Athletics Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Executive Vice President Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'VP for Planning Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Supply & Property Management Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Faculty Room', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Human Resource Office', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Board Room', 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => "College President's Office", 'floor' => 'Second Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Main Second Floor Right)', 'floor' => 'Second Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
            'Main Building — Third Floor' => [
                ['room_name' => 'Community and Academic Extension Services Office', 'floor' => 'Third Floor', 'type' => 'Office', 'status' => 'Active'],
                ['room_name' => 'MB-307', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-306', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-305', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-304', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'MB-303', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Science Laboratory', 'floor' => 'Third Floor', 'type' => 'Laboratory', 'status' => 'Active'],
                ['room_name' => 'MB-301', 'floor' => 'Third Floor', 'type' => 'Lecture Room', 'status' => 'Active'],
                ['room_name' => 'Library Extension 1', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Library', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Library Extension 2', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Chapel', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Rest Rooms (Main Third Floor)', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Activity Hall', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
                ['room_name' => 'Elevator (Main Third Floor)', 'floor' => 'Third Floor', 'type' => 'Facility', 'status' => 'Active'],
            ],
        ];
    }
}
