<?php

use App\Models\CollectionSchedule;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use App\Models\WasteCategory;
use App\Models\WasteRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->main = Location::create(['name' => 'Main Building', 'building' => 'Main Building']);
    $this->canteen = Location::create(['name' => 'Canteen', 'building' => 'Canteen']);

    $office = Office::create([
        'name' => 'Administration',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $this->main->id,
    ]);

    $this->admin = User::create([
        'name' => 'Admin TCGC',
        'username' => 'admin',
        'email' => 'admin@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_ADMIN,
        'office_id' => $office->id,
        'is_active' => true,
    ]);

    $this->officeUser = User::create([
        'name' => 'Office - Education',
        'username' => 'educ',
        'email' => 'educ@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $office->id,
        'is_active' => true,
    ]);

    $this->maintenance = User::create([
        'name' => 'Mang Ben',
        'username' => 'ben',
        'email' => 'ben@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_MAINTENANCE,
        'is_active' => true,
    ]);

    $this->bio = WasteCategory::create(['name' => 'Biodegradable', 'color_code' => '#2E7D4F']);
    $this->recycle = WasteCategory::create(['name' => 'Recyclable', 'color_code' => '#E3A908']);

    WasteRecord::create([
        'location_id' => $this->main->id,
        'category_id' => $this->bio->id,
        'date' => '2026-10-05',
        'quantity_kg' => 10,
        'created_by' => $this->admin->id,
    ]);

    WasteRecord::create([
        'location_id' => $this->main->id,
        'category_id' => $this->recycle->id,
        'date' => '2026-10-06',
        'quantity_kg' => 5,
        'created_by' => $this->admin->id,
    ]);

    WasteRecord::create([
        'location_id' => $this->canteen->id,
        'category_id' => $this->bio->id,
        'date' => '2026-10-07',
        'quantity_kg' => 7,
        'created_by' => $this->admin->id,
    ]);

    WasteRecord::create([
        'location_id' => $this->main->id,
        'category_id' => $this->bio->id,
        'date' => '2026-09-30',
        'quantity_kg' => 99,
        'created_by' => $this->admin->id,
    ]);
});

function makeReportSchedule(string $date, string $status, ?int $assignedTo = null): CollectionSchedule
{
    return CollectionSchedule::create([
        'scheduled_date' => $date,
        'window_start' => '07:00',
        'window_end' => '09:00',
        'recurrence_rule' => 'once',
        'assigned_to' => $assignedTo,
        'status' => $status,
    ]);
}

it('builds a waste summary for the selected period', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31');

    $response->assertOk()
        ->assertJsonPath('report.summary.records', 3)
        ->assertJsonPath('report.filters.location', null)
        ->assertJsonPath('report.filters.category', null)
        ->assertJsonPath('report.generated_by.name', 'Admin TCGC')
        ->assertJsonPath('report.scope', 'All waste records and schedules');

    $report = $response->json('report');

    expect((float) $report['summary']['total_kg'])->toBe(22.0);
    expect((float) $report['summary']['average_kg'])->toEqual(7.33);

    $byCategory = collect($report['summary']['by_category'])->keyBy('name');
    expect($byCategory)->toHaveCount(2);
    expect((float) $byCategory['Biodegradable']['kg'])->toBe(17.0);
    expect($byCategory['Biodegradable']['records'])->toBe(2);
    expect((float) $byCategory['Recyclable']['kg'])->toBe(5.0);
    expect((float) $byCategory['Recyclable']['share'])->toEqual(22.7);

    $byLocation = collect($report['summary']['by_location'])->keyBy('name');
    expect($byLocation)->toHaveCount(2);
    expect((float) $byLocation['Main Building']['kg'])->toBe(15.0);
    expect((float) $byLocation['Canteen']['kg'])->toBe(7.0);
});

it('filters waste records by location and category', function () {
    $byLocation = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31&location_id='.$this->main->id)
        ->assertOk()
        ->json('report');

    expect((float) $byLocation['summary']['total_kg'])->toBe(15.0);
    expect($byLocation['summary']['records'])->toBe(2);
    expect($byLocation['filters']['location']['name'])->toBe('Main Building');

    $byCategory = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31&category_id='.$this->bio->id)
        ->assertOk()
        ->json('report');

    expect((float) $byCategory['summary']['total_kg'])->toBe(17.0);
    expect($byCategory['summary']['records'])->toBe(2);
    expect($byCategory['filters']['category']['name'])->toBe('Biodegradable');
});

