import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const image = data.get("image") as File;

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const imageParts = await fileToGenerativePart(image);
    const result = await model.generateContent([
      "Analyze this house layout and provide a detailed Vastu dosh report, including the following analysis: ",
      "1. Basic Structure and Layout Assessment: Analyze the overall layout of the house, room placements, and their functions.",
      "2. Directional Alignment: Evaluate the main entrance, room orientations, and the placement of key areas (e.g., kitchen, bedrooms, living rooms).",
      "3. Element Balancing: Assess the five elements (earth, water, fire, air, space) in relation to the house's design and their balance.",
      "4. Tailored Colour Schemes and Decor: Suggest optimal color schemes and decor for each room based on Vastu principles.",
      "5. Water Features and Plants: Provide recommendations on the inclusion and placement of water features and plants.",
      "6. Specific Vastu Dosha Remedies: Identify any doshas (flaws or imbalances) in each room and suggest remedies for each.",
      "7. General Tips for Enhancing Vastu: Offer advice on utilizing crystals, energy balancers, optimizing lighting, and arranging furniture effectively.",
      imageParts,
    ]);
    const response = await result.response;
    const vastuReport = response.text();

    return NextResponse.json({ report: vastuReport });
  } catch (error) {
    console.error("Error generating Vastu report:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error generating Vastu report: ${error.message}` },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred while generating the Vastu report" },
        { status: 500 }
      );
    }
  }
}

async function fileToGenerativePart(file: File): Promise<{
  inlineData: { data: string; mimeType: string };
}> {
  const arrayBuffer = await file.arrayBuffer();
  const base64String = Buffer.from(arrayBuffer).toString("base64");
  return {
    inlineData: {
      data: base64String,
      mimeType: file.type,
    },
  };
}
