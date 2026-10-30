<?php

namespace App\Admin\Users\Controllers;

use App\Http\Controllers\Controller;
use App\Admin\Users\Requests\StoreUserRequest;
use App\Admin\Users\Requests\UpdateUserRequest;
use App\Admin\Users\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'in:admin,maintenance,office'],
            'status' => ['nullable', 'in:active,inactive'],
            'office_id' => ['nullable', 'integer', 'exists:offices,id'],
            'sort' => ['nullable', 'in:id,name,email,role,created_at'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = User::query()->with('office.location');

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('username', 'like', $term);
            });
        }

        if (! empty($validated['role'])) {
            $query->where('role', $validated['role']);
        }

        if (! empty($validated['status'])) {
            $query->where('is_active', $validated['status'] === 'active');
        }

        if (! empty($validated['office_id'])) {
            $query->where('office_id', $validated['office_id']);
        }

        $sort = $validated['sort'] ?? 'id';
        $direction = $validated['direction'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 10;

        $users = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $password = $data['password'] ?? Str::password(12, symbols: false);

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'] ?? null,
            'email' => $data['email'],
            'password' => $password,
            'role' => $data['role'],
            'office_id' => $data['office_id'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'User created.',
            'user' => new UserResource($user->load('office.location')),
            'temporary_password' => $password,
        ], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if ($request->user()->id === $user->id) {
            if (array_key_exists('is_active', $data) && ! $data['is_active']) {
                return response()->json([
                    'message' => 'You cannot deactivate your own account.',
                ], 422);
            }

            if (isset($data['role']) && $data['role'] !== User::ROLE_ADMIN) {
                return response()->json([
                    'message' => 'You cannot change your own administrator role.',
                ], 422);
            }
        }

        $user->update($data);

        return response()->json([
            'message' => 'User updated.',
            'user' => new UserResource($user->load('office.location')),
        ]);
    }

    public function status(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        if ($request->user()->id === $user->id && ! $validated['is_active']) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user->update(['is_active' => $validated['is_active']]);

        return response()->json([
            'message' => $validated['is_active'] ? 'User activated.' : 'User deactivated.',
            'user' => new UserResource($user->load('office.location')),
        ]);
    }
}
