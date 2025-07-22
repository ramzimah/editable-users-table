import { useState, useEffect } from "react";
import {
  Trash2,
  Inbox,
  Loader,
  Plus,
  TriangleAlert,
  Undo,
  Redo,
} from "lucide-react";
import { getUsers, addUser, deleteUser } from "../api/users";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  name: z
    .string()
    .min(3, "Please enter a valid name (at least 3 characters)")
    .max(50, "Name must be at most 50 characters"),
  age: z.coerce
    .number()
    .int()
    .gte(18, "Age must be at least 18")
    .lte(100, "Age must be at most 100"),
  email: z.email("Please enter a valid email address"),
});

const columns = [
  { key: "name", label: "Name", type: "text" },
  { key: "age", label: "Age", type: "number" },
  { key: "email", label: "Email", type: "email" },
];

export default function EditableTable() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRow, setNewRow] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const users = await getUsers();
        setRows(users);
      } catch {
        setError("Something went wrong while fetching users.");
      } finally {
        setIsLoading(false);
      }
    };
    //TODO: we can add pagination and filtering later
    fetchUsers();
  }, []);

  const addRow = () => {
    //check if there's already a new row being added
    if (newRow) {
      toast.error(
        "Please save or cancel the current new row before adding another."
      );
      return;
    }
    const emptyRow = {
      name: "",
      email: "",
      age: "",
    };
    setNewRow(emptyRow);
  };

  const saveNewRow = async () => {
    const result = userSchema.safeParse(newRow);
    if (!result.success) {
      const firstError = result.error.issues[0].message;
      toast.error(firstError);
      return;
    }
    //check for duplicate email(this is only since i'm using mockapi. in a real scenario, this should be done on the server)
    if (rows.some((row) => row.email === newRow.email.trim())) {
      toast.error("Email already exists. Please use a different email.");
      return;
    }

    try {
      setIsSaving(true);
      const savedUser = await addUser({
        name: newRow.name.trim(),
        email: newRow.email.trim(),
        age: parseInt(newRow.age),
      });

      //add to rows and clear newRow
      setRows((prevRows) => [savedUser, ...prevRows]);
      setUndoStack((prev) => [...prev, { type: "add", row: savedUser }]);
      setNewRow(null);
      setRedoStack([]); //clear redo stack on new action
      toast.success("User added successfully!");
    } catch {
      toast.error("Failed to save user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelNewRow = () => {
    setNewRow(null);
  };

  const updateNewRow = (field, value) => {
    setNewRow((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteUser = (user) => {
    toast(`Delete "${user.name}"`, {
      description: "Are you sure you want to delete this user?",
      duration: 3000,
      icon: <TriangleAlert className="w-6 h-6 text-red-500" />,
      position: "top-center",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteUser(user.id);
            setRows((prevRows) => prevRows.filter((row) => row.id !== user.id));
            setUndoStack((prev) => [...prev, { type: "delete", row: user }]);
            setRedoStack([]); //clear redo stack on new action
            toast.success("User deleted successfully!");
          } catch {
            toast.error("Failed to delete user. Please try again.");
          }
        },
      },
    });
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    setUndoStack(newUndoStack);

    try {
      if (lastAction.type === "add") {
        //undo add: delete the user
        await deleteUser(lastAction.row.id);
        setRows((prev) => prev.filter((row) => row.id !== lastAction.row.id));
        //add to redo stack with opposite action
        setRedoStack((prev) => [...prev, { type: "add", row: lastAction.row }]);
        toast.success("Add action undone!");
      } else if (lastAction.type === "delete") {
        //undo delete: add the user back
        const restoredUser = await addUser(lastAction.row);
        setRows((prev) => [restoredUser, ...prev]);
        //add to redo stack with opposite action
        setRedoStack((prev) => [
          ...prev,
          { type: "delete", row: restoredUser },
        ]);
        toast.success("Delete action undone!");
      }
    } catch {
      toast.error("Failed to undo action. Please try again.");
      //restore undo stack if operation failed
      setUndoStack(undoStack);
    }
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;

    const lastRedo = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    setRedoStack(newRedoStack);

    try {
      if (lastRedo.type === "add") {
        //redo add: add the user back
        const restoredUser = await addUser(lastRedo.row);
        setRows((prev) => [restoredUser, ...prev]);
        setUndoStack((prev) => [...prev, { type: "add", row: restoredUser }]);
        toast.success("Add action redone!");
      } else if (lastRedo.type === "delete") {
        //redo delete: delete the user again
        await deleteUser(lastRedo.row.id);
        setRows((prev) => prev.filter((r) => r.id !== lastRedo.row.id));
        setUndoStack((prev) => [
          ...prev,
          { type: "delete", row: lastRedo.row },
        ]);
        toast.success("Delete action redone!");
      }
    } catch {
      toast.error("Failed to redo action. Please try again.");
      setRedoStack(redoStack);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-2xl">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <span className="text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-2xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-500 mb-4">❌</div>
          <span className="text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📝 Users</h1>
      <p className="text-gray-600 mb-4">
        Manage your users data with add, delete, undo, and redo functionality
      </p>

      <div className="flex gap-4 mb-4">
        <button
          onClick={addRow}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          <Plus className="inline-block w-4 h-4 mr-1" /> Add Row
        </button>
        <button
          onClick={handleUndo}
          disabled={!undoStack.length}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Undo className="inline-block w-4 h-4 mr-1" /> Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={!redoStack.length}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Redo className="inline-block w-4 h-4 mr-1" /> Redo
        </button>
      </div>

      <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg">
        <thead className="text-xs uppercase bg-gray-100 text-gray-600">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 capitalize">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {newRow && (
            <tr className="bg-blue-50 hover:bg-blue-100 transition">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 border-b border-gray-200"
                >
                  <input
                    name={col.key}
                    type={col.type}
                    value={newRow[col.key]}
                    onChange={(e) => updateNewRow(col.key, e.target.value)}
                    placeholder={`Enter ${col.label}`}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    disabled={isSaving}
                  />
                </td>
              ))}
              <td className="px-4 py-3 text-center border-b border-gray-200">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={saveNewRow}
                    disabled={isSaving}
                    className="bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 transition text-xs disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelNewRow}
                    disabled={isSaving}
                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition text-xs disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          )}

          {!rows.length && !newRow ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-10 text-gray-400"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-6 h-6" />
                  <span>No data available yet</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="bg-white hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 border-b border-gray-200"
                  >
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-center border-b border-gray-200">
                  <button
                    className="text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
                    onClick={() => handleDeleteUser(row)}
                  >
                    <Trash2 className="inline-block w-4 h-4 cursor-pointer" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
