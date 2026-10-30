<?php

use App\Models\CollectionSchedule;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use App\Models\WasteCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->officeLocation = Location::create(['name' => 'Admin Building', 'building' => 'Admin Building']);
    $this->office = Office::create(['name' => 'Administration', 'contact_person' => 'Ms. Cruz', 'location_id' => $this->officeLocation->id]);

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

    $this->officeUser = User::create([
        'name' => 'Office - Education',
        'username' => 'educ',
        'email' => 'educ@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $this->office->id,
        'is_active' => true,
    ]);

    $this->library = Location::create(['name' => 'Library', 'building' => 'Library', 'floor_or_area' => '2nd floor']);

    $this->educationOffice = $this->library->offices()->create([
        'name' => 'College of Education',
        'contact_person' => 'Dean Santos',
    ]);

    $this->officeUser->update(['office_id' => $this->educationOffice->id]);

    $this->canteen = Location::create(['name' => 'Canteen', 'building' => 'Canteen']);

    $this->biodegradable = WasteCategory::create(['name' => 'Biodegradable', 'color_code' => '#2E7D4F']);
    $this->recyclable = WasteCategory::create(['name' => 'Recyclable', 'color_code' => '#E3A908']);
    $this->residual = WasteCategory::create(['name' => 'Residual', 'color_code' => '#2A2D2B']);
});

function makeSchedule(array $overrides = []): CollectionSchedule
{
    $schedule = CollectionSchedule::create(array_merge([
        'scheduled_date' => now()->addDay()->format('Y-m-d'),
        'window_start' => '07:00',
        'window_end' => '09:00',
        'recurrence_rule' => 'once',
        'status' => CollectionSchedule::STATUS_SCHEDULED,
        'notes' => 'Morning run',
    ], $overrides));

    return $schedule;
}

it('lists schedules with pagination metadata and relations', function () {
    $schedule = makeSchedule(['assigned_to' => $this->ben->id]);
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach([$this->biodegradable->id, $this->recyclable->id]);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?per_page=10');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [[
                'id',
                'scheduled_date',
                'window_start',
                'window_end',
                'status',
                'assignee',
                'locations',
                'categories',
            ]],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 1);

    expect($response->json('data.0.categories'))->toHaveCount(2);
    expect($response->json('data.0.locations.0.name'))->toBe('Library');
});

it('returns all categories assigned to a schedule instead of one', function () {
    $schedule = makeSchedule();
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach([
        $this->biodegradable->id,
        $this->recyclable->id,
        $this->residual->id,
    ]);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson("/api/schedules/{$schedule->id}");

    $response->assertOk();
    expect($response->json('schedule.categories'))->toHaveCount(3);
    expect(collect($response->json('schedule.categories'))->pluck('name')->all())
        ->toBe(['Biodegradable', 'Recyclable', 'Residual']);
});

it('filters schedules by location, category and status', function () {
    $librarySchedule = makeSchedule();
    $librarySchedule->locations()->attach($this->library->id);
    $librarySchedule->categories()->attach($this->biodegradable->id);

    $canteenSchedule = makeSchedule(['notes' => 'Afternoon']);
    $canteenSchedule->locations()->attach($this->canteen->id);
    $canteenSchedule->categories()->attach($this->recyclable->id);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?location_id='.$this->library->id)
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.locations.0.name', 'Library');

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?category_id='.$this->recyclable->id)
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.locations.0.name', 'Canteen');

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?status=Collected')
        ->assertOk()
        ->assertJsonPath('meta.total', 0);
});

it('searches schedules by location and assignee name', function () {
    $schedule = makeSchedule(['assigned_to' => $this->ben->id]);
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?search=Library')
        ->assertOk()
        ->assertJsonPath('meta.total', 1);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?search=Ben')
        ->assertOk()
        ->assertJsonPath('meta.total', 1);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/schedules?search=Nobody')
        ->assertOk()
        ->assertJsonPath('meta.total', 0);
});

it('creates a schedule with multiple categories and locations', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/schedules', [
            'scheduled_date' => '2026-11-02',
            'window_start' => '07:00',
            'window_end' => '09:30',
            'recurrence_rule' => 'weekly',
            'assigned_to' => $this->ben->id,
            'location_ids' => [$this->library->id, $this->canteen->id],
            'category_ids' => [$this->biodegradable->id, $this->recyclable->id, $this->residual->id],
            'notes' => 'Full sweep',
        ]);

    $response->assertCreated()
        ->assertJsonPath('schedule.status', 'Scheduled')
        ->assertJsonPath('schedule.assignee.name', 'Mang Ben');

    expect($response->json('schedule.categories'))->toHaveCount(3);
    expect($response->json('schedule.locations'))->toHaveCount(2);

    $schedule = CollectionSchedule::firstOrFail();
    expect($schedule->categories()->count())->toBe(3);
    expect($schedule->locations()->count())->toBe(2);
    expect($schedule->statusHistories()->count())->toBe(1);
});

