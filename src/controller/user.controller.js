const {
  auth: adminAuth,
  db,
  firebaseApp,
} = require("../../config/firebaseConfig"); // Import initialized firebase and firestore
const {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} = require("firebase/auth");

const clientAuth = getAuth(firebaseApp); // Firebase Client SDK for Authentication
const roleCodes = {
  user: "UR001",
  vets: "UR002",
};
// Sign Up User
const createUser = async (req, res) => {
  const {
    email,
    password,
    // firstName,
    // lastName,
    // phoneNumber,
    // role
  } = req.body;

  try {
    // Create user using the Admin SDK
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      // displayName: `${firstName} ${lastName}`, // Combine first and last name for displayName
    });

    // Add user to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      // firstName: firstName,
      // lastName: lastName,
      email: email,
      role: "user",
      roleCode: roleCodes.user,
      // phoneNumber: phoneNumber,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        roleCode: roleCodes.user,
        role: "user",
        uid: userRecord.uid,
        email: userRecord.email,
        // name: userRecord.displayName,
        // firstName: firstName,
        // lastName: lastName,
        // phoneNumber: phoneNumber,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body; // Frontend sends email and password

  try {
    // Use Firebase Client SDK to log in the user
    console.log(email, password);
    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );

    // Get the user's ID token
    const idToken = await userCredential.user.getIdToken();

    // Get full user info
    const user = userCredential.user;

    // Verify the Firebase ID token (use Admin SDK to decode it)
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userData = userDoc.data();
    console.log(userData);
    // Include additional user details in the response
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        ...userData,
        role: userData.role,
        roleCode: userData.roleCode,
        uid: decodedToken.uid,
        email: decodedToken.email,
        token: idToken,
        emailVerified: user.emailVerified,
        // displayName: user.displayName,
        // firstName : userData.firstName,
        // lastName : userData?.lastName,
        // phoneNumber: userData.phoneNumber,
        // photoURL: user.photoURL,
        lastLoginAt: user.metadata.lastSignInTime,
        createdAt: user.metadata.creationTime,
        providerId: user.providerData.length
          ? user.providerData[0].providerId
          : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid email/password or user not authenticated.",
    });
  }
};
const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body; // Frontend sends the ID token

  try {
    // Verify the Google ID token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Extract user details from the token
    const { uid, email, name, picture } = decodedToken;

    // Check if the user exists in the database
    const userDoc = await db.collection("users").doc(uid).get();

    let userData;

    if (!userDoc.exists) {
      // If the user does not exist, create a new user in the database
      userData = {
        uid: uid,
        email: email,
        fullName: name || "New User", // Default name if unavailable
        profileImage : picture || "", // Default to empty string if no photo is provided
        role: "user", // Default role
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("users").doc(uid).set(userData);
    } else {
      // If the user exists, retrieve the data
      userData = userDoc.data();
    }

    // Return the user details along with the token
    res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        ...userData,
        uid : uid,
        token: idToken, // Return the Google ID token
        emailVerified: decodedToken.email_verified,
        lastLoginAt: decodedToken.auth_time,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token or user authentication failed.",
    });
  }
};
// const loginWithApple = async (req, res) => {
//   const { identityToken } = req.body; // Apple sends identityToken from the frontend

//   try {
//     // Verify the Apple ID token using Firebase Admin SDK or an Apple Public Key
//     const decodedToken = jwt.decode(identityToken, { complete: true });
    
//     if (!decodedToken) {
//       throw new Error("Invalid Apple token");
//     }

//     // Extract the user information from the token
//     const { sub: uid, email } = decodedToken.payload;

//     // Check if the user exists in the database
//     const userDoc = await db.collection("users").doc(uid).get();

//     let userData;

//     if (!userDoc.exists) {
//       // If the user does not exist, create a new user in the database
//       userData = {
//         uid: uid,
//         email: email || "Unknown", // Apple may not always provide email
//         name: "New Apple User", // Default name for Apple users
//         profileImage: "", // No profile image by default
//         role: "user", // Default role
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       await db.collection("users").doc(uid).set(userData);
//     } else {
//       // If the user exists, retrieve the data
//       userData = userDoc.data();
//     }

