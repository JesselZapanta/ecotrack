<?php

namespace App\Admin\Categories\Controllers;

use App\Admin\Categories\Requests\StoreCategoryRequest;
use App\Admin\Categories\Requests\UpdateCategoryRequest;
use App\Admin\Categories\Resources\CategoryResource;
use App\Http\Controllers\Controller;
use App\Models\WasteCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
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

        $query = WasteCategory::query();

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('name', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        $sort = $validated['sort'] ?? 'id';
        $direction = $validated['direction'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;

        $categories = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = WasteCategory::create($request->validated());

        return response()->json([
            'message' => 'Category created.',
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function update(UpdateCategoryRequest $request, WasteCategory $category): JsonResponse
    {
        $category->update($request->validated());

        return response()->json([
            'message' => 'Category updated.',
            'category' => new CategoryResource($category->fresh()),
        ]);
    }

    public function status(Request $request, WasteCategory $category): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $category->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'message' => $validated['is_active'] ? 'Category activated.' : 'Category deactivated.',
            'category' => new CategoryResource($category->fresh()),
        ]);
    }
}
