<?php

namespace App\Admin\WasteRecords\Controllers;

use App\Admin\WasteRecords\Requests\StoreWasteRecordRequest;
use App\Admin\WasteRecords\Requests\UpdateWasteRecordRequest;
use App\Admin\WasteRecords\Resources\WasteRecordResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WasteRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WasteRecordController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:waste_categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'sort' => ['nullable', 'in:id,date,quantity_kg,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $query = WasteRecord::query()->with([
            'location:id,name,building',
            'category:id,name,color_code',
            'creator:id,name',
        ]);

        if ($user->isMaintenance()) {
            $query->where('created_by', $user->id);
        } elseif ($user->isOffice()) {
            $locationId = $user->office?->location_id;
            if (! $locationId) {
                $query->whereRaw('1 = 0');
            } else {
                $query->where('location_id', $locationId);
            }
        }

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('remarks', 'like', $term)
                    ->orWhereHas('location', fn ($locations) => $locations->where('name', 'like', $term))
                    ->orWhereHas('category', fn ($categories) => $categories->where('name', 'like', $term));
            });
        }

        if (! empty($validated['category_id'])) {
            $query->where('category_id', $validated['category_id']);
        }

        if (! empty($validated['location_id']) && $user->isAdmin()) {
            $query->where('location_id', $validated['location_id']);
        }

        $sort = $validated['sort'] ?? 'id';
        $direction = $validated['direction'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;

        $records = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return WasteRecordResource::collection($records);
    }

    public function store(StoreWasteRecordRequest $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validated();
        $data['created_by'] = $user->id;

        $record = WasteRecord::create($data);

        return response()->json([
            'message' => 'Waste record created.',
            'record' => new WasteRecordResource($record->load(['location', 'category', 'creator'])),
        ], 201);
    }

    public function show(Request $request, WasteRecord $wasteRecord): JsonResponse
    {
        $user = $request->user();

        if ($user->isMaintenance() && (int) $wasteRecord->created_by !== (int) $user->id) {
            return response()->json(['message' => 'You can only view your own records.'], 403);
        }

        if ($user->isOffice()) {
            $locationId = $user->office?->location_id;
            if (! $locationId || (int) $wasteRecord->location_id !== (int) $locationId) {
                return response()->json(['message' => 'You can only view records for your office location.'], 403);
            }
        }

        $wasteRecord->load(['location', 'category', 'creator']);

        return response()->json([
            'record' => new WasteRecordResource($wasteRecord),
        ]);
    }

    public function update(UpdateWasteRecordRequest $request, WasteRecord $wasteRecord): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Only administrators can edit waste records.'], 403);
        }

        $wasteRecord->update($request->validated());

        return response()->json([
            'message' => 'Waste record updated.',
            'record' => new WasteRecordResource($wasteRecord->load(['location', 'category', 'creator'])),
        ]);
    }

    public function destroy(WasteRecord $wasteRecord): JsonResponse
    {
        $user = request()->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json(['message' => 'Only administrators can delete waste records.'], 403);
        }

        $wasteRecord->delete();

        return response()->json([
            'message' => 'Waste record deleted.',
        ]);
    }
}
