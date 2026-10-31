<?php

namespace App\Concerns\Controllers;

use App\Concerns\Requests\StoreConcernRequest;
use App\Concerns\Requests\UpdateConcernStatusRequest;
use App\Concerns\Resources\ConcernResource;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ConcernController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:Open,Acknowledged,Resolved'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'sort' => ['nullable', 'in:id,status,created_at,resolved_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $query = Concern::query()->with([
            'location:id,name,building,floor_or_area',
            'office:id,name',
            'reporter:id,name,role',
            'resolver:id,name',
        ]);

        if ($user->isOffice()) {
            $query->where(function ($builder) use ($user) {
                $builder->where('reported_by', $user->id);

                if ($user->office_id) {
                    $builder->orWhere('office_id', $user->office_id);
                }
            });
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('description', 'like', $term)
                    ->orWhereHas('location', fn ($locations) => $locations->where('name', 'like', $term))
                    ->orWhereHas('reporter', fn ($reporters) => $reporters->where('name', 'like', $term));
            });
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['location_id']) && $user->isAdmin()) {
            $query->where('location_id', $validated['location_id']);
        }

        if (! empty($validated['sort'])) {
            $query->orderBy($validated['sort'], $validated['direction'] ?? 'desc');
        } else {
            $query->orderByRaw(
                "CASE status WHEN 'Open' THEN 0 WHEN 'Acknowledged' THEN 1 ELSE 2 END"
            );
            $query->orderByDesc('created_at');
        }

        $concerns = $query
            ->orderByDesc('id')
            ->paginate($validated['per_page'] ?? 10)
            ->withQueryString();

        return ConcernResource::collection($concerns);
    }

    public function locations(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Location::query()
            ->where('is_active', true)
            ->orderBy('name');

        if ($user->isOffice()) {
            $query->whereKey($user->office?->location_id);
        }

        return response()->json([
            'data' => $query->get(['id', 'name', 'building', 'floor_or_area']),
        ]);
    }

    public function store(StoreConcernRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($user->isOffice()) {
            $locationId = $user->office?->location_id;

            if (! $locationId) {
                throw ValidationException::withMessages([
                    'location_id' => 'Your office has no assigned location yet. Ask the administrator.',
                ]);
            }

            $data['location_id'] = $locationId;
        } elseif (empty($data['location_id'])) {
            throw ValidationException::withMessages([
                'location_id' => 'Choose the location of the concern.',
            ]);
        }

        $data['reported_by'] = $user->id;
        $data['office_id'] = $user->office_id;
        $data['status'] = Concern::STATUS_OPEN;

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('concerns', 'public');
        }

        unset($data['photo']);

        $concern = Concern::create($data);

        return response()->json([
            'message' => 'Concern reported.',
            'concern' => new ConcernResource($concern->load(['location', 'office', 'reporter', 'resolver'])),
        ], 201);
    }

    public function show(Request $request, Concern $concern): JsonResponse
    {
        if ($denied = $this->denyAccess($request, $concern)) {
            return $denied;
        }

        $concern->load(['location', 'office', 'reporter', 'resolver']);

        return response()->json([
            'concern' => new ConcernResource($concern),
        ]);
    }

    public function status(UpdateConcernStatusRequest $request, Concern $concern): JsonResponse
    {
        $status = $request->validated('status');
        $resolved = $status === Concern::STATUS_RESOLVED;

        $concern->update([
            'status' => $status,
            'resolution_note' => $resolved ? $request->validated('resolution_note') : null,
            'resolved_by' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved
                ? ($concern->resolved_at ?? now())
                : null,
        ]);

        return response()->json([
            'message' => 'Concern marked as '.$status.'.',
            'concern' => new ConcernResource($concern->load(['location', 'office', 'reporter', 'resolver'])),
        ]);
    }

    private function denyAccess(Request $request, Concern $concern): ?JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return null;
        }

        if ($user->isOffice()) {
            $sameOffice = $user->office_id && (int) $concern->office_id === (int) $user->office_id;
            $ownReport = (int) $concern->reported_by === (int) $user->id;

            if (! $sameOffice && ! $ownReport) {
                return response()->json(['message' => 'You can only view concerns reported by your office.'], 403);
            }
        }

        return null;
    }
}
