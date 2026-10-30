<?php

use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

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

    $this->officeUser = User::create([
        'name' => 'Office - Education',
        'username' => 'educ',
        'email' => 'educ@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $this->office->id,
        'is_active' => true,
    ]);
});

it('lists users with pagination metadata', function () {
    User::factory()->count(12)->create();

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?per_page=5');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'email', 'role', 'is_active', 'office']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 15)
        ->assertJsonPath('meta.per_page', 5)
        ->assertJsonPath('meta.last_page', 3);

    expect($response->json('data'))->toHaveCount(5);
});

it('searches by name, email and username', function (string $term) {
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?search='.urlencode($term))
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.email', 'ben@tcgc.edu.ph');
})->with([
    'name' => ['Mang Ben'],
    'email' => ['ben@tcgc'],
    'username' => ['ben'],
]);

it('filters by role', function () {
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?role=maintenance')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.role', 'maintenance');
});

it('filters by active status', function () {
    $this->maintenance->update(['is_active' => false]);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?status=inactive')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.email', 'ben@tcgc.edu.ph');
});

it('filters by office', function () {
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?office_id='.$this->office->id)
        ->assertOk()
        ->assertJsonPath('meta.total', 2);
});

it('sorts users', function () {
    User::factory()->create(['name' => 'Zara Zulu', 'email' => 'zara@tcgc.edu.ph', 'username' => 'zara']);
    User::factory()->create(['name' => 'Aaron Alpha', 'email' => 'aaron@tcgc.edu.ph', 'username' => 'aaron']);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/users?sort=name&direction=desc&per_page=100')
        ->assertOk();

    expect($response->json('data.0.name'))->toBe('Zara Zulu');
});

it('returns offices for selects', function () {
    $this->actingAs($this->admin, 'api')
        ->getJson('/api/offices')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Administration');
});

it('blocks non-admin users', function () {
    $this->actingAs($this->maintenance, 'api')
        ->getJson('/api/users')
        ->assertForbidden();
});

it('creates a user with a generated password', function () {
    $response = $this->actingAs($this->admin, 'api')
        ->postJson('/api/users', [
            'name' => 'New Staff',
            'username' => 'newstaff',
            'email' => 'newstaff@tcgc.edu.ph',
            'role' => 'maintenance',
            'office_id' => $this->office->id,
        ]);

    $response->assertCreated()
        ->assertJsonPath('user.email', 'newstaff@tcgc.edu.ph')
        ->assertJsonPath('user.role', 'maintenance');

    $password = $response->json('temporary_password');
    $user = User::where('email', 'newstaff@tcgc.edu.ph')->firstOrFail();

    expect($password)->toBeString()->not->toBeEmpty();
    expect(Hash::check($password, $user->password))->toBeTrue();
});

it('validates unique email and username', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/users', [
            'name' => 'Duplicate',
            'username' => 'ben',
            'email' => 'ben@tcgc.edu.ph',
            'role' => 'office',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'username']);
});

it('updates a user', function () {
    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/users/{$this->maintenance->id}", [
            'name' => 'Ben Updated',
            'email' => 'ben.updated@tcgc.edu.ph',
            'role' => 'maintenance',
        ])
        ->assertOk()
        ->assertJsonPath('user.name', 'Ben Updated');

    expect($this->maintenance->fresh()->email)->toBe('ben.updated@tcgc.edu.ph');
});

it('toggles a user status', function () {
    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/users/{$this->maintenance->id}/status", ['is_active' => false])
        ->assertOk()
        ->assertJsonPath('user.is_active', false);

    expect($this->maintenance->fresh()->is_active)->toBeFalse();
});

it('prevents an admin from deactivating themselves', function () {
    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/users/{$this->admin->id}/status", ['is_active' => false])
        ->assertUnprocessable();
});

it('prevents an admin from changing their own role', function () {
    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/users/{$this->admin->id}", ['role' => 'office'])
        ->assertUnprocessable();
});
