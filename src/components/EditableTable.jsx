import { useState, useEffect } from "react";
import { Trash2, Inbox, Loader } from "lucide-react";
import { getUsers } from "../services/users";

const columns = [
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "email", label: "Email" },
];

export default function EditableTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users = await getUsers();
        setRows(users);
      } catch (err) {
        setError("Something went wrong while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
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
          {!rows.length ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="text-center py-10 text-gray-400"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-6 h-6" />
                  <span>No data available</span>
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
                  <button className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition">
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
