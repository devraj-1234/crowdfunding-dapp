"use client";

interface ProgressBarProps {
  current: string;
  goal: string;
}

export default function ProgressBar({ current, goal }: ProgressBarProps) {
  const currentValue = BigInt(current);
  const goalValue = BigInt(goal);
  const percentage =
    goalValue === 0n ? 0 : Number((currentValue * 100n) / goalValue);
  const cappedPercentage = Math.min(100, percentage);

  return (
    <div className="w-full bg-gray-200 rounded-lg overflow-hidden border border-blue-200">
      <div
        className="relative h-2"
        style={{
          background: `linear-gradient(90deg, rgba(56, 189, 248, 0.2) ${cappedPercentage}%, transparent ${cappedPercentage}%)`,
        }}
      >
        <div
          className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
          style={{
            width: `${cappedPercentage}%`,
            background: "linear-gradient(90deg, #38bdf8, #60a5fa)",
            boxShadow:
              "0 0 10px rgba(56, 189, 248, 0.5), 0 0 20px rgba(56, 189, 248, 0.3), 0 0 30px rgba(56, 189, 248, 0.1)",
          }}
        />
      </div>
      <div className="flex justify-end mt-1">
        <span className="text-xs text-blue-500">{cappedPercentage}%</span>
      </div>
    </div>
  );
}