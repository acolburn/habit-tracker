export default function Header({
  currentlyDisplayedMonthYear,
  previousMonth,
  nextMonth,
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <h1 className="text-3xl font-bold">Habit Tracker</h1>

      <div className="flex flex-col items-end">
        <p className="text-zinc-400">{currentlyDisplayedMonthYear}</p>

        <div className="mt-2 flex gap-2">
          <button
            className="rounded bg-violet-800 px-3 py-1 text-sm hover:bg-violet-700"
            onClick={previousMonth}
          >
            Prev
          </button>
          <button
            className="rounded bg-violet-800 px-3 py-1 text-sm hover:bg-violet-700"
            onClick={nextMonth}
          >
            Next
          </button>
        </div>
      </div>
    </header>
  );
}
