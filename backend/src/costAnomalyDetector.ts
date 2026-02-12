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

/**
 * Detect daily cost anomalies using Z-score
 */
export async function detectCostAnomalies(userId: string): Promise<Anomaly[]> {
    // Mock data for now as we don't have historical data
    // In a real app, we would query the DailyCost model
    const mockHistory = generateMockHistory(30);
    const anomalies: Anomaly[] = [];

    // Simple moving average + std dev
    const windowSize = 7;

    for (let i = windowSize; i < mockHistory.length; i++) {
        const window = mockHistory.slice(i - windowSize, i);
        const avg = window.reduce((sum, p) => sum + p.amount, 0) / windowSize;
        const stdDev = Math.sqrt(
            window.reduce((sum, p) => sum + Math.pow(p.amount - avg, 2), 0) / windowSize
        );

        const current = mockHistory[i];
        const threshold = 2 * stdDev; // 2 sigma

        if (Math.abs(current.amount - avg) > threshold && stdDev > 0) {
            anomalies.push({
                date: current.date,
                amount: current.amount,
                expectedAmount: avg,
                deviation: current.amount - avg,
                score: (current.amount - avg) / stdDev
            });
        }
    }

    return anomalies;
}

/**
 * Forecast future costs using linear regression
 */
export async function forecastCosts(userId: string, days: number = 30): Promise<CostDataPoint[]> {
    const history = generateMockHistory(30);
    const points = history.map((h, i) => ({ x: i, y: h.amount }));

    // Linear regression
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast: CostDataPoint[] = [];
    const lastDate = new Date(history[history.length - 1].date);

    for (let i = 1; i <= days; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + i);

        const x = n + i - 1;
        const y = slope * x + intercept;

        forecast.push({
            date: nextDate.toISOString().split('T')[0],
            amount: Math.max(0, y) // No negative costs
        });
    }

    return forecast;
}

function generateMockHistory(days: number): CostDataPoint[] {
    const data: CostDataPoint[] = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Base cost + random fluctuation + upward trend
        let amount = 50 + (Math.random() * 20) + (days - i) * 0.5;

        // Inject anomaly
        if (i === 5) amount += 150;

        data.push({
            date: date.toISOString().split('T')[0],
            amount: parseFloat(amount.toFixed(2))
        });
    }

    return data;
}
