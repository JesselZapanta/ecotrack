<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Waste &amp; Collection Report</title>
    <style>
        @page { margin: 28px 32px 34px; }
        * { box-sizing: border-box; }
        body { font-family: "DejaVu Sans", sans-serif; font-size: 10px; color: #121814; margin: 0; }
        .brand { font-size: 19px; font-weight: bold; color: #0E4A36; letter-spacing: 0.4px; }
        .brand-sub { font-size: 9px; color: #6E756D; margin-top: 2px; }
        .rule { border-top: 2px solid #0E4A36; margin: 10px 0 16px; }
        h1 { font-size: 16px; margin: 0 0 3px; color: #121814; }
        .meta { font-size: 9px; color: #6E756D; }
        h2 { font-size: 11.5px; color: #0E4A36; margin: 18px 0 6px; }
        table { width: 100%; border-collapse: collapse; }
        .filters td { border: 1px solid #E3E1D8; padding: 6px 8px; vertical-align: top; }
        .label { font-size: 7.5px; letter-spacing: 0.7px; text-transform: uppercase; color: #6E756D; }
        .value { font-size: 10px; font-weight: bold; margin-top: 2px; }
        .stats { margin-top: 14px; border-collapse: separate; border-spacing: 6px 0; }
        .stats td { width: 25%; border: 1px solid #E3E1D8; padding: 8px; vertical-align: top; }
        .stat-value { font-size: 15px; font-weight: bold; margin-top: 3px; }
        .stat-label { font-size: 7.5px; letter-spacing: 0.7px; text-transform: uppercase; color: #6E756D; }
        .data th { background: #F5F4EF; border-bottom: 1px solid #E3E1D8; padding: 6px; text-align: left; font-size: 7.5px; letter-spacing: 0.6px; text-transform: uppercase; color: #6E756D; }
        .data td { border-bottom: 1px solid #E3E1D8; padding: 6px; font-size: 9.5px; }
        .num { text-align: right; }
        .dot { display: inline-block; width: 6px; height: 6px; border-radius: 3px; margin-right: 4px; }
        .empty { color: #6E756D; font-size: 9.5px; padding: 8px 0; }
        .footer { margin-top: 22px; border-top: 1px solid #E3E1D8; padding-top: 8px; font-size: 8px; color: #6E756D; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="brand">EcoTrack TCGC</div>
    <div class="brand-sub">Waste Management &amp; Monitoring | Tangub City Global College</div>
    <div class="rule"></div>

    <h1>Waste &amp; Collection Report</h1>
    <div class="meta">
        Generated {{ \Carbon\Carbon::parse($report['generated_at'])->format('M j, Y g:i A') }}
        by {{ $report['generated_by']['name'] }}
    </div>
    <div class="meta">Scope: {{ $report['scope'] }}</div>

    <table class="filters" style="margin-top: 14px;">
        <tr>
            <td>
                <div class="label">Period</div>
                <div class="value">{{ $report['filters']['date_from'] }} to {{ $report['filters']['date_to'] }}</div>
            </td>
            <td>
                <div class="label">Location</div>
                <div class="value">{{ $report['filters']['location']['name'] ?? 'All locations' }}</div>
            </td>
            <td>
                <div class="label">Category</div>
                <div class="value">{{ $report['filters']['category']['name'] ?? 'All categories' }}</div>
            </td>
        </tr>
    </table>

    <table class="stats">
        <tr>
            <td>
                <div class="stat-label">Total waste</div>
                <div class="stat-value">{{ number_format($report['summary']['total_kg'], 2) }} kg</div>
            </td>
            <td>
                <div class="stat-label">Records</div>
                <div class="stat-value">{{ number_format($report['summary']['records']) }}</div>
            </td>
            <td>
                <div class="stat-label">Average / record</div>
                <div class="stat-value">{{ number_format($report['summary']['average_kg'], 2) }} kg</div>
            </td>
            <td>
                <div class="stat-label">Collections</div>
                <div class="stat-value">{{ number_format($report['collections']['total']) }}</div>
            </td>
        </tr>
    </table>

    <h2>Waste by category</h2>
    @if (count($report['summary']['by_category']) === 0)
        <div class="empty">No waste records match the selected filters.</div>
    @else
        <table class="data">
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="num">Records</th>
                    <th class="num">Quantity</th>
                    <th class="num">Share</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($report['summary']['by_category'] as $category)
                    <tr>
                        <td>
                            <span class="dot" style="background: {{ $category['color_code'] }};"></span>
                            {{ $category['name'] }}
                        </td>
                        <td class="num">{{ number_format($category['records']) }}</td>
                        <td class="num">{{ number_format($category['kg'], 2) }} kg</td>
                        <td class="num">{{ $category['share'] }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Waste by location</h2>
    @if (count($report['summary']['by_location']) === 0)
        <div class="empty">No waste records match the selected filters.</div>
    @else
        <table class="data">
            <thead>
                <tr>
                    <th>Location</th>
                    <th>Building</th>
                    <th class="num">Records</th>
                    <th class="num">Quantity</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($report['summary']['by_location'] as $location)
                    <tr>
                        <td>{{ $location['name'] }}</td>
                        <td>{{ $location['building'] ?? '—' }}</td>
                        <td class="num">{{ number_format($location['records']) }}</td>
                        <td class="num">{{ number_format($location['kg'], 2) }} kg</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Collection performance</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Status</th>
                <th class="num">Schedules</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($report['collections']['counts'] as $status => $count)
                <tr>
                    <td>{{ $status }}</td>
                    <td class="num">{{ number_format($count) }}</td>
                </tr>
            @endforeach
            <tr>
                <td><strong>Total</strong></td>
                <td class="num"><strong>{{ number_format($report['collections']['total']) }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Generated by {{ $report['generated_by']['name'] }} ({{ ucfirst($report['generated_by']['role']) }})
        on {{ \Carbon\Carbon::parse($report['generated_at'])->format('M j, Y g:i A') }}.<br>
        Filters — period: {{ $report['filters']['date_from'] }} to {{ $report['filters']['date_to'] }};
        location: {{ $report['filters']['location']['name'] ?? 'all' }};
        category: {{ $report['filters']['category']['name'] ?? 'all' }}.<br>
        EcoTrack TCGC | Waste Management &amp; Monitoring
    </div>
</body>
</html>
