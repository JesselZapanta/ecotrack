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

    $this->educationOffice = Office::create([
        'name' => 'Institute of Teacher Education',
        'contact_person' => 'Dean Santos',
        'location_id' => $this->mainBuilding->id,
    ]);

    $this->businessOffice = Office::create([
        'name' => 'Institute of Business',
        'contact_person' => 'Dean Reyes',
        'location_id' => $this->canteen->id,
    ]);

    $this->scienceOffice = Office::create([
        'name' => 'College of Science',
        'contact_person' => 'Dean Lim',
        'location_id' => $this->mainBuilding->id,
    ]);

    $this->admin = User::create([
        'name' => 'Admin TCGC',
        'username' => 'admin',
        'email' => 'admin@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_ADMIN,
        'office_id' => $this->educationOffice->id,
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

    $this->educ = User::create([
        'name' => 'Office - Education',
        'username' => 'educ',
        'email' => 'educ@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $this->educationOffice->id,
        'is_active' => true,
    ]);

    $this->business = User::create([
        'name' => 'Office - Business',
        'username' => 'business',
        'email' => 'business@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $this->businessOffice->id,
        'is_active' => true,
    ]);

    $this->science = User::create([
        'name' => 'Office - Science',
        'username' => 'science',
        'email' => 'science@tcgc.edu.ph',
        'password' => 'password',
        'role' => User::ROLE_OFFICE,
        'office_id' => $this->scienceOffice->id,
        'is_active' => true,
    ]);
});

function makeConcern(int $locationId, int $reporterId, array $overrides = []): Concern
{
    return Concern::create(array_merge([
        'location_id' => $locationId,
        'office_id' => User::whereKey($reporterId)->value('office_id'),
        'reported_by' => $reporterId,
        'description' => 'Overflowing bin at the entrance.',
        'status' => Concern::STATUS_OPEN,
    ], $overrides));
}

it('lets an office report a concern for its own location', function () {
    $response = $this->actingAs($this->educ, 'api')
        ->postJson('/api/concerns', [
            'location_id' => $this->canteen->id,
            'description' => 'Overflowing bin near the main entrance.',
        ]);

    $response->assertCreated()
        ->assertJsonPath('concern.status', Concern::STATUS_OPEN)
        ->assertJsonPath('concern.location.name', 'Main Building')
        ->assertJsonPath('concern.reporter.name', 'Office - Education');

    expect(Concern::firstOrFail()->location_id)->toBe($this->mainBuilding->id);
    expect(Concern::firstOrFail()->office_id)->toBe($this->educationOffice->id);
});

it('rejects a concern when an office has no assigned location', function () {
    $this->educ->update(['office_id' => null]);

    $this->actingAs($this->educ, 'api')
        ->postJson('/api/concerns', [
            'description' => 'Overflowing bin near the main entrance.',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('location_id');
});

it('validates the description and location', function () {
    $this->actingAs($this->admin, 'api')
        ->postJson('/api/concerns', ['description' => 'short'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('description');

    $this->actingAs($this->admin, 'api')
        ->postJson('/api/concerns', ['description' => 'A long enough description of the problem.'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('location_id');
});

it('stores an optional photo on the public disk', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->educ, 'api')
        ->post('/api/concerns', [
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
    makeConcern($this->mainBuilding->id, $this->educ->id);
    makeConcern($this->canteen->id, $this->business->id, [
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
                'office' => ['id', 'name'],
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

it('scopes the office list to its own office', function () {
    makeConcern($this->mainBuilding->id, $this->educ->id);
    makeConcern($this->mainBuilding->id, $this->science->id, [
        'description' => 'Chairs blocking the collection point.',
    ]);
    makeConcern($this->canteen->id, $this->business->id, [
        'description' => 'Mixed waste at the canteen.',
    ]);

    $response = $this->actingAs($this->educ, 'api')
        ->getJson('/api/concerns');

    $response->assertOk()->assertJsonPath('meta.total', 1);
    expect($response->json('data.0.reporter.name'))->toBe('Office - Education');
});

it('scopes maintenance users to the concerns they reported', function () {
    makeConcern($this->mainBuilding->id, $this->educ->id);
    makeConcern($this->mainBuilding->id, $this->ben->id, [
        'description' => 'Broken wheel on the green bin.',
    ]);

    $response = $this->actingAs($this->ben, 'api')
        ->getJson('/api/concerns');

    $response->assertOk()->assertJsonPath('meta.total', 1);
    expect($response->json('data.0.reporter.name'))->toBe('Mang Ben');
});

it('lets the admin acknowledge and resolve a concern', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->educ->id);

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
    $concern = makeConcern($this->mainBuilding->id, $this->educ->id);

    $this->actingAs($this->admin, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_RESOLVED])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('resolution_note');

    expect($concern->fresh()->status)->toBe(Concern::STATUS_OPEN);
});

it('clears the resolution when a concern is reopened', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->educ->id);

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

it('rejects status changes from non-admin users', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->educ->id);

    $this->actingAs($this->educ, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_RESOLVED])
        ->assertForbidden();

    $this->actingAs($this->ben, 'api')
        ->patchJson("/api/concerns/{$concern->id}/status", ['status' => Concern::STATUS_RESOLVED])
        ->assertForbidden();
});

it('blocks viewing a concern outside the user scope', function () {
    $concern = makeConcern($this->mainBuilding->id, $this->science->id, [
        'description' => 'Chairs blocking the collection point.',
    ]);

    $this->actingAs($this->educ, 'api')
        ->getJson("/api/concerns/{$concern->id}")
        ->assertForbidden();

    $this->actingAs($this->ben, 'api')
        ->getJson("/api/concerns/{$concern->id}")
        ->assertForbidden();

    $this->actingAs($this->admin, 'api')
        ->getJson("/api/concerns/{$concern->id}")
        ->assertOk();
});

it('returns only the office location in the location options', function () {
    $response = $this->actingAs($this->educ, 'api')
        ->getJson('/api/concerns/locations');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.name'))->toBe('Main Building');

    $adminResponse = $this->actingAs($this->admin, 'api')
        ->getJson('/api/concerns/locations');

    expect($adminResponse->json('data'))->toHaveCount(2);
});
