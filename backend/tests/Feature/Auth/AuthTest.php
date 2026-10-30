<?php

use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $officeLocation = Location::create([
        'name' => 'Admin Building',
        'building' => 'Admin Building',
    ]);

    $office = Office::create([
        'name' => 'Administration',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $officeLocation->id,
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
        'office_id' => $office->id,
        'is_active' => true,
    ]);
});

it('logs in with an email and returns a jwt', function () {
    $response = $this->postJson('/api/auth/login', [
        'login' => 'admin@tcgc.edu.ph',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_in',
            'user' => ['id', 'name', 'full_name', 'email', 'role', 'redirect'],
            'redirect',
        ])
        ->assertJsonPath('token_type', 'bearer')
        ->assertJsonPath('user.role', 'admin')
        ->assertJsonPath('redirect', '/admin/dashboard');

    expect($response->json('access_token'))->toBeString()->not->toBeEmpty();
});

it('logs in with a username', function () {
    $this->postJson('/api/auth/login', [
        'login' => 'ben',
        'password' => 'password',
    ])->assertOk()
        ->assertJsonPath('user.username', 'ben')
        ->assertJsonPath('user.role', 'maintenance');
});

it('returns the role dashboard for each role', function (string $email, string $redirect) {
    $this->postJson('/api/auth/login', [
        'login' => $email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('redirect', $redirect);
})->with([
    'admin' => ['admin@tcgc.edu.ph', '/admin/dashboard'],
    'maintenance' => ['ben@tcgc.edu.ph', '/maintenance/dashboard'],
    'office' => ['educ@tcgc.edu.ph', '/office/dashboard'],
]);

it('rejects invalid credentials', function () {
    $this->postJson('/api/auth/login', [
        'login' => 'admin@tcgc.edu.ph',
        'password' => 'wrong-password',
    ])->assertUnauthorized()
        ->assertJsonPath(
            'message',
            'Email or password is incorrect. Try again or ask the administrator to reset your password.'
        );
});

it('rejects a deactivated account', function () {
    $this->maintenance->update(['is_active' => false]);

    $this->postJson('/api/auth/login', [
        'login' => 'ben@tcgc.edu.ph',
        'password' => 'password',
    ])->assertForbidden()
        ->assertJsonPath(
            'message',
            'Your account is deactivated. Ask the administrator to reactivate it.'
        );
});

it('validates required login fields', function () {
    $this->postJson('/api/auth/login', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['login', 'password']);
});

it('returns the authenticated user', function () {
    $token = $this->postJson('/api/auth/login', [
        'login' => 'educ@tcgc.edu.ph',
        'password' => 'password',
    ])->json('access_token');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('user.email', 'educ@tcgc.edu.ph')
        ->assertJsonPath('user.role', 'office')
        ->assertJsonPath('user.office.name', 'Administration');
});

it('requires a token for protected routes', function () {
    $this->getJson('/api/auth/me')->assertUnauthorized();
});

it('invalidates the token on logout', function () {
    $token = $this->postJson('/api/auth/login', [
        'login' => 'admin@tcgc.edu.ph',
        'password' => 'password',
    ])->json('access_token');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/auth/logout')
        ->assertOk()
        ->assertJsonPath('message', 'Logged out.');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/auth/me')
        ->assertUnauthorized();
});
