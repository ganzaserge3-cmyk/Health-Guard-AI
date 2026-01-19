// Mock AI service that simulates responses
export const simulateAIResponse = (question: string): string => {
  const responses = {
    general: [
      "Based on general health guidelines, I recommend maintaining a balanced diet, regular exercise, and 7-9 hours of sleep daily. Proper hydration and stress management are also crucial for overall health.",
      "For optimal health, consider regular check-ups, staying hydrated, and managing stress through mindfulness techniques. Remember to listen to your body and seek professional advice when needed."
    ],
    symptoms: [
      "I can help analyze symptoms, but remember I'm not a substitute for professional medical advice. Could you describe your symptoms in more detail? Include duration, intensity, and any triggers you've noticed.",
      "For symptom tracking, note the frequency, intensity, and duration. Consider consulting a healthcare provider for persistent issues. Some symptoms that require immediate attention include chest pain, difficulty breathing, or sudden severe pain."
    ],
    nutrition: [
      "A balanced diet should include fruits, vegetables, lean proteins, and whole grains. Consider reducing processed foods and added sugars. For specific nutrition advice, your age, activity level, and health goals would help provide personalized recommendations.",
      "Nutrition plays a vital role in health. Aim for colorful plates with variety, stay hydrated, and consider portion control. If you have specific dietary needs or conditions, consulting a nutritionist can be beneficial."
    ],
    fitness: [
      "A good fitness routine includes cardio, strength training, and flexibility exercises. Aim for 150 minutes of moderate activity weekly. Remember to warm up before exercise and cool down after. Listen to your body and adjust intensity as needed.",
      "Regular physical activity improves cardiovascular health, strengthens muscles, and boosts mental wellbeing. Start with activities you enjoy, and gradually increase intensity. Consistency is more important than intensity when starting out."
    ],
    mental: [
      "Mental health is as important as physical health. Consider practices like meditation, journaling, or talking to a professional. Building a support system and maintaining work-life balance are crucial for mental wellbeing.",
      "Taking care of your mental health includes regular self-care, setting boundaries, and seeking help when needed. Techniques like deep breathing, mindfulness, and maintaining social connections can significantly improve mental wellbeing."
    ]
  };

  // Simple keyword detection for category
  let category: keyof typeof responses = 'general';
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('headache') || lowerQuestion.includes('fever') || lowerQuestion.includes('pain')) {
    category = 'symptoms';
  } else if (lowerQuestion.includes('food') || lowerQuestion.includes('diet') || lowerQuestion.includes('eat')) {
    category = 'nutrition';
  } else if (lowerQuestion.includes('exercise') || lowerQuestion.includes('workout') || lowerQuestion.includes('fitness')) {
    category = 'fitness';
  } else if (lowerQuestion.includes('stress') || lowerQuestion.includes('anxiety') || lowerQuestion.includes('mental')) {
    category = 'mental';
  }

  const categoryResponses = responses[category];
  const response = categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  
  return `${response}\n\n⚠️ **Disclaimer:** This is for educational purposes only. Always consult healthcare professionals for medical advice.`;
};

export const simulateImageAnalysis = (symptoms: string): string => {
  const analyses = [
    `Based on the image analysis:\n
🔍 **Visual Assessment:** The image shows visible symptoms that should be monitored. Without professional examination, I can provide general guidance.\n
📋 **Recommendations:**
1. Keep the area clean and dry
2. Monitor for changes in size, color, or pain level
3. Avoid scratching or irritating the area
4. Consider taking photos daily to track changes\n
🏥 **When to Seek Help:**
• If symptoms worsen or spread
• If you develop fever or other systemic symptoms
• If there's no improvement in 2-3 days
• If you're concerned about the appearance\n
💡 **Note:** For accurate diagnosis, please consult a dermatologist or healthcare provider.`,

    `AI Image Analysis Results:\n
📊 **Assessment:** The uploaded image requires professional evaluation for accurate diagnosis. Here are general observations:\n
⚕️ **Possible Considerations:**
• Skin conditions often require in-person examination
• Lighting and image quality affect analysis accuracy
• Multiple factors contribute to skin health\n
📝 **Next Steps:**
1. Document symptoms with dates and photos
2. Note any itching, pain, or changes
3. Review your medical history with a provider
4. Consider allergy testing if recurrent\n
🚨 **Important:** This analysis is not a diagnosis. Please see a healthcare professional for proper medical evaluation.`
  ];

  return analyses[Math.floor(Math.random() * analyses.length)];
};

export const emergencyAdvice = (): string => {
  return `🚨 **EMERGENCY GUIDANCE**\n
If you're experiencing any of the following, seek immediate medical attention:\n
• Chest pain or pressure
• Difficulty breathing
• Severe bleeding
• Sudden weakness or numbness
• Severe burns or injuries
• Poisoning or overdose
• Thoughts of self-harm\n
📞 **Emergency Contacts:**
• United States: 911
• United Kingdom: 999
• European Union: 112
• Australia: 000
• Worldwide Emergency: Find local emergency number\n
🏥 **While Waiting for Help:**
1. Stay calm and follow operator instructions
2. Keep the person comfortable
3. Don't give anything by mouth unless instructed
4. Have medication list and medical history ready\n
⚠️ **This is critical:** Do not delay seeking professional medical help in emergencies.`;
};