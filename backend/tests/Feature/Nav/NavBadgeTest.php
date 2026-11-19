<?php

use App\Models\CollectionSchedule;
use App\Models\Concern;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mainBuilding = Location::create(['name' => 'Main Building', 'building' => 'Main Building']);
    $this->canteen = Location::create(['name' => 'Canteen', 'building' => 'Canteen']);

    $this->office = Office::create([
        'name' => 'Administration',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $this->mainBuilding->id,
    ]);

    $this->canteenOffice = Office::create([
        'name' => 'Canteen Office',
        'contact_person' => 'Mr. Lim',
        'location_id' => $this->canteen->id,
    ]);

    $this->admin = User::create([
        'name' => 'Admin TCGC',
        'username' => 'admin',
        'email' => 'admin@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_ADMIN,
        'office_id' => $this->office->id,
        'is_active' => true,
    ]);

    $this->ben = User::create([
        'name' => 'Mang Ben',
        'username' => 'ben',
        'email' => 'ben@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_MAINTENANCE,
        'is_active' => true,
    ]);

    $this->cora = User::create([
        'name' => 'Ate Cora',
        'username' => 'cora',
        'email' => 'cora@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_MAINTENANCE,
        'is_active' => true,
    ]);


});

function badgeConcern(User $reporter, string $status, array $overrides = []): Concern
{
    return Concern::create(array_merge([
        'location_id' => $reporter->office?->location_id ?? Location::query()->value('id'),
        'office_id' => null,
        'reported_by' => $reporter->id,
        'description' => 'Overflowing bin near the entrance.',
        'status' => $status,
    ], $overrides));
}

function badgeSchedule(array $overrides = [], array $locationIds = []): CollectionSchedule
{
    $schedule = CollectionSchedule::create(array_merge([
        'scheduled_date' => now()->toDateString(),
        'window_start' => '07:00',
        'window_end' => '09:00',
        'recurrence_rule' => 'once',
        'status' => CollectionSchedule::STATUS_SCHEDULED,
        'notes' => 'Morning run',
    ], $overrides));

    if ($locationIds) {
        $schedule->locations()->attach($locationIds);
    }

    return $schedule;
}

it('returns role-scoped badges for the admin', function () {
    badgeConcern($this->ben, Concern::STATUS_OPEN);
    badgeConcern($this->ben, Concern::STATUS_ACKNOWLEDGED);
    badgeConcern($this->ben, Concern::STATUS_RESOLVED);
    badgeConcern($this->cora, Concern::STATUS_OPEN);

    badgeSchedule(['assigned_to' => $this->ben->id, 'status' => CollectionSchedule::STATUS_MISSED], [$this->canteen->id]);
    badgeSchedule(['assigned_to' => $this->cora->id, 'status' => CollectionSchedule::STATUS_MISSED], [$this->mainBuilding->id]);
    badgeSchedule(['assigned_to' => $this->ben->id], [$this->mainBuilding->id]);

    $response = $this->actingAs($this->admin, 'api')->getJson('/api/nav-badges');

    $response->assertOk()
        ->assertJsonPath('data.concerns', 3)
        ->assertJsonPath('data.missed', 2)
        ->assertJsonMissingPath('data.today');
});

it('returns role-scoped badges for maintenance', function () {
    badgeConcern($this->ben, Concern::STATUS_OPEN);
    badgeConcern($this->cora, Concern::STATUS_ACKNOWLEDGED);

    badgeSchedule(['assigned_to' => $this->ben->id], [$this->mainBuilding->id]);
    badgeSchedule(['assigned_to' => $this->ben->id, 'status' => CollectionSchedule::STATUS_MISSED], [$this->canteen->id]);
    badgeSchedule(['assigned_to' => $this->cora->id, 'status' => CollectionSchedule::STATUS_MISSED], [$this->mainBuilding->id]);
    badgeSchedule(['assigned_to' => $this->ben->id, 'scheduled_date' => now()->addDay()->toDateString()], [$this->mainBuilding->id]);

    $response = $this->actingAs($this->ben, 'api')->getJson('/api/nav-badges');

    $response->assertOk()
        ->assertJsonPath('data.concerns', 2)
        ->assertJsonPath('data.missed', 1)
        ->assertJsonPath('data.today', 1);
});



it('keeps nav badge queries to two for every role', function () {
    badgeConcern($this->ben, Concern::STATUS_OPEN);
    badgeSchedule(['assigned_to' => $this->ben->id], [$this->mainBuilding->id]);

    foreach ([$this->admin, $this->ben] as $user) {
        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->actingAs($user, 'api')->getJson('/api/nav-badges')->assertOk();

        expect(DB::getQueryLog())->toHaveCount(2);
    }
});

it('requires authentication for nav badges', function () {
    $this->getJson('/api/nav-badges')->assertUnauthorized();
});
