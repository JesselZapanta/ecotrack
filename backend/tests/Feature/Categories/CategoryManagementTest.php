<?php

use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use App\Models\WasteCategory;
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

it('lists categories with pagination metadata', function () {
    WasteCategory::factory()->count(12)->create();

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/categories?per_page=5');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'color', 'color_code', 'description']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 12)
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.last_page', 3);

    expect($response->json('data'))->toHaveCount(5);
});

it('searches by name and description', function (string $term) {
    WasteCategory::create(['name' => 'Biodegradable', 'color_code' => '#2E7D4F', 'description' => 'Food scraps and leaves.']);
    WasteCategory::create(['name' => 'Recyclable', 'color_code' => '#E3A908', 'description' => 'Paper and plastic.']);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/categories?search='.urlencode($term))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.name', 'Biodegradable');
})->with([
    'name' => ['biodeg'],
    'description' => ['leaves'],
]);

it('sorts categories', function () {
    WasteCategory::create(['name' => 'Zebra Waste', 'color_code' => '#111111']);
    WasteCategory::create(['name' => 'Alpha Waste', 'color_code' => '#222222']);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/categories?sort=name&direction=desc&per_page=100')
        ->assertOk();

    expect($response->json('data.0.name'))->toBe('Zebra Waste');
});

it('blocks non-admin users', function () {
    $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/categories')
        ->assertForbidden();
});

it('creates a category', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/categories', [
            'name' => 'Biodegradable',
            'color_code' => '#2E7D4F',
            'description' => 'Food scraps and leaves.',
        ]);

    $response->assertCreated()
        ->assertJsonPath('category.name', 'Biodegradable')
        ->assertJsonPath('category.color_code', '#2E7D4F');

    expect(WasteCategory::where('name', 'Biodegradable')->exists())->toBeTrue();
});

it('validates unique name and hex color', function () {
    WasteCategory::create(['name' => 'Biodegradable', 'color_code' => '#2E7D4F']);

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/categories', [
            'name' => 'Biodegradable',
            'color_code' => 'not-a-color',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'color_code']);
});

it('updates a category', function () {
    $category = WasteCategory::create(['name' => 'Residual', 'color_code' => '#2A2D2B']);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/categories/{$category->id}", [
            'name' => 'Residual Waste',
            'color_code' => '#3A3F3B',
        ])
        ->assertOk()
        ->assertJsonPath('category.name', 'Residual Waste');

    expect($category->fresh()->color_code)->toBe('#3A3F3B');
});

it('deactivates a category instead of deleting it', function () {
    $category = WasteCategory::create(['name' => 'Hazardous', 'color_code' => '#D4531A']);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/categories/{$category->id}/status", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('message', 'Category deactivated.')
        ->assertJsonPath('category.is_active', false);

    expect(WasteCategory::where('id', $category->id)->exists())->toBeTrue();
    expect($category->fresh()->is_active)->toBeFalse();
});
