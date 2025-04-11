import { Document, Model } from "mongoose";

// Define a structure for each month's data
interface MonthData {
  month: string; // Month name (e.g., "Mar 2025")
  count: number; // Number of documents created in that month
}

// Generic function to generate data for the last 12 months
export async function generatorLast12MonthsData<T extends Document>(
  model: Model<T>, // Accepts a Mongoose model
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = []; // To hold the result array

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1); // Move one day forward to ensure current day is included

  for (let i = 11; i >= 0; i--) {
    // Calculate a 28-day time window for each "month"
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28, // End of current month window
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28, // Start of current month window (28 days before endDate)
    );

    // Format the month for display (e.g., "11 Mar 2025")
    const monthYear = endDate.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Count documents created between startDate and endDate
    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Push the result into the array
    last12Months.push({ month: monthYear, count });
  }

  // Return the aggregated result
  return { last12Months };
}
