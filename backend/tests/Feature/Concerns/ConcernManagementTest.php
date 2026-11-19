<?php

use App\Models\AuditLog;
use App\Models\Concern;
use App\Models\Location;
use App\Models\Office;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mainBuilding = Location::create(['name' => 'Main Building', 'building' => 'Main Building', 'floor_or_area' => 'Ground Floor']);
    $this->canteen = Location::create(['name' => 'Canteen', 'building' => 'Canteen']);

    $this->office = Office::create([
        'name' => 'PFOM Office',
        'contact_person' => 'Ms. Cruz',
        'location_id' => $this->mainBuilding->id,
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
        'office_id' => $this->office->id,
        'is_active' => true,
    ]);

    $this->cora = User::create([
        'name' => 'Ate Cora',
        'username' => 'cora',
        'email' => 'cora@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_MAINTENANCE,
        'office_id' => $this->office->id,
        'is_active' => true,
    ]);
});

function makeConcern(int $locationId, int $reporterId, array $overrides = []): Concern
{
    return Concern::create(array_merge([
        'location_id' => $locationId,
        'office_id' => null,
        'reported_by' => $reporterId,
        'description' => 'Overflowing bin at the entrance.',
        'status' => Concern::STATUS_OPEN,
    ], $overrides));
}

it('lets maintenance report a concern for a selected location', function () {
    $response = $this->actingAs($this->ben, 'api')
        ->postJson('/api/concerns', [
            'location_id' => $this->canteen->id,
            'description' => 'Overflowing bin near the canteen entrance.',
        ]);

    $response->assertCreated()
        ->assertJsonPath('concern.status', Concern::STATUS_OPEN)
        ->assertJsonPath('concern.location.name', 'Canteen')
        ->assertJsonPath('concern.reporter.name', 'Mang Ben');

    expect(Concern::firstOrFail()->location_id)->toBe($this->canteen->id);
    expect(Concern::firstOrFail()->office_id)->toBeNull();
});

it('validates the description and location', function () {
    $this->actingAs($this->ben, 'api')
        ->postJson('/api/concerns', ['location_id' => $this->mainBuilding->id, 'description' => 'short'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('description');

    $this->actingAs($this->ben, 'api')
        ->postJson('/api/concerns', ['description' => 'A long enough description of the problem.'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('location_id');
});

it('stores an optional photo on the public disk', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->ben, 'api')
        ->post('/api/concerns', [
            'location_id' => $this->mainBuilding->id,
            'description' => 'Overflowing bin with a photo attached.',
            'photo' => UploadedFile::fake()->create('bin.jpg', 200, 'image/jpeg'),
        ]);

    $response->assertCreated();

    $path = Concern::firstOrFail()->photo_path;
    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
    expect($response->json('concern.photo_url'))->toContain('/storage/'.$path);
});

it('lists every concern for the admin with status filters', function () {
    makeConcern($this->mainBuilding->id, $this->ben->id);
    makeConcern($this->canteen->id, $this->cora->id, [
        'status' => Concern::STATUS_RESOLVED,
        'description' => 'Mixed waste at the canteen.',
    ]);

    $response = $this->actingAs($this->admin, 'api')
        ->getJson('/api/concerns?per_page=10');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [[
                'id',
                'description',
                'status',
                'photo_url',
                'resolution_note',
                'resolved_at',
                'resolved_by',
                'created_at',
                'location' => ['id', 'name', 'building', 'floor_or_area'],
                'reporter' => ['id', 'name', 'role'],
            ]],
            'meta' => ['current_page', 'last_page', 'per_page', 'total', 'from', 'to'],
        ])
        ->assertJsonPath('meta.total', 2);

    expect($response->json('data.0.status'))->toBe(Concern::STATUS_OPEN);

    $this->actingAs($this->admin, 'api')
        ->getJson('/api/concerns?status=Resolved')
        ->assertOk()
        ->assertJsonPath('meta.total', 1)
        ->assertJsonPath('data.0.status', Concern::STATUS_RESOLVED);
});