it('counts schedules by status within the filters', function () {
    $collected = makeReportSchedule('2026-10-10', CollectionSchedule::STATUS_COLLECTED);
    $collected->locations()->attach($this->main->id);
    $collected->categories()->attach($this->bio->id);

    $missed = makeReportSchedule('2026-10-12', CollectionSchedule::STATUS_MISSED);
    $missed->locations()->attach($this->canteen->id);
    $missed->categories()->attach($this->recycle->id);

    $scheduled = makeReportSchedule('2026-10-15', CollectionSchedule::STATUS_SCHEDULED);
    $scheduled->locations()->attach($this->main->id);
    $scheduled->categories()->attach([$this->bio->id, $this->recycle->id]);

    $outOfRange = makeReportSchedule('2026-09-01', CollectionSchedule::STATUS_CANCELLED);
    $outOfRange->locations()->attach($this->main->id);
    $outOfRange->categories()->attach($this->bio->id);

    $report = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31')
        ->assertOk()
        ->json('report');

    expect($report['collections']['counts'])->toMatchArray([
        'Scheduled' => 1,
        'Collected' => 1,
        'Missed' => 1,
        'Cancelled' => 0,
    ]);
    expect($report['collections']['total'])->toBe(3);

    $mainReport = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31&location_id='.$this->main->id)
        ->assertOk()
        ->json('report');

    expect($mainReport['collections']['total'])->toBe(2);
    expect($mainReport['collections']['counts']['Collected'])->toBe(1);
    expect($mainReport['collections']['counts']['Scheduled'])->toBe(1);

    $bioReport = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31&category_id='.$this->bio->id)
        ->assertOk()
        ->json('report');

    expect($bioReport['collections']['total'])->toBe(2);
});

it('validates the report filters', function () {
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['date_from', 'date_to']);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-31&date_to=2026-10-01')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('date_to');
});

it('scopes office reports to their office location', function () {
    $report = $this->actingAs($this->officeUser, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31&location_id='.$this->canteen->id)
        ->assertOk()
        ->json('report');

    expect((float) $report['summary']['total_kg'])->toBe(15.0);
    expect($report['summary']['records'])->toBe(2);
    expect($report['filters']['location']['name'])->toBe('Main Building');

    $this->actingAs($this->officeUser, 'api')
        ->get('/api/reports/waste-summary/pdf?date_from=2026-10-01&date_to=2026-10-31')
        ->assertOk();
});

it('returns role-scoped report options', function () {
    $officeOptions = $this->actingAs($this->officeUser, 'api')
        ->getJson('/api/reports/options')
        ->assertOk()
        ->json();

    expect($officeOptions['locations'])->toHaveCount(1);
    expect($officeOptions['locations'][0]['name'])->toBe('Main Building');
    expect($officeOptions['categories'])->toHaveCount(2);

    $adminOptions = $this->actingAs($this->admin, 'api')
        ->getJson('/api/reports/options')
        ->assertOk()
        ->json();

    expect($adminOptions['locations'])->toHaveCount(2);
});

it('scopes maintenance reports to their own work', function () {
    WasteRecord::create([
        'location_id' => $this->canteen->id,
        'category_id' => $this->bio->id,
        'date' => '2026-10-08',
        'quantity_kg' => 3,
        'created_by' => $this->maintenance->id,
    ]);

    $mine = makeReportSchedule('2026-10-09', CollectionSchedule::STATUS_COLLECTED, $this->maintenance->id);
    $mine->locations()->attach($this->main->id);
    $mine->categories()->attach($this->bio->id);

    $other = makeReportSchedule('2026-10-10', CollectionSchedule::STATUS_SCHEDULED, $this->admin->id);
    $other->locations()->attach($this->main->id);
    $other->categories()->attach($this->bio->id);

    $report = $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31')
        ->assertOk()
        ->json('report');

    expect((float) $report['summary']['total_kg'])->toBe(3.0);
    expect($report['summary']['records'])->toBe(1);
    expect($report['collections']['total'])->toBe(1);
    expect($report['collections']['counts']['Collected'])->toBe(1);
    expect($report['scope'])->toContain('Assigned collections');

    $this->actingAs($this->maintenance, 'api')
        ->get('/api/reports/waste-summary/pdf?date_from=2026-10-01&date_to=2026-10-31')
        ->assertOk();
});

it('returns report options for maintenance', function () {
    $options = $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/reports/options')
        ->assertOk()
        ->json();

    expect($options['locations'])->toHaveCount(2);
    expect($options['categories'])->toHaveCount(2);
});

it('requires authentication for reports', function () {
    $this->getJson('/api/reports/waste-summary?date_from=2026-10-01&date_to=2026-10-31')
        ->assertUnauthorized();
});

it('downloads the filtered report as a pdf', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->get('/api/reports/waste-summary/pdf?date_from=2026-10-01&date_to=2026-10-31&location_id='.$this->main->id);

    $response->assertOk();

    expect($response->headers->get('content-type'))->toContain('application/pdf');
    expect($response->headers->get('content-disposition'))
        ->toContain('ecotrack-report-2026-10-01-to-2026-10-31.pdf');
});
