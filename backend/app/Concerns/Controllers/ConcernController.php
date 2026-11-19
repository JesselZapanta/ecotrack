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
        $query = Location::query()
            ->where('is_active', true)
            ->orderBy('name');

        return response()->json([
            'data' => $query->get(['id', 'name', 'building', 'floor_or_area']),
        ]);
    }

    public function store(StoreConcernRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $data['reported_by'] = $user->id;
        $data['office_id'] = null;
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
        if ($request->user()->isAdmin() || $request->user()->isMaintenance()) {
            return null;
        }

        return response()->json(['message' => 'You cannot view this concern.'], 403);
    }
}
