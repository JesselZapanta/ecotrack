<?php

namespace App\Admin\Locations\Controllers;

use App\Admin\Locations\Requests\StoreLocationRequest;
use App\Admin\Locations\Requests\UpdateLocationRequest;
use App\Admin\Locations\Resources\LocationResource;
use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', 'in:id,name,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Location::query()->with(['offices' => fn ($builder) => $builder->select('id', 'name', 'location_id')->orderBy('name')]);

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('name', 'like', $term)
                    ->orWhere('building', 'like', $term)
                    ->orWhere('floor_or_area', 'like', $term);
            });
        }

        $sort = $validated['sort'] ?? 'id';
        $direction = $validated['direction'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;

        $locations = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return LocationResource::collection($locations);
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = Location::create($request->validated());

        return response()->json([
            'message' => 'Location created.',
            'location' => new LocationResource($location->load('offices')),
        ], 201);
    }

    public function update(UpdateLocationRequest $request, Location $location): JsonResponse
    {
        $location->update($request->validated());

        return response()->json([
            'message' => 'Location updated.',
            'location' => new LocationResource($location->load('offices')),
        ]);
    }

    public function status(Request $request, Location $location): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $location->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'message' => $validated['is_active'] ? 'Location activated.' : 'Location deactivated.',
            'location' => new LocationResource($location->fresh()->load('offices')),
        ]);
    }
}
