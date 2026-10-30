<?php

use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->officeLocation = Location::create([
        'name' => 'Admin Building',
        'building' => 'Admin Building',
    ]);

    $this->office = Office::create([
        'name' => 'Administration',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $this->officeLocation->id,
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

    $this->maintenance = User::create([
        'name' => 'Mang Ben',
        'username' => 'ben',
        'email' => 'ben@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_MAINTENANCE,
        'is_active' => true,
    ]);
});

it('lists locations with pagination metadata', function () {
    Location::create(['name' => 'Library', 'building' => 'Library']);
    Location::create(['name' => 'Canteen', 'building' => 'Canteen']);
    Location::create(['name' => 'Gym', 'building' => 'Covered Court']);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/locations?per_page=2');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'building', 'floor_or_area', 'offices']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 4)
        ->assertJsonPath('meta.per_page', 2)
        ->assertJsonPath('meta.last_page', 2);
});

it('searches by name, building and floor or area', function (string $term) {
    Location::create(['name' => 'Library', 'building' => 'Library', 'floor_or_area' => '2nd floor']);
    Location::create(['name' => 'Canteen', 'building' => 'Canteen']);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/locations?search='.urlencode($term))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Library');
})->with([
    'name' => ['libr'],
    'building' => ['LIBRARY'],
    'floor' => ['2nd'],
]);

it('includes the offices that belong to a location', function () {
    $location = Location::create(['name' => 'Library', 'building' => 'Library']);
    $location->offices()->create(['name' => 'College of Education', 'contact_person' => 'Dean Santos']);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/locations?search=Library')
        ->assertOk()
        ->assertJsonPath('meta.total', 1);

    expect($response->json('data.0.offices.0.name'))->toBe('College of Education');
});

it('sorts locations', function () {
    Location::create(['name' => 'Zulu Hall', 'building' => 'Zulu']);
    Location::create(['name' => 'Alpha Hall', 'building' => 'Alpha']);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/locations?sort=name&direction=desc&per_page=100')
        ->assertOk();

    expect($response->json('data.0.name'))->toBe('Zulu Hall');
});

it('blocks non-admin users', function () {
    $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/locations')
        ->assertForbidden();
});

it('creates a location', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/locations', [
            'name' => 'Library',
            'building' => 'Library',
            'floor_or_area' => '2nd floor',
        ]);

    $response->assertCreated()
        ->assertJsonPath('location.name', 'Library')
        ->assertJsonPath('location.building', 'Library');

    expect(Location::where('name', 'Library')->exists())->toBeTrue();
});

it('validates required fields', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/locations', ['building' => 'Library'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/locations', ['name' => 'Library'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['building']);
});

it('updates a location', function () {
    $location = Location::create(['name' => 'Lib', 'building' => 'Library']);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/locations/{$location->id}", [
            'name' => 'Library',
            'floor_or_area' => '2nd floor',
        ])
        ->assertOk()
        ->assertJsonPath('location.name', 'Library');

    expect($location->fresh()->floor_or_area)->toBe('2nd floor');
});

it('deactivates a location instead of deleting it', function () {
    $location = Location::create(['name' => 'Old Shed', 'building' => 'Back']);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/locations/{$location->id}/status", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('message', 'Location deactivated.')
        ->assertJsonPath('location.is_active', false);

    expect(Location::where('id', $location->id)->exists())->toBeTrue();
    expect($location->fresh()->is_active)->toBeFalse();
});
