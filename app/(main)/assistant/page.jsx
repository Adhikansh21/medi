"use client";

import { useState } from "react";

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello 👋 Please tell me your symptoms." }
  ]);
  const [input, setInput] = useState("");
  const [doctors, setDoctors] = useState([]);

  async function send() {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");

    const res = await fetch("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);

    if (data.doctors) setDoctors(data.doctors);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">AI Health Assistant</h1>

      <div className="border h-[400px] p-4 mb-4 overflow-y-auto rounded">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "assistant" ? "text-blue-500" : ""}>
            <b>{m.role === "assistant" ? "Assistant" : "You"}:</b> {m.text}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your symptoms..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={send} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>

      {doctors.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Recommended Doctors</h2>
          {doctors.map((d, index) => (
  <div
    key={d.id}
    className={`border p-4 rounded mb-3 flex justify-between items-center transition ${
      index === 0
        ? "bg-emerald-900/20 border-emerald-600"
        : "hover:bg-muted"
    }`}
  >
    <div>
      <b>{d.name}</b>
      {index === 0 && (
        <span className="ml-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">
          Top Recommended
        </span>
      )}
      <p className="text-sm text-gray-400">
        {d.specialty} • {d.experience} yrs experience
      </p>
    </div>

    <button
      onClick={() =>
        (window.location.href = `/doctors/${encodeURIComponent(d.specialty)}`)
      }
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Book Appointment
    </button>
  </div>
))}
        </div>
      )}
    </div>
  );
}
