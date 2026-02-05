import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { askAI } from "@/lib/ai";

// Temporary session memory
const sessions = {};

// Local disease knowledge base
const diseaseDB = [
  {
    name: "Flu",
    symptoms: ["fever", "cough", "cold", "headache", "body pain"],
    specialty: "General Medicine",
    precautions: "Drink fluids, rest, avoid cold food.",
    medicine: "Paracetamol can reduce fever.",
    warning: "Consult doctor if fever lasts more than 3 days."
  },
  {
    name: "Heart Condition",
    symptoms: ["chest pain", "shortness of breath", "dizziness"],
    specialty: "Cardiology",
    precautions: "Avoid exertion and salt.",
    medicine: "Do not self-medicate.",
    warning: "Seek emergency care."
  }
];

// Symptom scoring engine
function detectDisease(text) {
  let best = null, score = 0;

  for (const d of diseaseDB) {
    let s = d.symptoms.filter(sym => text.includes(sym)).length;
    if (s > score) {
      score = s;
      best = d;
    }
  }

  return score > 0 ? best : null;
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  const text = message.toLowerCase();

  if (!sessions[userId]) sessions[userId] = {};

  // 🧑‍⚕️ Doctor request
  if (text.includes("doctor")) {
    const disease = sessions[userId].disease;
    if (!disease) return NextResponse.json({ reply: "Please tell me your symptoms first." });

const doctors = await db.user.findMany({
  where: {
    role: "DOCTOR",
    specialty: disease.specialty,
    verificationStatus: "VERIFIED"
  },
  select: {
    id: true,
    name: true,
    specialty: true,
    experience: true,
    availabilities: {
      where: { status: "AVAILABLE" },
      orderBy: { startTime: "asc" },
      take: 3
    }
  },
  orderBy: {
    experience: "desc"
  }
});



    if (!doctors.length) {
      return NextResponse.json({
        reply: "Sorry, no doctors are currently available for this specialty. Please try again later.",
        doctors: []
      });
    }

    return NextResponse.json({
      reply: "Here are the recommended doctors:",
      doctors
    });
  }

  // 🧴 Precautions
  if (text.includes("precaution")) {
    const disease = sessions[userId].disease;
    if (!disease) return NextResponse.json({ reply: "Please tell me your symptoms first." });
    return NextResponse.json({ reply: disease.precautions });
  }

  // 💊 Medicine
  if (text.includes("medicine")) {
    const disease = sessions[userId].disease;
    if (!disease) return NextResponse.json({ reply: "Please tell me your symptoms first." });
    return NextResponse.json({ reply: disease.medicine });
  }

  // ⚠️ Danger
  if (text.includes("danger") || text.includes("serious")) {
    const disease = sessions[userId].disease;
    if (!disease) return NextResponse.json({ reply: "Please tell me your symptoms first." });
    return NextResponse.json({ reply: disease.warning });
  }

  // 🧠 Rule-based disease detection
  const found = detectDisease(text);
  if (found) {
    sessions[userId].disease = found;

    return NextResponse.json({
      reply: `You may have ${found.name}. Recommended specialty: ${found.specialty}`
    });
  }

  // 🤖 AI fallback for rare / complex cases
  const aiReply = await askAI(`
Analyze this medical input: "${message}"

Provide:
1. Possible disease
2. Precautions
3. Medicine guidance (with safety warning)
4. Warning signs
5. Recommended medical specialty

Keep response short, safe and professional.
`);

  return NextResponse.json({ reply: aiReply });
}
