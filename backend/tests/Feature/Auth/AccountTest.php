<?php

use App\Models\AuditLog;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

beforeEach(function () {
    $location = Location::create([
        'name' => 'Admin Building',
        'building' => 'Admin Building',
    ]);

    $office = Office::create([
        'name' => 'Administration',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $location->id,
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
        'office_id' => $office->id,
        'is_active' => true,
    ]);

});

it('lets every role update its own profile', function () {
    foreach ([$this->admin, $this->maintenance] as $user) {
        $newName = $user->name.' Updated';
        $newEmail = 'updated'.$user->id.'@tcgc.edu.ph';

        $response = $this->actingAs($user, 'api')
            ->patchJson('/api/auth/account', [
                'name' => $newName,
                'username' => $user->username.'-'.$user->id,
                'email' => $newEmail,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Profile updated.')
            ->assertJsonPath('user.name', $newName)
            ->assertJsonPath('user.email', $newEmail);

        expect($user->fresh()->name)->toBe($newName);
    }
});

it('returns the updated profile with the office relation', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [
            'name' => 'Mang Ben',
            'username' => 'ben',
            'email' => 'ben@tcgc.edu.ph',
        ])
        ->assertOk()
        ->assertJsonPath('user.office.name', 'Administration')
        ->assertJsonPath('user.office.location.name', 'Admin Building')
        ->assertJsonPath('user.redirect', '/maintenance/dashboard');
});

it('rejects an email or username already in use', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [
            'name' => 'Mang Ben',
            'username' => 'admin',
            'email' => 'admin@tcgc.edu.ph',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['username', 'email']);

    expect($this->maintenance->fresh()->email)->toBe('ben@tcgc.edu.ph');
});

it('ignores privileged fields on a self-service profile update', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [
            'name' => 'Mang Ben',
            'username' => 'ben',
            'email' => 'ben@tcgc.edu.ph',
            'role' => User::ROLE_ADMIN,
            'office_id' => null,
            'is_active' => false,
        ])
        ->assertOk();

    $fresh = $this->maintenance->fresh();
    expect($fresh->role)->toBe(User::ROLE_MAINTENANCE);
    expect($fresh->office_id)->toBe($this->maintenance->office_id);
    expect($fresh->is_active)->toBeTrue();
});

it('validates the profile fields', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email']);

    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [
            'name' => 'Mang Ben',
            'email' => 'not-an-email',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('changes the password with the correct current password', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account/password', [
            'current_password' => 'password',
            'password' => 'new-secret-123',
            'password_confirmation' => 'new-secret-123',
        ])
        ->assertOk()
        ->assertJsonPath('message', 'Password changed.');

    $fresh = $this->maintenance->fresh();
    expect(Hash::check('new-secret-123', $fresh->password))->toBeTrue();
    expect(Hash::check('password', $fresh->password))->toBeFalse();

    $this->postJson('/api/auth/login', [
        'login' => 'ben@tcgc.edu.ph',
        'password' => 'new-secret-123',
    ])->assertOk();
});

it('rejects a wrong current password', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-secret-123',
            'password_confirmation' => 'new-secret-123',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('current_password');

    expect(Hash::check('password', $this->maintenance->fresh()->password))->toBeTrue();
});

it('validates the new password', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account/password', [
            'current_password' => 'password',
            'password' => 'short',
            'password_confirmation' => 'short',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('password');

    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account/password', [
            'current_password' => 'password',
            'password' => 'new-secret-123',
            'password_confirmation' => 'different-secret',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('password');
});

it('requires authentication for account updates', function () {
    $this->patchJson('/api/auth/account', [
        'name' => 'Nobody',
        'email' => 'nobody@tcgc.edu.ph',
    ])->assertUnauthorized();

    $this->patchJson('/api/auth/account/password', [
        'current_password' => 'password',
        'password' => 'new-secret-123',
        'password_confirmation' => 'new-secret-123',
    ])->assertUnauthorized();
});

it('audits profile and password changes without leaking the hash', function () {
    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account', [
            'name' => 'Mang Ben',
            'username' => 'ben',
            'email' => 'ben@tcgc.edu.ph',
        ])
        ->assertOk();

    $this->actingAs($this->maintenance, 'api')
        ->patchJson('/api/auth/account/password', [
            'current_password' => 'password',
            'password' => 'new-secret-123',
            'password_confirmation' => 'new-secret-123',
        ])
        ->assertOk();

    $passwordLog = AuditLog::where('action', 'password_changed')
        ->where('entity_type', 'User')
        ->where('entity_id', $this->maintenance->id)
        ->first();

    expect($passwordLog)->not->toBeNull();
    expect($passwordLog->meta)->toBeNull();

    $logs = AuditLog::where('entity_type', 'User')
        ->where('entity_id', $this->maintenance->id)
        ->get();

    foreach ($logs as $log) {
        expect(json_encode($log->meta))->not->toContain('$2y$');
    }
});