it('validates schedule fields', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/schedules', [
            'scheduled_date' => 'not-a-date',
            'window_start' => '09:00',
            'window_end' => '07:00',
            'location_ids' => [],
            'category_ids' => [],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['scheduled_date', 'window_end', 'location_ids', 'category_ids']);
});

it('rejects an assignee who is not maintenance', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/schedules', [
            'scheduled_date' => '2026-11-02',
            'window_start' => '07:00',
            'window_end' => '09:00',
            'assigned_to' => $this->officeUser->id,
            'location_ids' => [$this->library->id],
            'category_ids' => [$this->biodegradable->id],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'Assignee must be a maintenance account.');
});

it('updates a schedule and replaces categories', function () {
    $schedule = makeSchedule();
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $response = $this->actingAs($this->admin, 'api')
        ->patchJson("/api/schedules/{$schedule->id}", [
            'window_end' => '10:30',
            'category_ids' => [$this->recyclable->id, $this->residual->id],
        ]);

    $response->assertOk()
        ->assertJsonPath('schedule.window_end', '10:30');

    expect($response->json('schedule.categories'))->toHaveCount(2);
    expect($schedule->fresh()->categories()->pluck('name')->sort()->values()->all())
        ->toBe(['Recyclable', 'Residual']);
});

it('deletes a schedule and its pivot rows', function () {
    $schedule = makeSchedule();
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $this->actingAs($this->admin, 'api')
        ->deleteJson("/api/schedules/{$schedule->id}")
        ->assertOk();

    expect(CollectionSchedule::count())->toBe(0);
    $this->assertDatabaseCount('schedule_location', 0);
    $this->assertDatabaseCount('schedule_category', 0);
});

it('scopes schedules to the assigned maintenance account', function () {
    $benSchedule = makeSchedule(['assigned_to' => $this->ben->id]);
    $benSchedule->locations()->attach($this->library->id);
    $benSchedule->categories()->attach($this->biodegradable->id);

    $coraSchedule = makeSchedule(['assigned_to' => $this->cora->id, 'notes' => 'Cora run']);
    $coraSchedule->locations()->attach($this->canteen->id);
    $coraSchedule->categories()->attach($this->recyclable->id);

    $this->actingAs($this->ben, 'api')
        ->getJson('/api/schedules')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.assignee.name', 'Mang Ben');
});

it('scopes schedules to the office location', function () {
    $librarySchedule = makeSchedule();
    $librarySchedule->locations()->attach($this->library->id);
    $librarySchedule->categories()->attach($this->biodegradable->id);

    $canteenSchedule = makeSchedule(['notes' => 'Other']);
    $canteenSchedule->locations()->attach($this->canteen->id);
    $canteenSchedule->categories()->attach($this->recyclable->id);

    $this->actingAs($this->officeUser, 'api')
        ->getJson('/api/schedules')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.locations.0.name', 'Library');
});

it('lets the assigned maintenance account update status and logs history', function () {
    $schedule = makeSchedule(['assigned_to' => $this->ben->id]);
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/schedules/{$schedule->id}/status", ['status' => 'Collected'])
        ->assertOk()
        ->assertJsonPath('schedule.status', 'Collected');

    expect($schedule->statusHistories()->count())->toBe(1);
    expect($schedule->statusHistories()->first()->changed_by)->toBe($this->ben->id);
});

it('blocks maintenance from updating another assignee schedule', function () {
    $schedule = makeSchedule(['assigned_to' => $this->cora->id]);
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/schedules/{$schedule->id}/status", ['status' => 'Collected'])
        ->assertForbidden();
});

it('requires a remark when marking a schedule as missed', function () {
    $schedule = makeSchedule(['assigned_to' => $this->ben->id]);
    $schedule->locations()->attach($this->library->id);
    $schedule->categories()->attach($this->biodegradable->id);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/schedules/{$schedule->id}/status", ['status' => 'Missed'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['remark']);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/schedules/{$schedule->id}/status", [
            'status' => 'Missed',
            'remark' => 'Rain',
        ])
        ->assertOk()
        ->assertJsonPath('schedule.status', 'Missed');
});

it('blocks office users from creating schedules', function () {
    $this->actingAs($this->officeUser, 'api')
        ->postJson('/api/schedules', [
            'scheduled_date' => '2026-11-02',
            'window_start' => '07:00',
            'window_end' => '09:00',
            'location_ids' => [$this->library->id],
            'category_ids' => [$this->biodegradable->id],
        ])
        ->assertForbidden();
});


