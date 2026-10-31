<?php

namespace App\Admin\Reports\Controllers;

use App\Admin\Reports\Requests\ReportFilterRequest;
use App\Http\Controllers\Controller;
use App\Models\CollectionSchedule;
use App\Models\Location;
use App\Models\WasteCategory;
use App\Models\WasteRecord;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller
{
    public function options(Request $request): JsonResponse
    {
        $user = $request->user();

        $locations = Location::query()
            ->where('is_active', true)
            ->orderBy('name');

        if ($user->isOffice()) {
            $locations->whereKey($user->office?->location_id);
        }

        return response()->json([
            'locations' => $locations->get(['id', 'name']),
            'categories' => WasteCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'color_code']),
        ]);
    }

    public function summary(ReportFilterRequest $request): JsonResponse
    {
        return response()->json([
            'report' => $this->buildReport($request),
        ]);
    }

    public function pdf(ReportFilterRequest $request): Response
    {
        $report = $this->buildReport($request);

        $pdf = Pdf::loadView('reports.waste-summary', ['report' => $report])
            ->setPaper('a4');

        $filename = 'ecotrack-report-'
            .$report['filters']['date_from']
            .'-to-'
            .$report['filters']['date_to']
            .'.pdf';

        return $pdf->download($filename);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildReport(ReportFilterRequest $request): array
    {
        $user = $request->user();
        $data = $request->validated();

        $dateFrom = $data['date_from'];
        $dateTo = $data['date_to'];
        $categoryId = $data['category_id'] ?? null;

        if ($user->isOffice()) {
            $locationId = $user->office?->location_id;

            if (! $locationId) {
                throw ValidationException::withMessages([
                    'location_id' => 'Your office has no assigned location yet.',
                ]);
            }
        } else {
            $locationId = $data['location_id'] ?? null;
        }

        $records = WasteRecord::query()
            ->whereBetween('waste_records.date', [$dateFrom, $dateTo]);

        if ($user->isMaintenance()) {
            $records->where('created_by', $user->id);
        }

        if ($locationId) {
            $records->where('waste_records.location_id', $locationId);
        }

        if ($categoryId) {
            $records->where('waste_records.category_id', $categoryId);
        }

        $totalKg = round((float) (clone $records)->sum('quantity_kg'), 2);
        $recordCount = (clone $records)->count();

        $byCategory = (clone $records)
            ->join('waste_categories', 'waste_categories.id', '=', 'waste_records.category_id')
            ->selectRaw('waste_categories.id as id, waste_categories.name as name, waste_categories.color_code as color_code, SUM(waste_records.quantity_kg) as kg, COUNT(*) as records')
            ->groupBy('waste_categories.id', 'waste_categories.name', 'waste_categories.color_code')
            ->orderByDesc('kg')
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'color_code' => $row->color_code,
                'kg' => round((float) $row->kg, 2),
                'records' => (int) $row->records,
                'share' => $totalKg > 0 ? round(((float) $row->kg / $totalKg) * 100, 1) : 0,
            ])
            ->values()
            ->all();

        $byLocation = (clone $records)
            ->join('locations', 'locations.id', '=', 'waste_records.location_id')
            ->selectRaw('locations.id as id, locations.name as name, locations.building as building, SUM(waste_records.quantity_kg) as kg, COUNT(*) as records')
            ->groupBy('locations.id', 'locations.name', 'locations.building')
            ->orderByDesc('kg')
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'building' => $row->building,
                'kg' => round((float) $row->kg, 2),
                'records' => (int) $row->records,
            ])
            ->values()
            ->all();

        $schedules = CollectionSchedule::query()
            ->whereBetween('scheduled_date', [$dateFrom, $dateTo]);

        if ($user->isMaintenance()) {
            $schedules->where('assigned_to', $user->id);
        }

        if ($locationId) {
            $schedules->whereHas('locations', fn ($query) => $query->whereKey($locationId));
        }

        if ($categoryId) {
            $schedules->whereHas('categories', fn ($query) => $query->whereKey($categoryId));
        }

        $counts = [];
        foreach (CollectionSchedule::STATUSES as $status) {
            $counts[$status] = (clone $schedules)->where('status', $status)->count();
        }

        $location = $locationId ? Location::find($locationId, ['id', 'name']) : null;
        $category = $categoryId ? WasteCategory::find($categoryId, ['id', 'name']) : null;

        return [
            'scope' => $user->isAdmin()
                ? 'All waste records and schedules'
                : ($user->isOffice()
                    ? 'Office location: '.($location?->name ?? 'Not assigned')
                    : 'Assigned collections and waste logged by '.$user->name),
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'location' => $location ? [
                    'id' => $location->id,
                    'name' => $location->name,
                ] : null,
                'category' => $category ? [
                    'id' => $category->id,
                    'name' => $category->name,
                ] : null,
            ],
            'summary' => [
                'total_kg' => $totalKg,
                'records' => $recordCount,
                'average_kg' => $recordCount > 0 ? round($totalKg / $recordCount, 2) : 0,
                'by_category' => $byCategory,
                'by_location' => $byLocation,
            ],
            'collections' => [
                'total' => array_sum($counts),
                'counts' => $counts,
            ],
            'generated_by' => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'generated_at' => now()->timezone('Asia/Manila')->toIso8601String(),
        ];
    }
}
