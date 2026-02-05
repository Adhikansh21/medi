export async function askAI(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();

    if (!data.choices || !data.choices.length) {
      console.error("AI Error:", data);
      return "I am unable to analyze this right now. Please consult a doctor or try again later.";
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI Exception:", error);
    return "AI service is currently unavailable. Please consult a doctor.";
  }
}
