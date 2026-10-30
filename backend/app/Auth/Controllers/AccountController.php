<?php

namespace App\Auth\Controllers;

use App\Admin\Users\Resources\UserResource;
use App\Auth\Requests\UpdateAccountRequest;
use App\Auth\Requests\UpdatePasswordRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function update(UpdateAccountRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (array_key_exists('username', $data) && blank($data['username'])) {
            $data['username'] = null;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated.',
            'user' => new UserResource($user->loadMissing('office.location')),
        ]);
    }

    public function password(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Your current password is incorrect.',
            ]);
        }

        $user->update([
            'password' => $request->string('password')->toString(),
        ]);

        return response()->json([
            'message' => 'Password changed.',
        ]);
    }
}
