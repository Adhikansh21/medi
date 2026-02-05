import { db } from "@/lib/prisma";

export async function runAssistant(patientId, message) {

  const session = await db.patientAISession.findUnique({
    where: { patientId }
  });

  let memory = session?.conversation || [];
  let lastDisease = session?.lastDisease || null;

  const ai = await analyzeSymptoms(message, memory, lastDisease);

  memory.push({ user: message, ai: ai.reply });

  await db.patientAISession.upsert({
    where: { patientId },
    update: { lastDisease: ai.disease, conversation: memory },
    create: {
      patientId,
      lastDisease: ai.disease,
      conversation: memory
    }
  });

  const doctors = await db.user.findMany({
    where: {
      role: "DOCTOR",
      specialty: ai.specialty,
      verificationStatus: "VERIFIED"
    },
    select: {
      id: true,
      name: true,
      specialty: true,
      experience: true
    }
  });

  return { ...ai, doctors };
}


// Temporary AI (for testing)
async function analyzeSymptoms(message, memory, lastDisease) {
  const text = message.toLowerCase();

  if (text.includes("fever") || text.includes("cold") || text.includes("cough")) {
    return {
      reply: "Based on your symptoms, you may be experiencing flu or viral infection. Please stay hydrated and consult a General Physician if symptoms persist.",
      disease: "Flu",
      specialty: "General Medicine"
    };
  }

  if (text.includes("chest") || text.includes("heart")) {
    return {
      reply: "These symptoms may indicate a heart-related issue. Please consult a Cardiologist immediately.",
      disease: "Heart Condition",
      specialty: "Cardiology"
    };
  }

  return {
    reply: "Please provide more details about your symptoms.",
    disease: lastDisease,
    specialty: "General Medicine"
  };
}
