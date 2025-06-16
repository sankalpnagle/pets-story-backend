const { db, admin } = require("../../config/firebaseConfig"); // Removed `bucket` since it's not used.

const addSmartJournals = async (req, res) => {
  const { userId, petId, journalType, responses, date } = req.body;

  if (
    !date ||
    !userId ||
    !petId ||
    !journalType ||
    !responses ||
    !Array.isArray(responses)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request body. Please provide userId, petId, and responses.",
    });
  }

  try {
    const existingJournalSnapshot = await db
      .collection("journals")
      .where("petId", "==", petId)
      .where("date", "==", date)
      .get();

    if (!existingJournalSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: `A journal entry with petId ${petId} already exists for the date ${date}.`,
      });
    }

    const journalRef = db.collection("journals").doc();
    await journalRef.set({
      date,
      userId,
      petId,
      journalType,
      responses,
      createdAt: admin.firestore.Timestamp.now(),
    });

    return res.status(201).json({
      success: true,
      message: "Journal entry created successfully.",
      journalId: journalRef.id,
    });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create journal entry.",
      error: error.message,
    });
  }
};

const getSmartJournalById = async (req, res) => {
  const { userId } = req.body;
  const { journalId } = req.params;

  if (!userId || !journalId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Please provide a valid userId and journalId.",
    });
  }

  try {
    const journalRef = db.collection("journals").doc(journalId);
    const journalDoc = await journalRef.get();

    if (!journalDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found.",
      });
    }

    const journalData = journalDoc.data();

    if (journalData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this journal.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal entry retrieved successfully.",
      data: journalData,
    });
  } catch (error) {
    console.error("Error retrieving journal entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journal entry.",
      error: error.message,
    });
  }
};

const updateSmartJournalById = async (req, res) => {
  const { userId } = req.body;
  const { journalId } = req.params;
  const { responses } = req.body;

  if (!userId || !journalId || !responses || !Array.isArray(responses)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request body. Please provide userId, journalId, and responses.",
    });
  }

  try {
    const journalRef = db.collection("journals").doc(journalId);
    const journalDoc = await journalRef.get();

    if (!journalDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found.",
      });
    }

    const journalData = journalDoc.data();

    if (journalData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this journal.",
      });
    }

    const existingResponses = journalData.responses || [];
    const responseMap = new Map(
      existingResponses.map((response) => [response.questionId, response])
    );

    responses.forEach((newResponse) => {
      responseMap.set(newResponse.questionId, newResponse);
    });

    const updatedResponses = Array.from(responseMap.values());

    await journalRef.update({
      responses: updatedResponses,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully.",
    });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update journal entry.",
      error: error.message,
    });
  }
};

const getAllSmartJournals = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Invalid request. Please provide a valid userId.",
    });
  }

  try {
    const petsSnapshot = await db
      .collection("pets")
      .where("ownerId", "==", userId)
      .get();

    if (petsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No pets found for this user.",
      });
    }

    const pets = petsSnapshot.docs.map((doc) => ({
      petId: doc.id,
      ...doc.data(),
    }));

    const petData = pets.map((pet) => ({
      petId: pet.petId,
      createdAt: new Date(pet.createdAt._seconds * 1000).toString(),
    }));

    const journalsSnapshot = await db
      .collection("journals")
      .where("userId", "==", userId)
      .get();

    const journalEntries = journalsSnapshot.docs.map((doc) => ({
      journalId: doc.id,
      ...doc.data(),
    }));

    const journalsByDate = journalEntries.reduce((acc, journal) => {
      const dateKey = new Date(journal.date).toString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(journal);
      return acc;
    }, {});

   const results = Object.entries(journalsByDate).map(([date, journals]) => {
     const normalizedDate = new Date(date); 
     normalizedDate.setHours(0, 0, 0, 0); 

     const journalPetIds = journals.map((journal) => journal.petId);

    
     const missingPetIds = petData
       .filter((pet) => {
         const petCreationDate = new Date(pet.createdAt); 
         petCreationDate.setHours(0, 0, 0, 0); 

        
         return (
           petCreationDate <= normalizedDate &&
           !journalPetIds.includes(pet.petId)
         );
       })
       .map((pet) => pet.petId);

     const status = missingPetIds.length === 0 ? "Completed" : "Pending";

     return {
       date: normalizedDate.toString(),
       status,
       missingPetIds,
       journals: journals.map((journal) => ({
         journalId: journal.journalId,
         petId: journal.petId,
         journalType: journal.journalType,
         responsesCount: journal.responses?.length || 0,
       })),
     };
   });

    return res.status(200).json({
      success: true,
      message: "Journal entries retrieved successfully.",
      data: results,
    });
  } catch (error) {
    console.error("Error retrieving journal entries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve journal entries.",
      error: error.message,
    });
  }
};


const checkJournalStatus = async (req, res) => {
  const { userId, date } = req.body;

  if (!userId || !date) {
    return res.status(400).json({
      success: false,
      message: "Invalid request body. Please provide userId and date.",
    });
  }

  try {
    const inputDate = new Date(date);

    if (isNaN(inputDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format.",
      });
    }

    // Normalize the input date to remove the time component
    const normalizedInputDate = new Date(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    );

    // Fetch all pets belonging to the user
    const userPetsSnapshot = await db
      .collection("pets")
      .where("ownerId", "==", userId)
      .get();

    if (userPetsSnapshot.empty) {
      return res.status(200).json({
        success: true,
        completed: [],
        pending: [],
      });
    }

    // Fetch all journals for the user
    const userJournalsSnapshot = await db
      .collection("journals")
      .where("userId", "==", userId)
      .get();

    const journalPetIds = new Map(); // Map to track petId and journalId
    userJournalsSnapshot.forEach((doc) => {
      const journal = doc.data();
      const journalDate = new Date(journal.date);
      const normalizedJournalDate = new Date(
        journalDate.getFullYear(),
        journalDate.getMonth(),
        journalDate.getDate()
      );

      if (normalizedJournalDate.getTime() === normalizedInputDate.getTime()) {
        journalPetIds.set(journal.petId, doc.id); // Add petId and journalId
      }
    });

    const completed = [];
    const pending = [];

    // Categorize pets into completed or pending
    userPetsSnapshot.forEach((doc) => {
      const pet = doc.data();
      const petId = doc.id;

      const petCreatedAt = new Date(pet.createdAt._seconds * 1000);
      const normalizedPetCreatedAt = new Date(
        petCreatedAt.getFullYear(),
        petCreatedAt.getMonth(),
        petCreatedAt.getDate()
      );

      // Check if the pet was created on or before the input date
      if (normalizedPetCreatedAt <= normalizedInputDate) {
        const petInfo = {
          createdAt: petCreatedAt.toISOString(),
          petId,
          name: pet.name,
          image: pet.image || null,
          journalId: journalPetIds.get(petId) || null, // Include journalId if exists
        };

        // Add to completed or pending based on journal presence
        if (journalPetIds.has(petId)) {
          completed.push(petInfo);
        } else {
          pending.push(petInfo);
        }
      }
    });

    return res.status(200).json({
      success: true,
      completed,
      pending,
    });
  } catch (error) {
    console.error("Error checking journal status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check journal status.",
      error: error.message,
    });
  }
};

module.exports = {
  addSmartJournals,
  getSmartJournalById,
  updateSmartJournalById,
  getAllSmartJournals,
  checkJournalStatus,
};
