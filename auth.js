import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { auth } from "./firebase.js";

// SIGNUP FUNCTION// 
const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {

            message.textContent = "Creating account...";

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth, email, password
                );

            await updateProfile(userCredential.user, {
                displayName: name
            });

            message.textContent = "Account created successfully!";

            window.location.href = "dashboard.html";

        } catch (error) {

            message.textContent = error.message;
            console.error(error);

        }

    });

}


// LOGIN FUNCTION //
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {

            message.textContent = "Logging in...";

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            message.textContent = "Login successful!";

            window.location.href = "dashboard.html";

        } catch (error) {

            message.textContent = error.message;
            console.error(error);

        }

    });

}
