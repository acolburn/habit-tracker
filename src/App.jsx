import Header from "./Header";
import NewHabitForm from "./NewHabitForm";
import HabitList from "./HabitList";
import { useState, useEffect } from "react";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function App() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const currentlyDisplayedMonthYear = `${monthNames[month]} ${year}`;

  // const [habits, setHabits] = useState([]);
  const [habits, setHabits] = useState(() => {
    const savedHabits = localStorage.getItem("habitTrackerHabits");
    if (savedHabits) {
      try {
        return JSON.parse(savedHabits);
      } catch (error) {
        console.error("Error parsing saved habits:", error);
      }
    }
    return [];
  });

  // useEffect(() => {
  //   const savedHabits = localStorage.getItem("habitTrackerHabits");
  //   if (savedHabits) {
  //     setHabits(JSON.parse(savedHabits));
  //   }
  // }, []);

  useEffect(() => {
    localStorage.setItem("habitTrackerHabits", JSON.stringify(habits));
  }, [habits]);

  function onAddHabit(habitName) {
    const newHabit = {
      id: crypto.randomUUID(),
      name: habitName,
      history: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  }

  function onDeleteHabit(habitId) {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  }

  function onToggleDaySelection(habitId, dateKey) {
    setHabits((prevHabits) =>
      // Map over the habits to find the one that matches the habitId
      prevHabits.map((habit) => {
        // If this habit doesn't match the habitId, return it unchanged
        if (habit.id !== habitId) return habit;
        // If this habit matches the habitId, toggle the dateKey in its history array
        // Check if the dateKey is already in the history array
        const isSelected = habit.history.includes(dateKey);
        // If the dateKey is already selected, remove it from the history; otherwise, add it
        const updatedHistory = isSelected
          ? habit.history.filter((d) => d !== dateKey)
          : [...habit.history, dateKey];
        // Return a new habit object (and set state) with the updated habit.history array
        return { ...habit, history: updatedHistory };
      }),
    );
  }

  // get previous month, accounting for year change (e.g., from January to December of the previous year)
  function getPreviousMonth() {
    // Handle the case when the current month is January (month index 0)
    if (month === 0) {
      setYear((year) => year - 1);
      setMonth(11);
    } else {
      setMonth((month) => month - 1);
    }
  }

  // get next month, accounting for year change (e.g., from December to January of the next year)
  function getNextMonth() {
    // Handle the case when the current month is December (month index 11)
    if (month === 11) {
      setYear((year) => year + 1);
      setMonth(0);
    } else {
      setMonth((month) => month + 1);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <Header
        previousMonth={getPreviousMonth}
        nextMonth={getNextMonth}
        currentlyDisplayedMonthYear={currentlyDisplayedMonthYear}
      />

      <NewHabitForm onAddHabit={onAddHabit} />
      <HabitList
        year={year}
        month={month}
        habits={habits}
        onDeleteHabit={onDeleteHabit}
        onToggleDaySelection={onToggleDaySelection}
      />
    </div>
  );
}

export default App;
