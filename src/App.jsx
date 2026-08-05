import Header from "./Header";
import NewHabitForm from "./NewHabitForm";
import HabitList from "./HabitList";
import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

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

// function createHabitId() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

function App() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const currentlyDisplayedMonthYear = `${monthNames[month]} ${year}`;

  // const [habits, setHabits] = useState(() => {
  //   const savedHabits = localStorage.getItem("habitTrackerHabits");
  //   if (savedHabits) {
  //     try {
  //       return JSON.parse(savedHabits);
  //     } catch (error) {
  //       console.error("Error parsing saved habits:", error);
  //     }
  //   }
  //   return [];
  // });
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // useEffect(() => {
  //   localStorage.setItem("habitTrackerHabits", JSON.stringify(habits));
  // }, [habits]);

  // This useEffect runs once when component mounts,
  // but sets up a real-time listener to the "habits" collection in Firestore
  // that runs whenever the collection changes, updating the local state with the latest data.
  useEffect(() => {
    if (!user) return;

    const habitsRef = collection(db, "users", user.uid, "habits");

    const unsubscribe = onSnapshot(habitsRef, (snapshot) => {
      const firestoreHabits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(firestoreHabits);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Set up an authentication state listener that runs whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []); // runs once on mount to set up the auth state listener

  // function onAddHabit(habitName) {
  //   const newHabit = {
  //     id: createHabitId(),
  //     name: habitName,
  //     history: {},
  //   };
  //   setHabits((prev) => [...prev, newHabit]);
  // }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");

    if (!email.trim() || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    try {
      if (authMode === "signIn") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error authenticating:", error);
      setAuthError(error.message || "Authentication failed.");
    }
  }

  function toggleAuthMode() {
    setAuthMode((currentMode) =>
      currentMode === "signIn" ? "signUp" : "signIn",
    );
    setAuthError("");
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function onAddHabit(habitName) {
    if (!user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "habits"), {
        name: habitName,
        history: {},
      });
    } catch (error) {
      console.error("Error adding habit:", error);
    }
  }

  // function onDeleteHabit(habitId) {
  //   setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  // }
  async function onDeleteHabit(habitId) {
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "habits", habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  }

  // function onToggleDaySelection(habitId, dateKey) {
  //   setHabits((prevHabits) =>
  //     // Map over the habits to find the one that matches the habitId
  //     prevHabits.map((habit) => {
  //       // If this habit doesn't match the habitId, return it unchanged
  //       if (habit.id !== habitId) return habit;
  //       // If this habit matches the habitId, toggle the dateKey in its history array
  //       // Read current level for this date
  //       const currentLevel = habit.history[dateKey];
  //       // Create a new history object to ensure immutability
  //       const updatedHistory = { ...habit.history };
  //       if (currentLevel === undefined) {
  //         // If the dateKey is not in the history, add it with level 1
  //         updatedHistory[dateKey] = 1;
  //       } else if (currentLevel === 1) {
  //         // If the dateKey is already at level 1, increment it to level 2
  //         updatedHistory[dateKey] = 2;
  //       } else if (currentLevel === 2) {
  //         // If the dateKey is already at level 2, remove it from the history
  //         delete updatedHistory[dateKey];
  //       }
  //       // Return a new habit object (and set state) with the updated habit.history array
  //       return { ...habit, history: updatedHistory };
  //     }),
  //   );
  // }

  // When user clicks a day for a habit, function cycles through three states:
  // not selected, level 1, and level 2. Updates the habit's history in Firestore.
  async function onToggleDaySelection(habitId, dateKey) {
    if (!user) return;

    // Find the habit to update in the current state
    const habitToUpdate = habits.find((habit) => habit.id === habitId);
    // If the habit is not found, exit the function early
    if (!habitToUpdate) return;

    // Read current level for this date; dateKey is string, e.g., "2023-09-15"
    // Value can be undefined (not selected), 1 (level 1), or 2 (level 2)
    const currentLevel = habitToUpdate.history?.[dateKey];
    // Copy the existing history object to ensure immutability; can't change original habit.history directly
    const updatedHistory = { ...(habitToUpdate.history || {}) };

    // Cycle through the three states: undefined -> 1 -> 2 -> undefined
    if (currentLevel === undefined) {
      updatedHistory[dateKey] = 1;
    } else if (currentLevel === 1) {
      updatedHistory[dateKey] = 2;
    } else if (currentLevel === 2) {
      delete updatedHistory[dateKey];
    }

    // Update the habit's history in Firestore using updateDoc
    // Only the history field is updated; other fields remain unchanged. This
    // ensures that the habit's name and other properties are preserved.
    // Firestore emits a new snapshot, which triggers the onSnapshot listener in
    // useEffect, updating the local state with the latest data.
    try {
      await updateDoc(doc(db, "users", user.uid, "habits", habitId), {
        history: updatedHistory,
      });
    } catch (error) {
      console.error("Error updating habit history:", error);
    }
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
      <div className="flex items-center justify-between">
        {user ? (
          <>
            <p className="text-sm">Signed in as {user.email}</p>
            <button
              onClick={handleSignOut}
              className="border px-3 py-1 rounded"
            >
              Sign out
            </button>
          </>
        ) : (
          <div className="w-full" />
        )}
      </div>

      {user ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col gap-3 rounded border p-4">
          <h2 className="text-lg font-semibold">
            {authMode === "signIn" ? "Sign in" : "Create account"}
          </h2>
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="rounded border px-3 py-2"
              autoComplete="email"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="rounded border px-3 py-2"
              autoComplete={
                authMode === "signIn" ? "current-password" : "new-password"
              }
            />
            {authError ? (
              <p className="text-sm text-red-500">{authError}</p>
            ) : null}
            <button
              type="submit"
              className="rounded bg-violet-800 px-3 py-2 text-white hover:bg-violet-700"
            >
              {authMode === "signIn" ? "Sign in with email" : "Create account"}
            </button>
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sm text-violet-700 underline"
            >
              {authMode === "signIn"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </form>
          <p className="text-sm">Please sign in to view your habits.</p>
        </div>
      )}
    </div>
  );
}

export default App;
