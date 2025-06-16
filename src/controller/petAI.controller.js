const OpenAI = require("openai");
const { OpenAIApi } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const customQuestions = {
  "Why does my dog keep scratching even though they don't have fleas?": () =>
    `Your dog might be experiencing dry skin, an allergic reaction to something in their environment, or even stress. Check for signs of redness or irritation on their skin and consider any recent changes, like a new cleaning product or a different type of bedding. Offering a skin-soothing bath with a gentle, hypoallergenic shampoo can help. If the scratching persists, a vet consultation is recommended.`,

  "My cat has stopped eating their usual food—should I be worried?": () =>
    `It could be a temporary loss of appetite due to stress, a preference change, or even a dental issue. Try offering a different flavor or texture of food to see if they respond better. Monitor for other signs, like drooling, bad breath, or lethargy, which could indicate a health problem. If they continue to avoid food for more than a day, consult your veterinarian to rule out any underlying conditions.`,

  "Is my puppy [Your Pet Name] getting enough exercise for their age and breed?":
    (name, breed, age) =>
      `Puppies like ${name} have varying energy levels based on being a ${breed} of ${age} years. Generally, they should have about 5 minutes of exercise per month of age, up to twice a day. Therefore, ${name} should need about 25 minutes of play or walks twice daily. Over-exercising can strain their developing joints, so focus on short bursts of activity mixed with plenty of rest.`,

  "Why does my pet [Your Pet Name] seem anxious whenever I leave the house?": (
    name
  ) =>
    `This might be a sign of separation anxiety. ${name} is picking up on cues, like putting on shoes or grabbing keys, which signal your departure. Try desensitizing ${name} by practicing short departures and gradually increasing the time you're away. Leave a comforting item, like leaving that plushy ${name} really likes or an unwashed piece of clothing, and consider providing engaging puzzles to keep him distracted.`,

  "When is [Your Pet Name]'s next pet visit?": () =>
    `From what I see in your calendar, it seems that an appointment has been scheduled for next Monday at 6:30 PM.`,
};

const matchAndReplacePlaceholders = (question, petName, userName) => {
  return question
    .replace("[Your Pet Name]", petName || "your pet")
    .replace("{username}", userName || "you");
};

const replacePetName = (message, petName) => {
  return message.replace(/(@\w+|\[.+?\])/, `${petName}`);
};

const replaceUserName = (message, userName) => {
  return message.replace(/@(\w+)/g, `@${userName}`);
};

const askPetAI = async (req, res) => {
  try {
    const { message, petName, breed, age, userName } = req.body;

    const updatedMessage = replacePetName(message, petName);
    const updatedUserMessage = replaceUserName(message, userName);

    const matchedQuestion = Object.keys(customQuestions).find((question) => {
      const formattedQuestion = matchAndReplacePlaceholders(
        question,
        petName,
        userName
      );
      return (
        updatedMessage.startsWith(formattedQuestion) ||
        updatedUserMessage.startsWith(formattedQuestion)
      );
    });

    if (matchedQuestion) {
      return res.json({
        reply: customQuestions[matchedQuestion](petName, breed, age, userName),
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI pet care expert." },
        { role: "user", content: updatedMessage },
      ],
    });

    return res.json({ reply: response?.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to process your request.",
    });
  }
};

module.exports = {
  askPetAI,
};
