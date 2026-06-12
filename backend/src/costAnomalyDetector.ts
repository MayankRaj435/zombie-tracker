import { CostExplorerClient, GetCostAndUsageCommand, Granularity } from '@aws-sdk/client-cost-explorer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CostDataPoint {
    date: string;
    amount: number;
}

export interface Anomaly {
    date: string;
    amount: number;
    expectedAmount: number;
    deviation: number;
    score: number;
}

export interface CostHistory {
    dataSource: 'real' | 'mock';
    history: CostDataPoint[];
    message?: string; // Shown when falling back to mock
}

export interface AnomalyResult {
    dataSource: 'real' | 'mock';
    anomalies: Anomaly[];
    message?: string;
}

export interface ForecastResult {
    dataSource: 'real' | 'mock';
    forecast: CostDataPoint[];
    message?: string;
}

export interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
}

// ─── Real AWS Cost Explorer ───────────────────────────────────────────────────

/**
 * Fetch the last `days` days of daily spend from AWS Cost Explorer and cache
 * results in the DailyCost table. Returns cached rows if they already exist for
 * today, to avoid redundant $0.01 API calls.
 */
async function fetchDailyCosts(
    userId: string,
    credentials: AwsCredentials,
    days: number = 30
): Promise<CostHistory> {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Check if we already have today's data cached
    const todayCached = await prisma.dailyCost.findFirst({
        where: { userId, date: today, service: null },
    });

    if (todayCached) {
        // Return full cached history from DB
        const cached = await prisma.dailyCost.findMany({
            where: { userId, service: null, date: { gte: startDateStr } },
            orderBy: { date: 'asc' },
        });

        if (cached.length > 0) {
            return {
                dataSource: 'real',
                history: cached.map(r => ({ date: r.date, amount: r.amount })),
            };
        }
    }

    // Fetch from Cost Explorer
    try {
        const client = new CostExplorerClient({
            region: 'us-east-1', // Cost Explorer is global, always use us-east-1
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
            },
        });

        const command = new GetCostAndUsageCommand({
            TimePeriod: {
                Start: startDateStr,
                End: today,
            },
            Granularity: Granularity.DAILY,
            Metrics: ['UnblendedCost'],
        });

        const response = await client.send(command);
        const results = response.ResultsByTime || [];

        const history: CostDataPoint[] = results.map(r => ({
            date: r.TimePeriod?.Start ?? '',
            amount: parseFloat(r.Total?.UnblendedCost?.Amount ?? '0'),
        })).filter(r => r.date !== '');

        // Cache results in DB (upsert to handle reruns)
        await Promise.all(
            history.map(point =>
                prisma.dailyCost.upsert({
                    where: { userId_date_service: { userId, date: point.date, service: null as unknown as string } },
                    update: { amount: point.amount },
                    create: { userId, date: point.date, amount: point.amount, service: null },
                })
            )
        );

        return { dataSource: 'real', history };
    } catch (error: any) {
        const isPermissionError =
            error.name === 'AccessDeniedException' ||
            error.Code === 'AccessDeniedException' ||
            error.message?.includes('not authorized');

        if (isPermissionError) {
            console.warn(
                `[costAnomalyDetector] User ${userId} lacks ce:GetCostAndUsage permission. Falling back to mock data.`
            );
        } else {
            console.error('[costAnomalyDetector] Cost Explorer error:', error);
        }

        return {
            dataSource: 'mock',
            history: generateMockHistory(days),
            message: isPermissionError
                ? 'Cost data is estimated — grant ce:GetCostAndUsage to your IAM user to see real spend.'
                : 'Cost data is estimated — AWS Cost Explorer returned an error.',
        };
    }
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────

/**
 * Detect daily cost anomalies using Z-score analysis.
 * Uses real AWS Cost Explorer when the user has the required IAM permission,
 * otherwise falls back to mock data with a disclaimer.
 */
export async function detectCostAnomalies(
    userId: string,
    credentials: AwsCredentials
): Promise<AnomalyResult> {
    const { dataSource, history, message } = await fetchDailyCosts(userId, credentials, 30);
    const anomalies = runAnomalyDetection(history);
    return { dataSource, anomalies, message };
}

function runAnomalyDetection(history: CostDataPoint[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const windowSize = 7;

    for (let i = windowSize; i < history.length; i++) {
        const window = history.slice(i - windowSize, i);
        const avg = window.reduce((sum, p) => sum + p.amount, 0) / windowSize;
        const stdDev = Math.sqrt(
            window.reduce((sum, p) => sum + Math.pow(p.amount - avg, 2), 0) / windowSize
        );

        if (stdDev === 0) continue; // Avoid division by zero

        const current = history[i];
        const zScore = (current.amount - avg) / stdDev;

        if (Math.abs(zScore) > 2) {
            anomalies.push({
                date: current.date,
                amount: current.amount,
                expectedAmount: parseFloat(avg.toFixed(2)),
                deviation: parseFloat((current.amount - avg).toFixed(2)),
                score: parseFloat(zScore.toFixed(2)),
            });
        }
    }

    return anomalies;
}

// ─── Cost Forecasting ─────────────────────────────────────────────────────────

/**
 * Forecast future daily costs using linear regression on historical data.
 * Uses real Cost Explorer data when available, otherwise falls back to mock.
 */
export async function forecastCosts(
    userId: string,
    credentials: AwsCredentials,
    days: number = 30
): Promise<ForecastResult> {
    const { dataSource, history, message } = await fetchDailyCosts(userId, credentials, 30);
    const forecast = runLinearForecast(history, days);
    return { dataSource, forecast, message };
}

function runLinearForecast(history: CostDataPoint[], forecastDays: number): CostDataPoint[] {
    if (history.length < 2) return [];

    const points = history.map((h, i) => ({ x: i, y: h.amount }));
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: CostDataPoint[] = [];
    const lastDate = new Date(history[history.length - 1].date);

    for (let i = 1; i <= forecastDays; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);

        const x = n + i - 1;
        forecast.push({
            date: nextDate.toISOString().split('T')[0],
            amount: parseFloat(Math.max(0, slope * x + intercept).toFixed(2)),
        });
    }

    return forecast;
}

// ─── Mock Fallback ────────────────────────────────────────────────────────────

function generateMockHistory(days: number): CostDataPoint[] {
    const data: CostDataPoint[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Base cost + random fluctuation + slight upward trend
        let amount = 50 + Math.random() * 20 + (days - i) * 0.5;

        // Inject a single spike to demonstrate anomaly detection
        if (i === 5) amount += 150;

        data.push({
            date: date.toISOString().split('T')[0],
            amount: parseFloat(amount.toFixed(2)),
        });
    }

    return data;
}
