const { db, admin, bucket } = require("../../config/firebaseConfig");

const createJournalEntry = async (req, res) => {
  const {
    // id,
    petId,
    date,
    behavior,
    appetite,
    digestion,
    severity,
    duration,
    category,
    notes,
  } = req.body;

  try {
    // Validate required fields
    if (!petId || !date || !category) {
      return res.status(400).json({
        success: false,
        message: "Pet ID, date, and category are required fields.",
      });
    }

    // Add journal entry to Firestore
    const journalRef = await db.collection("journals").add({
      // id,
      petId,
      date,
      behavior: behavior || null,
      appetite: appetite || null,
      digestion: digestion || null,
      severity: severity || null,
      duration: duration || null,
      category,
      notes: notes || null,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Journal entry created successfully.",
      data: {
        id: journalRef.id,
        petId,
        date,
        behavior,
        appetite,
        digestion,
        severity,
        duration,
        category,
        notes,
      },
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create journal entry.",
    });
  }
};
const getJournalById = async (req, res) => {
  const { journalId } = req.params;

  try {
    // Validate journalId
    if (!journalId) {
      return res.status(400).json({
        success: false,
        message: "Journal ID is required.",
      });
    }

    const journalDoc = await db.collection("journals").doc(journalId).get();

    if (!journalDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found.",
      });
    }

    const journalData = { id: journalDoc.id, ...journalDoc.data() };

    res.status(200).json({
      success: true,
      message: "Journal entry retrieved successfully.",
      data: journalData,
    });
  } catch (error) {
    console.error("Error retrieving journal entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve journal entry.",
    });
  }
};

const getJournalEntriesByPetId = async (req, res) => {
  const { petId } = req.params;

  try {
    // Validate petId
    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required.",
      });
    }

    const journalsSnapshot = await db
      .collection("journals")
      .where("petId", "==", petId)
      .get();

    if (journalsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No journal entries found for this pet.",
      });
    }

    const journals = journalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      message: "Journal entries retrieved successfully.",
      data: journals,
    });
  } catch (error) {
    console.error("Error retrieving journal entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve journal entries.",
    });
  }
};
const updateJournalEntry = async (req, res) => {
  const { id } = req.params;
  const {
    petId,
    date,
    behavior,
    appetite,
    digestion,
    severity,
    duration,
    category,
    notes,
  } = req.body;

  try {
    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Journal ID is required.",
      });
    }

    const journalRef = db.collection("journals").doc(id);

    const journalSnapshot = await journalRef.get();
    if (!journalSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found.",
      });
    }

    await journalRef.update({
      petId: petId || journalSnapshot.data().petId,
      date: date || journalSnapshot.data().date,
      behavior: behavior || journalSnapshot.data().behavior,
      appetite: appetite || journalSnapshot.data().appetite,
      digestion: digestion || journalSnapshot.data().digestion,
      severity: severity || journalSnapshot.data().severity,
      duration: duration || journalSnapshot.data().duration,
      category: category || journalSnapshot.data().category,
      notes: notes || journalSnapshot.data().notes,
      updatedAt: new Date(),
    });

    const updatedJournal = (await journalRef.get()).data();

    res.status(200).json({
      success: true,
      message: "Journal entry updated successfully.",
      data: { id, ...updatedJournal },
    });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update journal entry.",
    });
  }
};
const deleteJournalEntry = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Journal ID is required.",
      });
    }

    const journalRef = db.collection("journals").doc(id);

    const journalSnapshot = await journalRef.get();
    if (!journalSnapshot.exists) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found.",
      });
    }

    await journalRef.delete();

    res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete journal entry.",
    });
  }
};

module.exports = {
  createJournalEntry,
  getJournalById,
  getJournalEntriesByPetId,
  updateJournalEntry,
  deleteJournalEntry,
};
