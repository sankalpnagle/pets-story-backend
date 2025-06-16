const { db, admin, bucket } = require("../../config/firebaseConfig");
const { uploadPetData } = require("../middleware/uploadPetDataFiles");

// Create a new pet
const registerPet = async (req, res) => {
  uploadPetData(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "File upload failed.",
        error: err.message,
      });
    }

    const {
      name,
      gender,
      color,
      about,
      breed,
      age,
      neuteredOrSpayed,
      weight,
      currentMedications,
      diet,
      vaccineStatus,
      rfidChipStatus,
      ownerId,
    } = req.body;

    const image = req.files?.image?.[0]?.location; // S3 URL for the uploaded image
    const pdf = req.files?.pdf?.[0]?.location; // S3 URL for the uploaded PDF

    try {
      // Validate required fields
      if (!name || !ownerId) {
        return res.status(400).json({
          success: false,
          message: "Name and ownerId are required fields.",
        });
      }

      // Step 1: Check the number of pets already registered by the owner
      const petsSnapshot = await db
        .collection("pets")
        .where("ownerId", "==", ownerId)
        .get();

        if (petsSnapshot.size >= 5) {
          return res.status(400).json({
            success: false,
            message: "You can register up to 5 pets.",
          });
        }

      if (petsSnapshot.size >= 5) {
        return res.status(400).json({
          success: false,
          message: "You can register up to 5 pets.",
        });
      }

      // Step 2: Ensure currentMedicine is an array
      let currentMedicineArray = [];
      if (currentMedications) {
        currentMedicineArray = currentMedications
          .replace(/^\[|\]$/g, "") // Remove square brackets
          .split(",") // Split by commas
          .map((item) => item.trim().replace(/^'|'$/g, "")); // Trim and remove single quotes
      }

      // Step 3: Add pet details to Firestore
      const petRef = await db.collection("pets").add({
        name,
        color,
        about,
        gender,
        age: age || null,
        breed: breed || null,
        neuteredOrSpayed: neuteredOrSpayed || null,
        weight: weight || null,
        currentMedications: Array.isArray(currentMedicineArray)
          ? currentMedicineArray
          : [],
        diet: diet || null,
        vaccineStatus: vaccineStatus || null,
        rfidChipStatus: rfidChipStatus || null,
        ownerId,
        image: image || null,
        pdf: pdf || null,
        createdAt: new Date(),
      });

      // Step 4: Return a success response
      res.status(201).json({
        success: true,
        message: "Pet registered successfully.",
        data: {
          id: petRef.id,
          name,
          color,
          gender,
          about,
          breed,
          age,
          weight,
          neuteredOrSpayed,
          currentMedications: currentMedicineArray,
          diet,
          vaccineStatus,
          rfidChipStatus,
          ownerId,
          image,
          pdf,
        },
      });
    } catch (error) {
      console.error("Error registering pet:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register pet.",
        error: error.message,
      });
    }
  });
};

const getPetById = async (req, res) => {
  const { petId } = req.params;

  try {
    const petDoc = await db.collection("pets").doc(petId).get();

    if (!petDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    const petData = { id: petDoc.id, ...petDoc.data() };

    res.status(200).json({
      success: true,
      message: "Pet details retrieved successfully.",
      data: petData,
    });
  } catch (error) {
    console.error("Error fetching pet details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pet details.",
    });
  }
};

// Get all pets for a user
const getPetsByUser = async (req, res) => {
  const { ownerId } = req.params;

  try {
    const petsSnapshot = await db
      .collection("pets")
      .where("ownerId", "==", ownerId)
      .get();

    if (petsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "No pets found for this user.",
      });
    }

    const pets = petsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      message: "Pets retrieved successfully.",
      data: pets,
    });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pets.",
    });
  }
};

const updatePet = async (req, res) => {
  uploadPetData(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "File upload failed.",
        error: err.message,
      });
    }

    const { petId } = req.params;
    const {
      name,
      color,
      gender,
      about,
      breed,
      age,
      neuteredOrSpayed,
      weight,
      currentMedications,
      diet,
      vaccineStatus,
      rfidChipStatus,
    } = req.body;

    const image = req.files?.image?.[0]?.location; // S3 URL for the uploaded image
    const pdf = req.files?.pdf?.[0]?.location; // S3 URL for the uploaded PDF

    try {
      const petRef = db.collection("pets").doc(petId);
      const petDoc = await petRef.get();

      if (!petDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Pet not found.",
        });
      }

      // Ensure currentMedications is parsed into an array
      let currentMedicineArray = [];
      if (currentMedications) {
        currentMedicineArray = currentMedications
          .replace(/^\[|\]$/g, "") // Remove square brackets
          .split(",") // Split by commas
          .map((item) => item.trim().replace(/^'|'$/g, "")); // Trim and remove single quotes
      }

      // Prepare fields for update
      const updateFields = {
        ...(name && { name }),
        ...(gender && { gender }),
        ...(about && { about }),
        ...(color && { color }),
        ...(breed && { breed }),
        ...(age && { age }),
        ...(neuteredOrSpayed && { neuteredOrSpayed }),
        ...(weight && { weight }),
        ...(currentMedications && { currentMedications: currentMedicineArray }),
        ...(diet && { diet }),
        ...(vaccineStatus && { vaccineStatus }),
        ...(rfidChipStatus && { rfidChipStatus }),
        ...(image && { image }),
        ...(pdf && { pdf }),
      };

      // Update pet details in Firestore
      await petRef.update(updateFields);

      res.status(200).json({
        success: true,
        message: "Pet details updated successfully.",
        data: {
          petId,
          ...updateFields,
        },
      });
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update pet details.",
      });
    }
  });
};

// Delete a pet
const deletePet = async (req, res) => {
  const { petId } = req.params;

  try {
    const petRef = db.collection("pets").doc(petId);
    const petDoc = await petRef.get();

    if (!petDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    await petRef.delete();

    res.status(200).json({
      success: true,
      message: "Pet deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting pet:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete pet.",
    });
  }
};

const petIdsByUser = async(req,res)=>{
 const { ownerId } = req.params;

 try {
   const petsSnapshot = await db
     .collection("pets")
     .where("ownerId", "==", ownerId)
     .get();

   if (petsSnapshot.empty) {
     return res.status(404).json({
       success: false,
       message: "No pets found for this user.",
     });
   }

const pets = petsSnapshot.docs.map((doc) => ({
  id: doc.id,
  createdAt: doc.data().createdAt.toDate().toISOString(),
}));

   res.status(200).json({
     success: true,
     message: "Pets retrieved successfully.",
     data: pets,
   });
 } catch (error) {
   console.error("Error fetching pets:", error);
   res.status(500).json({
     success: false,
     message: "Failed to fetch pets.",
   });
 }
}

// Exporting APIs
module.exports = {
  registerPet,
  getPetById,
  getPetsByUser,
  updatePet,
  deletePet,
  petIdsByUser,
};
