<?php

namespace App\Admin\Schedules\Controllers;

use App\Admin\Schedules\Requests\StoreScheduleRequest;
use App\Admin\Schedules\Requests\UpdateScheduleRequest;
use App\Admin\Schedules\Requests\UpdateScheduleStatusRequest;
use App\Admin\Schedules\Resources\ScheduleResource;
use App\Http\Controllers\Controller;
use App\Models\CollectionSchedule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:Scheduled,Collected,Missed,Cancelled'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'category_id' => ['nullable', 'integer', 'exists:waste_categories,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'sort' => ['nullable', 'in:id,scheduled_date,created_at,status'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $query = CollectionSchedule::query()
            ->with([
                'assignee:id,name',
                'locations:id,name,building',
                'categories:id,name,color_code',
            ]);

        $this->applyRoleScope($query, $user, $validated);

        if (! empty($validated['search'])) {
            $term = '%'.$validated['search'].'%';
            $query->where(function ($builder) use ($term) {
                $builder
                    ->where('notes', 'like', $term)
                    ->orWhereHas('locations', fn ($locations) => $locations
                        ->where('name', 'like', $term)
                        ->orWhere('building', 'like', $term))
                    ->orWhereHas('assignee', fn ($assignees) => $assignees->where('name', 'like', $term));
            });
        }

        if (! empty($validated['status'])) {
            $query->where('status', $validated['status']);
        }

        if (! empty($validated['date'])) {
            $query->whereDate('scheduled_date', $validated['date']);
        } else {
            if (! empty($validated['date_from'])) {
                $query->whereDate('scheduled_date', '>=', $validated['date_from']);
            }
            if (! empty($validated['date_to'])) {
                $query->whereDate('scheduled_date', '<=', $validated['date_to']);
            }
        }

        if ($user->isAdmin()) {
            if (! empty($validated['location_id'])) {
                $query->whereHas('locations', fn ($builder) => $builder->where('locations.id', $validated['location_id']));
            }
            if (! empty($validated['category_id'])) {
                $query->whereHas('categories', fn ($builder) => $builder->where('waste_categories.id', $validated['category_id']));
            }
            if (! empty($validated['assigned_to'])) {
                $query->where('assigned_to', $validated['assigned_to']);
            }
        }

        $sort = $validated['sort'] ?? 'status';
        $direction = $validated['direction'] ?? 'asc';
        $perPage = $validated['per_page'] ?? 10;

        if ($sort === 'status') {
            $query->orderByRaw("CASE status WHEN 'Missed' THEN 1 WHEN 'Scheduled' THEN 2 WHEN 'Cancelled' THEN 3 WHEN 'Collected' THEN 4 ELSE 5 END " . ($direction === 'desc' ? 'desc' : 'asc'));
        } else {
            $query->orderBy($sort, $direction);
        }

        $schedules = $query
            ->orderBy('id', $direction)
            ->paginate($perPage)
            ->withQueryString();

        return ScheduleResource::collection($schedules);
    }

    public function show(Request $request, CollectionSchedule $schedule): JsonResponse
    {
        $this->authorizeView($request->user(), $schedule);

        $schedule->load([
            'assignee:id,name',
            'locations:id,name,building',
            'categories:id,name,color_code',
            'statusHistories.changedBy:id,name',
        ]);

        return response()->json([
            'schedule' => new ScheduleResource($schedule),
        ]);
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['assigned_to'])) {
            $assignee = User::find($data['assigned_to']);
            if (! $assignee || $assignee->role !== User::ROLE_MAINTENANCE) {
                return response()->json(['message' => 'Assignee must be a maintenance account.'], 422);
            }
        }

        $schedule = CollectionSchedule::create([
            'scheduled_date' => $data['scheduled_date'],
            'window_start' => $data['window_start'],
            'window_end' => $data['window_end'],
            'recurrence_rule' => $data['recurrence_rule'] ?? null,
            'assigned_to' => $data['assigned_to'] ?? null,
            'status' => CollectionSchedule::STATUS_SCHEDULED,
            'notes' => $data['notes'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        $schedule->locations()->sync($data['location_ids']);
        $schedule->categories()->sync($data['category_ids']);

        $schedule->statusHistories()->create([
            'old_status' => null,
            'new_status' => CollectionSchedule::STATUS_SCHEDULED,
            'changed_by' => $request->user()->id,
        ]);

        $schedule->load([
            'assignee:id,name',
            'locations:id,name,building',
            'categories:id,name,color_code',
            'statusHistories.changedBy:id,name',
        ]);

        return response()->json([
            'message' => 'Schedule created.',
            'schedule' => new ScheduleResource($schedule),
        ], 201);
    }

    public function update(UpdateScheduleRequest $request, CollectionSchedule $schedule): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('assigned_to', $data) && ! empty($data['assigned_to'])) {
            $assignee = User::find($data['assigned_to']);
            if (! $assignee || $assignee->role !== User::ROLE_MAINTENANCE) {
                return response()->json(['message' => 'Assignee must be a maintenance account.'], 422);
            }
        }

        $schedule->fill([
            'scheduled_date' => $data['scheduled_date'] ?? $schedule->scheduled_date,
            'window_start' => $data['window_start'] ?? $schedule->window_start,
            'window_end' => $data['window_end'] ?? $schedule->window_end,
            'recurrence_rule' => array_key_exists('recurrence_rule', $data) ? $data['recurrence_rule'] : $schedule->recurrence_rule,
            'assigned_to' => array_key_exists('assigned_to', $data) ? $data['assigned_to'] : $schedule->assigned_to,
            'notes' => array_key_exists('notes', $data) ? $data['notes'] : $schedule->notes,
        ]);
        $schedule->save();

        if (! empty($data['location_ids'])) {
            $schedule->locations()->sync($data['location_ids']);
        }

        if (! empty($data['category_ids'])) {
            $schedule->categories()->sync($data['category_ids']);
        }

        $schedule->load([
            'assignee:id,name',
            'locations:id,name,building',
            'categories:id,name,color_code',
            'statusHistories.changedBy:id,name',
        ]);

        return response()->json([
            'message' => 'Schedule updated.',
            'schedule' => new ScheduleResource($schedule),
        ]);
    }

    public function status(UpdateScheduleStatusRequest $request, CollectionSchedule $schedule): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            if (! $user->isMaintenance() || (int) $schedule->assigned_to !== (int) $user->id) {
                return response()->json([
                    'message' => 'Only the assigned maintenance personnel or an administrator can update this collection.',
                ], 403);
            }

            $allowed = $this->allowedMaintenanceTransitions($schedule->status);
            if (! in_array($request->validated()['status'], $allowed, true)) {
                return response()->json([
                    'message' => "Cannot change status from {$schedule->status} to {$request->validated()['status']}.",
                ], 422);
            }
        }

        $data = $request->validated();

        if ($schedule->status === $data['status']) {
            return response()->json([
                'message' => "Schedule is already {$data['status']}.",
            ], 422);
        }

        $old = $schedule->status;
        $schedule->status = $data['status'];
        $schedule->save();

        $schedule->statusHistories()->create([
            'old_status' => $old,
            'new_status' => $data['status'],
            'changed_by' => $user->id,
            'remark' => $data['remark'] ?? null,
        ]);

        $schedule->load([
            'assignee:id,name',
            'locations:id,name,building',
            'categories:id,name,color_code',
            'statusHistories.changedBy:id,name',
        ]);

        return response()->json([
            'message' => "Collection marked as {$data['status']}.",
            'schedule' => new ScheduleResource($schedule),
        ]);
    }

    public function sweep(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isMaintenance()) {
            return response()->json(['message' => 'Only administrators or maintenance personnel can sweep overdue runs.'], 403);
        }

        $today = now()->format('Y-m-d');
        $time = now()->format('H:i:s');

        $query = CollectionSchedule::query()
            ->where('status', CollectionSchedule::STATUS_SCHEDULED)
            ->where(function ($builder) use ($today, $time) {
                $builder
                    ->whereDate('scheduled_date', '<', $today)
                    ->orWhere(function ($inner) use ($today, $time) {
                        $inner
                            ->whereDate('scheduled_date', $today)
                            ->where('window_end', '<', $time);
                    });
            });

        $this->applyRoleScope($query, $user);

        $swept = [];

        foreach ($query->get() as $schedule) {
            $old = $schedule->status;
            $schedule->status = CollectionSchedule::STATUS_MISSED;
            $schedule->save();

            $schedule->statusHistories()->create([
                'old_status' => $old,
                'new_status' => CollectionSchedule::STATUS_MISSED,
                'changed_by' => $user->id,
                'remark' => 'Auto-marked missed: collection window passed.',
            ]);

            $swept[] = $schedule->id;
        }

        return response()->json([
            'message' => count($swept) > 0
                ? count($swept) . ' past-due run(s) marked as Missed.'
                : 'No past-due runs to sweep.',
            'swept' => count($swept),
            'ids' => $swept,
        ]);
    }

    public function destroy(CollectionSchedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json([
            'message' => 'Schedule deleted.',
        ]);
    }

    private function applyRoleScope($query, User $user, array $validated = []): void
    {
        if ($user->isMaintenance()) {
            $query->where('assigned_to', $user->id);

            return;
        }

        if ($user->isOffice()) {
            $locationId = $user->office?->location_id;

            if (! $locationId) {
                $query->whereRaw('1 = 0');

                return;
            }

            $query->whereHas('locations', fn ($builder) => $builder->where('locations.id', $locationId));
        }
    }


    private function authorizeView(User $user, CollectionSchedule $schedule): void
    {
        if ($user->isAdmin()) {
            return;
        }

        if ($user->isMaintenance()) {
            if ((int) $schedule->assigned_to !== (int) $user->id) {
                abort(403, 'You can only view your assigned collections.');
            }

            return;
        }

        $locationId = $user->office?->location_id;
        $belongs = $locationId
            ? $schedule->locations()->where('locations.id', $locationId)->exists()
            : false;

        if (! $belongs) {
            abort(403, 'Your account can view this page but not change it.');
        }
    }

    /**
     * @return list<string>
     */
    private function allowedMaintenanceTransitions(string $from): array
    {
        return CollectionSchedule::STATUSES;
    }
}
