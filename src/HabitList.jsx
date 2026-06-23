export default function HabitList({
  year,
  month,
  habits,
  onDeleteHabit,
  onToggleDaySelection,
}) {
  function toDateKey(day) {
    const monthString = String(month + 1).padStart(2, "0"); // month is 0-indexed, so add 1
    const dayString = String(day).padStart(2, "0");
    return `${year}-${monthString}-${dayString}`;
  }

  // parseDateKey and formatDateKey are used for calculating streaks, which require
  // working with Date objects. The rest of the app uses date keys as strings;
  // these functions convert back and forth between the two formats.

  // Stored history keys are "YYYY-MM-DD"; split into numeric year/month/day parts.
  // Return a Date object for that date.
  function parseDateKey(dateKey) {
    const [yearPart, monthPart, dayPart] = dateKey.split("-").map(Number);

    // Use the numeric Date constructor so this stays in local time.
    // Month is 0-indexed in JS Date, so subtract 1.
    return new Date(yearPart, monthPart - 1, dayPart);
  }

  // Convert a Date object back into the stored "YYYY-MM-DD" history key format.
  function formatDateKey(date) {
    const yearPart = date.getFullYear();

    // getMonth() is 0-indexed, so add 1 and pad to 2 digits.
    const monthPart = String(date.getMonth() + 1).padStart(2, "0");

    // Pad day to 2 digits so keys stay lexically consistent.
    const dayPart = String(date.getDate()).padStart(2, "0");

    return `${yearPart}-${monthPart}-${dayPart}`;
  }

  // Current streak means consecutive days up to today:
  // count today if selected, otherwise start from yesterday.
  function calculateCurrentStreak(history) {
    const todayKey = formatDateKey(new Date());
    const hasToday = todayKey in history;

    // Build the starting date from a key so we can safely move backward by days.
    const cursorDate = parseDateKey(todayKey);
    if (!hasToday) {
      cursorDate.setDate(cursorDate.getDate() - 1);
    }

    let streakLength = 0;

    // Walk backward one day at a time until a date is missing from history.
    while (formatDateKey(cursorDate) in history) {
      streakLength += 1;
      cursorDate.setDate(cursorDate.getDate() - 1);
    }

    return streakLength;
  }

  const firstDayOfMonth = new Date(year, month).getDay();
  const daysToAdd = firstDayOfMonth;
  // Get the first day of the next month, then extract its day number
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthPrefix = toDateKey(1).slice(0, 7);

  return (
    <section className="bg-zinc-800 flex flex-col gap-3 rounded p-3">
      {habits.length === 0 ? (
        <p className="text-zinc-400 text-center">No habits registered yet</p>
      ) : (
        habits.map((habit) => {
          // Count how many days in the current month have a recorded level for this habit
          // Object.keys(habit.history) gives us all the date keys for this habit's history.
          const monthlyActivityCount = Object.keys(habit.history).filter(
            (day) => day.startsWith(monthPrefix),
          ).length;
          const currentStreak = calculateCurrentStreak(habit.history);

          return (
            <div key={habit.id}>
              {/* Title and Delete Button */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 py-1">
                <div>
                  <p className="font-semibold text-xl text-zinc-100">
                    {habit.name}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onDeleteHabit(habit.id);
                  }} // Call the onDeleteHabit function to handle any additional logic
                  className="rounded bg-red-800 px-3 py-1 text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-4 items-center justify-between text-amber-400 pb-2">
                <span>
                  {`This month: ${monthlyActivityCount}/${daysInMonth}`}
                </span>
                <span>
                  {" "}
                  Current Streak: {currentStreak > 1 ? "🔥" : ""}
                  {currentStreak}
                </span>
              </div>

              {/* Days of the month */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: daysToAdd }, (_, i) => (
                  <div key={"empty-" + i} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateKey = toDateKey(day);
                    const dayLevel = habit.history[dateKey];
                    // Determine if the day is selected based on whether dayLevel exists
                    const isSelected = dayLevel !== undefined;

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          onToggleDaySelection(habit.id, dateKey);
                        }}
                        className={
                          "rounded-full px-2 py-1 text-sm " +
                          (!isSelected
                            ? "bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                            : dayLevel === 1
                              ? "bg-violet-700 text-white"
                              : "bg-red-700 text-white")
                        }
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
