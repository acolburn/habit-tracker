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
          const monthlyActivityCount = habit.history.filter((day) =>
            day.startsWith(monthPrefix),
          ).length;

          return (
            <div key={habit.id}>
              {/* Title and Delete Button */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-800/60 py-2">
                <div>
                  <p className="font-semibold text-xl text-zinc-100">
                    {habit.name}
                  </p>
                  <span className="text-amber-400">
                    🔥
                    {monthlyActivityCount}/{daysInMonth}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onDeleteHabit(habit.id); // Call the onDeleteHabit function to handle any additional logic
                  }}
                  className="rounded bg-red-800 px-3 py-1 text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
              {/* Days of the month */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: daysToAdd }, (_, i) => (
                  <div key={"empty-" + i} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const dateKey = toDateKey(day);
                    const isSelected = habit.history.includes(dateKey);

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          onToggleDaySelection(habit.id, dateKey);
                        }}
                        className={
                          "rounded-full px-2 py-1 text-sm " +
                          (isSelected
                            ? "bg-violet-700 text-white"
                            : "bg-zinc-700 text-zinc-200 hover:bg-zinc-600")
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
