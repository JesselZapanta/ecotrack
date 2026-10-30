<?php

namespace App\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Auth\Requests\LoginRequest;
use App\Admin\Users\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->string('login')->trim()->toString();
        $field = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $token = auth('api')->attempt([
            $field => $login,
            'password' => $request->string('password')->toString(),
        ]);

        if (! $token) {
            return response()->json([
                'message' => 'Email or password is incorrect. Try again or ask the administrator to reset your password.',
            ], 401);
        }

        $user = auth('api')->user();

        if (! $user->is_active) {
            auth('api')->logout();

            return response()->json([
                'message' => 'Your account is deactivated. Ask the administrator to reactivate it.',
            ], 403);
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $user->loadMissing('office.location');

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => new UserResource($user),
            'redirect' => $user->homePath(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->loadMissing('office.location')),
        ]);
    }

    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }
}