it('lets maintenance users see all concerns', function () {
    makeConcern($this->mainBuilding->id, $this->ben->id);
    makeConcern($this->canteen->id, $this->cora->id, [
        'description' => 'Chairs blocking the collection point.',
    ]);

    $response = $this->actingAs($this->ben, 'api')
        ->getJson('/api/concerns');

    $response->assertOk()->assertJsonPath('meta.total', 2);
    expect(collect($response->json('data'))->pluck('reporter.name')->all())
        ->toContain('Mang Ben')
        ->toContain('Ate Cora');
});

it('lets the admin acknowledge and resolve a concern', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->ben->id);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_ACKNOWLEDGED])
        ->assertOk()
        ->assertJsonPath('concern.status', Concern::STATUS_ACKNOWLEDGED);

    expect($concern->fresh()->resolved_at)->toBeNull();

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", [
            'status' => Concern::STATUS_RESOLVED,
            'resolution_note' => 'Bin emptied and the broken lid was replaced.',
        ])
        ->assertOk()
        ->assertJsonPath('concern.status', Concern::STATUS_RESOLVED)
        ->assertJsonPath('concern.resolution_note', 'Bin emptied and the broken lid was replaced.')
        ->assertJsonPath('concern.resolved_by.name', 'Admin TCGC');

    $fresh = $concern->fresh();
    expect($fresh->resolved_at)->not->toBeNull();
    expect($fresh->resolved_by)->toBe($this->admin->id);

    expect(AuditLog::where('entity_type', 'Concern')
        ->where('entity_id', $concern->id)
        ->where('action', 'status_changed')
        ->count())->toBe(2);
});

it('requires a resolution note when resolving', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->ben->id);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_RESOLVED])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('resolution_note');

    expect($concern->fresh()->status)->toBe(Concern::STATUS_OPEN);
});

it('clears the resolution when a concern is reopened', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->ben->id);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", [
            'status' => Concern::STATUS_RESOLVED,
            'resolution_note' => 'Collection point cleared.',
        ])
        ->assertOk();

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_OPEN])
        ->assertOk();

    $fresh = $concern->fresh();
    expect($fresh->resolution_note)->toBeNull();
    expect($fresh->resolved_by)->toBeNull();
    expect($fresh->resolved_at)->toBeNull();
});

it('lets maintenance update concern status', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->cora->id);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_ACKNOWLEDGED])
        ->assertOk()
        ->assertJsonPath('concern.status', Concern::STATUS_ACKNOWLEDGED);

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", [
            'status' => Concern::STATUS_RESOLVED,
            'resolution_note' => 'Crew cleared the collection point.',
        ])
        ->assertOk()
        ->assertJsonPath('concern.status', Concern::STATUS_RESOLVED)
        ->assertJsonPath('concern.resolved_by.name', 'Mang Ben');

    $fresh = $concern->fresh();
    expect($fresh->resolved_by)->toBe($this->ben->id);
    expect($fresh->resolution_note)->toBe('Crew cleared the collection point.');
});

it('lets maintenance view any concern', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->cora->id, [
        'description' => 'Chairs blocking the collection point.',
    ]);

    $this->actingAs($this->ben, 'api')
        ->getJson("/api/concerns/{$concern->id}")
        ->assertOk()
        ->assertJsonPath('concern.reporter.name', 'Ate Cora');

    $this->actingAs($this->admin, 'api')
        ->getJson("/api/concerns/{$concern->id}")
        ->assertOk();
});

it('returns every active location in the location options', function () {
    $response = $this->actingAs($this->ben, 'api')
        ->getJson('/api/concerns/locations');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(2);

    $adminResponse = $this->actingAs($this->admin, 'api')
        ->getJson('/api/concerns/locations');

    expect($adminResponse->json('data'))->toHaveCount(2);
});