//     // Return the user details along with the token
//     res.status(200).json({
//       success: true,
//       message: "Apple login successful",
//       data: {
//         ...userData,
//         token: identityToken, // Return the Apple identity token
//         createdAt: userData.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Apple Login Error:", error);
//     res.status(401).json({
//       success: false,
//       message: "Invalid Apple token or user authentication failed.",
//     });
//   }
// }
const loginWithFacebook = async (req, res) => {
  const { idToken } = req.body; // Frontend sends the ID token

  try {
    // Verify the Facebook ID token using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Extract user details from the token
    const { uid, email, name, picture } = decodedToken;

    // Check if the user exists in your database
    const userDoc = await db.collection("users").doc(uid).get();

    let userData;

    if (!userDoc.exists) {
      // Create new user in the database if it doesn't exist
      userData = {
        uid: uid,
        email: email,
        fullName: name || "New User",
        profileImage: picture || "",
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("users").doc(uid).set(userData);
    } else {
      // Retrieve existing user data
      userData = userDoc.data();
    }

    // Return the user details along with the token
    res.status(200).json({
      success: true,
      message: "Facebook login successful",
      data: {
        ...userData,
        uid : uid,
        token: idToken,
        emailVerified: decodedToken.email_verified,
        lastLoginAt: decodedToken.auth_time,
        createdAt: userData.createdAt,
      },
    });
  } catch (error) {
    console.error("Facebook Login Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Facebook token or user authentication failed.",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body; // Email is provided in the request body

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }
    const origin = req.headers.origin || "http://localhost:5173"; // Fallback URL

    // Define custom action URL settings
    const actionCodeSettings = {
      url: `${origin}/reset-password`, // Dynamically set the URL
      handleCodeInApp: true, // User completes the action in the app
    };

    // Send password reset email
    await sendPasswordResetEmail(clientAuth, email, actionCodeSettings);

    res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Forgot Password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email.",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  const { email } = req.params; // Email passed as a URL parameter

  try {
    // Fetch the user document from Firestore based on email
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userDoc.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userData = userDoc.docs[0].data(); // Assuming one user per email

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      data: {
        email: userData?.email || "",
        fullName: userData?.fullName || "",
        phoneNumber: userData?.phoneNumber || "",
        dob: userData?.dob || "",
        gender: userData?.gender || "",
        profileImage: userData?.profileImage || "", // Send the profile image URL
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile.",
    });
  }
};

const updateUserProfile = async (req, res) => {
  const { email, fullName, phoneNumber, dob, gender } = req.body;

  try {
    // Check if the email exists in the Firestore users collection
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userDoc.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userRef = db.collection("users").doc(userDoc.docs[0].id);

    // Update user profile fields
    await userRef.update({
      fullName,
      phoneNumber,
      dob,
      gender,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user profile.",
      error: error.message,
    });
  }
};

const uploadProfileImage = async (req, res) => {
  const { email } = req.params;

  try {
    // URL of the uploaded file in S3
    const fileUrl = req.file.location;

    // Update the user's profile image URL in Firestore
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userDoc.empty) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const userRef = userDoc.docs[0].ref; // Get the document reference
    await userRef.update({ profileImage: fileUrl });

    res.status(200).json({
      success: true,
      message: "Profile image uploaded and updated successfully!",
      fileUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile image.",
    });
  }
};

// Get User List from Firestore
const getUserList = async (req, res, next) => {
  try {
    // Fetch all users from Firestore
    const usersSnapshot = await db
      .collection("users")
      .where("roleCode", "=", "UR001")
      .get();

    // Map Firestore documents to JSON data
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({
      success: true,
      data: users,
      message: "User list retrieved successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving user list" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.uid;
  try {
    // Delete the user from Firebase Authentication
    await adminAuth.deleteUser(userId);
    console.log(`User with UID ${userId} deleted from Firebase Auth.`);

    // Delete the user's document from Firestore
    await db.collection("users").doc(userId).delete();
    console.log(`User document with UID ${userId} deleted from Firestore.`);

    res
      .status(200)
      .send({ message: `User with UID ${userId} successfully deleted.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send({ message: "Failed to delete user", error });
  }
};
module.exports = {
  createUser,
  loginUser,
  loginWithGoogle,
  loginWithFacebook,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  forgotPassword,
  getUserList,
  deleteUser,
};
