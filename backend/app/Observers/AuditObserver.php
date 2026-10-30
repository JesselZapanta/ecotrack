<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditObserver
{
    private const LABELS = [
        'App\Models\User' => 'User',
        'App\Models\Office' => 'Office',
        'App\Models\Location' => 'Location',
        'App\Models\WasteCategory' => 'Waste category',
        'App\Models\CollectionSchedule' => 'Schedule',
        'App\Models\WasteRecord' => 'Waste record',
        'App\Models\Concern' => 'Concern',
    ];

    public function created(Model $model): void
    {
        $this->record('created', $model, 'Created '.$this->label($model).' #'.$model->getKey());
    }

    public function updated(Model $model): void
    {
        $changes = $model->getChanges();
        unset($changes['updated_at'], $changes['remember_token']);

        if (array_key_exists('is_active', $changes)) {
            $active = (bool) $model->is_active;
            $this->record(
                $active ? 'activated' : 'deactivated',
                $model,
                ($active ? 'Activated ' : 'Deactivated ').$this->label($model).' #'.$model->getKey(),
                ['is_active' => $active]
            );

            return;
        }

        if (array_key_exists('status', $changes)) {
            $this->record(
                'status_changed',
                $model,
                'Changed status of '.$this->label($model).' #'.$model->getKey().' to '.$model->status,
                ['status' => $model->status]
            );

            return;
        }

        $passwordChanged = array_key_exists('password', $changes);
        unset($changes['password']);

        if ($passwordChanged) {
            $this->record(
                'password_changed',
                $model,
                'Changed password for '.$this->label($model).' #'.$model->getKey()
            );

            return;
        }

        if (empty($changes)) {
            return;
        }

        $this->record('updated', $model, 'Updated '.$this->label($model).' #'.$model->getKey(), $changes);
    }

    public function deleted(Model $model): void
    {
        $this->record('deleted', $model, 'Deleted '.$this->label($model).' #'.$model->getKey());
    }

    private function record(string $action, Model $model, string $description, array $meta = []): void
    {
        if (! Auth::id()) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => $this->label($model),
            'entity_id' => $model->getKey(),
            'description' => $description,
            'meta' => $meta ?: null,
        ]);
    }

    private function label(Model $model): string
    {
        return self::LABELS[$model::class] ?? class_basename($model);
    }
}
