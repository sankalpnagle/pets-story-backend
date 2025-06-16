const { db, admin, bucket } = require("../../config/firebaseConfig");

const getDailyQuestions = async (req, res) => {
  try {
    const questionSnapshot = await db.collection("questions").get();

    if (questionSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No daily journal questions found.",
      });
    }

    const questions = questionSnapshot.docs.map((doc) => ({
      firebaseId: doc.id,
      id: doc.id,
      ...doc.data(),
    }));

    // Sort the questions by the id field in ascending order using natural sorting
    questions.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    );

    res.status(200).json({
      success: true,
      message: "Daily journal questions retrieved successfully.",
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching daily questions:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching daily journal questions.",
      error: error.message,
    });
  }
};


const addDailyJournalQuestion = async (req, res) => {
  try {
    const { id, question, type, options } = req.body;

    // Basic validation
    if (!question || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Question and options are required. Options must be a non-empty array.",
      });
    }

    // Insert the question into Firestore
    const docRef = await db.collection("questions").doc();
    await docRef.set({
      id,
      question,
      options,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Daily journal question added successfully.",
      data: {
        id,
        question,
        options,
        type,
      },
    });
  } catch (error) {
    console.error("Error adding daily journal question:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the question.",
      error: error.message,
    });
  }
};


const updateDailyJournalQuestion = async (req, res) => {
  try {
    const { DefaultQuestions } = req.body;
    if (
      !DefaultQuestions ||
      !Array.isArray(DefaultQuestions) ||
      DefaultQuestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "An array of questions is required for updating.",
      });
    }

    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    const batchSize = 500; 
    const questionChunks = chunkArray(DefaultQuestions, batchSize); 

    for (const chunk of questionChunks) {
      const batch = db.batch(); 

      await Promise.all(
        chunk.map(async (questionData) => {
          const { id, defaultValue } = questionData;

          if (!id) {
            throw new Error(
              `Each question must have an ID for updating. Question ID: ${id}`
            );
          }

          const docRef = db.collection("questions").doc(id);
          const docSnapshot = await docRef.get();

          if (!docSnapshot.exists) {
            throw new Error(`Question with ID ${id} does not exist.`);
          }

          const currentData = docSnapshot.data();
          const updatedData = {
            ...currentData,
            ...(defaultValue !== undefined && { defaultValue }),
          };

          batch.update(docRef, updatedData);
        })
      );

      await batch.commit();
    }

    res.status(200).json({
      success: true,
      message: "Daily journal questions updated successfully.",
    });
  } catch (error) {
    console.error("Error updating daily journal questions:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while updating the questions.",
    });
  }
};



const addComprehensiveQuestion = async (req, res) => {
  try {
    const { id, question, options, type } = req.body;

    // Basic validation
    if (!question || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Question and options are required. Options must be a non-empty array.",
      });
    }

    // Insert the question into Firestore
    const docRef = await db.collection("comprehensiveQuestion").doc();
    await docRef.set({
      id,
      question,
      options,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Comprehensive journal question added successfully.",
      data: {
        id,
        question,
        options,
        type,
      },
    });
  } catch (error) {
    console.error("Error adding Comprehensive journal question:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the question.",
      error: error.message,
    });
  }
};
const getComprehensiveQuestions = async (req, res) => {
  try {
    const questionSnapshot = await db.collection("comprehensiveQuestion").get();

    if (questionSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No Comprehensive journal questions found.",
      });
    }

    const questions = questionSnapshot.docs.map((doc) => ({
      firebaseId: doc.id,
      id: doc.id,
      ...doc.data(),
    }));

    // Sort the questions by the id field in ascending order using natural sorting
    questions.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true })
    );

    res.status(200).json({
      success: true,
      message: "Comprehensive journal questions retrieved successfully.",
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching Comprehensive questions:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching Comprehensive journal questions.",
      error: error.message,
    });
  }
};
const updateComprehensiveJournalQuestion = async (req, res) => {
  try {
    const { DefaultQuestions } = req.body;

    // Basic validation
    if (
      !DefaultQuestions ||
      !Array.isArray(DefaultQuestions) ||
      DefaultQuestions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "An array of questions is required for updating.",
      });
    }


    const chunkArray = (array, size) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    const batchSize = 500;
    const questionChunks = chunkArray(DefaultQuestions, batchSize); 
    for (const chunk of questionChunks) {
      const batch = db.batch(); 

      await Promise.all(
        chunk.map(async (questionData) => {
          const { id, defaultValue } = questionData;

          if (!id) {
            throw new Error(
              `Each question must have an ID for updating. Question ID: ${id}`
            );
          }

          const docRef = db.collection("comprehensiveQuestion").doc(id);
          const docSnapshot = await docRef.get();

          if (!docSnapshot.exists) {
            throw new Error(`Question with ID ${id} does not exist.`);
          }

          const currentData = docSnapshot.data();
          const updatedData = {
            ...currentData,
            ...(defaultValue !== undefined && { defaultValue }),
          };

          batch.update(docRef, updatedData);
        })
      );

      await batch.commit();
    }

    res.status(200).json({
      success: true,
      message: "Comprehensive journal questions updated successfully.",
    });
  } catch (error) {
    console.error("Error updating comprehensive journal questions:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while updating the questions.",
    });
  }
};


module.exports = {
  updateComprehensiveJournalQuestion,
  getDailyQuestions,
  addDailyJournalQuestion,
  addComprehensiveQuestion,
  getComprehensiveQuestions,
  updateDailyJournalQuestion,
};
