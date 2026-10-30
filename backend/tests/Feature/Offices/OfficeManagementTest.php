<?php

use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->location = Location::create(['name' => 'Admin Building', 'building' => 'Admin Building']);

    $this->admin = User::create([
        'name' => 'Admin TCGC',
        'username' => 'admin',
        'email' => 'admin@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_ADMIN,
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
});

it('lists offices with pagination metadata', function () {
    Office::create(['name' => 'Office 1', 'location_id' => $this->location->id]);
    Office::create(['name' => 'Office 2', 'location_id' => $this->location->id]);
    Office::create(['name' => 'Office 3', 'location_id' => $this->location->id]);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/offices?per_page=2');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'contact_person', 'location_id', 'location']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 3)
        ->assertJsonPath('meta.per_page', 2)
        ->assertJsonPath('meta.last_page', 2);
});

it('filters offices by location', function () {
    $library = Location::create(['name' => 'Library', 'building' => 'Library']);
    Office::create(['name' => 'College of Education', 'location_id' => $library->id]);
    Office::create(['name' => 'Administration', 'location_id' => $this->location->id]);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/offices?location_id='.$library->id)
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.location.name', 'Library');
});

it('creates an office inside a location', function () {
    $library = Location::create(['name' => 'Library', 'building' => 'Library']);

    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/offices', [
            'name' => 'College of Education',
            'contact_person' => 'Dean Santos',
            'location_id' => $library->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('office.location.name', 'Library');

    expect(Office::where('name', 'College of Education')->firstOrFail()->location_id)->toBe($library->id);
});

it('requires a location when creating an office', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/offices', [
            'name' => 'No Location Office',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['location_id']);
});

it('searches by name and contact person', function (string $term) {
    Office::create(['name' => 'Administration', 'contact_person' => 'Ms. Cruz', 'location_id' => $this->location->id]);
    Office::create(['name' => 'Library', 'contact_person' => 'Mr. Doe', 'location_id' => $this->location->id]);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/offices?search='.urlencode($term))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Administration');
})->with([
    'name' => ['admin'],
    'contact' => ['cruz'],
]);

it('sorts offices', function () {
    Office::create(['name' => 'Zulu Office', 'location_id' => $this->location->id]);
    Office::create(['name' => 'Alpha Office', 'location_id' => $this->location->id]);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/offices?sort=name&direction=desc&per_page=100')
        ->assertOk();

    expect($response->json('data.0.name'))->toBe('Zulu Office');
});

it('blocks non-admin users', function () {
    $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/offices')
        ->assertForbidden();
});

it('creates an office', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/offices', [
            'name' => 'College of Education',
            'contact_person' => 'Dean Santos',
            'location_id' => $this->location->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('office.name', 'College of Education')
        ->assertJsonPath('office.contact_person', 'Dean Santos');

    expect(Office::where('name', 'College of Education')->exists())->toBeTrue();
});

it('validates unique name', function () {
    Office::create(['name' => 'Administration', 'location_id' => $this->location->id]);

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/offices', ['name' => 'Administration', 'location_id' => $this->location->id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('updates an office', function () {
    $office = Office::create(['name' => 'Admin', 'contact_person' => 'Old', 'location_id' => $this->location->id]);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/offices/{$office->id}", [
            'name' => 'Administration',
            'contact_person' => 'Ms. Cruz',
        ])
        ->assertOk()
        ->assertJsonPath('office.name', 'Administration');

    expect($office->fresh()->contact_person)->toBe('Ms. Cruz');
});

it('deactivates an office instead of deleting it', function () {
    $office = Office::create(['name' => 'Temporary', 'location_id' => $this->location->id]);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/offices/{$office->id}/status", ['status' => 'Inactive'])
        ->assertOk()
        ->assertJsonPath('message', 'Office deactivated.')
        ->assertJsonPath('office.status', 'Inactive');

    expect(Office::where('id', $office->id)->exists())->toBeTrue();
    expect($office->fresh()->status)->toBe('Inactive');
});
