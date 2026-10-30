<?php

namespace App\Admin\Offices\Controllers;

use App\Admin\Offices\Requests\StoreOfficeRequest;
use App\Admin\Offices\Requests\UpdateOfficeRequest;
use App\Admin\Offices\Resources\OfficeResource;
use App\Http\Controllers\Controller;
use App\Models\Office;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'sort' => ['nullable', 'in:id,name,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Office::query()->with('location');

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('name', 'like', $term)
                    ->orWhere('contact_person', 'like', $term);
            });
        }

        if (! empty($validated['location_id'])) {
            $query->where('location_id', $validated['location_id']);
        }

        $sort = $validated['sort'] ?? 'id';
        $direction = $validated['direction'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;

        $offices = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return OfficeResource::collection($offices);
    }

    public function store(StoreOfficeRequest $request): JsonResponse
    {
        $office = Office::create($request->validated());

        return response()->json([
            'message' => 'Office created.',
            'office' => new OfficeResource($office->load('location')),
        ], 201);
    }

    public function update(UpdateOfficeRequest $request, Office $office): JsonResponse
    {
        $office->update($request->validated());

        return response()->json([
            'message' => 'Office updated.',
            'office' => new OfficeResource($office->fresh()->load('location')),
        ]);
    }

    public function status(Request $request, Office $office): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        $office->update(['status' => $validated['status']]);

        return response()->json([
            'message' => $validated['status'] === 'Active' ? 'Office activated.' : 'Office deactivated.',
            'office' => new OfficeResource($office->fresh()->load('location')),
        ]);
    }
}
