import { useState } from "react";

export default function NewHabitForm({ onAddHabit }) {
  const [habitName, setHabitName] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const trimmedName = habitName.trim();
    // Only add the habit if the name is not empty
    if (trimmedName !== "") {
      onAddHabit(trimmedName);
      setHabitName(""); // Clear the input field after adding the habit
    }
  }

  return (
    <form className="flex gap-4 " onSubmit={onSubmit}>
      <input
        type="text"
        id="habit-name"
        className="grow p-3 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
        placeholder="Enter habit name"
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
      />

      <button
        type="submit"
        className="rounded bg-violet-800 px-3 py-1 text-sm hover:bg-violet-700"
      >
        Add Habit
      </button>
    </form>
  );
}
