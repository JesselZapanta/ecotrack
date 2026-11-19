<?php

namespace App\Concerns\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CollectionSchedule;
use App\Models\Concern;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavBadgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = now()->toDateString();

        $concerns = Concern::query()->whereIn('status', [
            Concern::STATUS_OPEN,
            Concern::STATUS_ACKNOWLEDGED,
        ]);

        $schedules = CollectionSchedule::query();

        if ($user->isMaintenance()) {
            $schedules->where('assigned_to', $user->id);
        }

        $badges = [
            'concerns' => $concerns->count(),
        ];

        $scheduleCounts = (clone $schedules)
            ->selectRaw(
                'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS missed',
                [CollectionSchedule::STATUS_MISSED]
            )
            ->when(
                $user->isMaintenance(),
                fn ($query) => $query->selectRaw(
                    'SUM(CASE WHEN status = ? AND scheduled_date = ? THEN 1 ELSE 0 END) AS today',
                    [CollectionSchedule::STATUS_SCHEDULED, $today]
                )
            )
            ->first();

        $badges['missed'] = (int) ($scheduleCounts?->missed ?? 0);

        if ($user->isMaintenance()) {
            $badges['today'] = (int) ($scheduleCounts?->today ?? 0);
        }

        return response()->json([
            'data' => $badges,
        ]);
    }
}
