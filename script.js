// ========================================
// FOOD WASTE REDUCTION HUB
// Donation Form
// ========================================
console.log("SCRIPT.JS IS LOADING");

const donationForm = document.getElementById("donationForm");

if (donationForm) {

    donationForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        // Get form values
        const foodName =
            document.getElementById("foodName").value.trim();

        const category =
            document.getElementById("category").value;

        const quantity =
            document.getElementById("quantity").value.trim();

        const foodCondition =
            document.getElementById("foodCondition").value;

        const preparedDate =
            document.getElementById("preparedDate").value;

        const availableUntil =
            document.getElementById("availableUntil").value;

        const location =
            document.getElementById("location").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const donorName =
            document.getElementById("donorName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();
            const foodImage =
    document.getElementById("foodImage").files[0];
    let foodImageUrl = null;

if (foodImage) {

    const fileName =
        Date.now() + "_" + foodImage.name;

    const { data: uploadData, error: uploadError } =
        await supabaseClient
            .storage
            .from("food-images")
            .upload(fileName, foodImage);

    if (uploadError) {

        console.error("Image Upload Error:", uploadError);

        alert(
            "❌ Food image upload failed.\n\n" +
            uploadError.message
        );

        return;
    }

    const { data: publicUrlData } =
        supabaseClient
            .storage
            .from("food-images")
            .getPublicUrl(fileName);

    foodImageUrl =
        publicUrlData.publicUrl;

}


        // Save donation to Supabase
        const { error } = await supabaseClient
    .from("food_donations")
    .insert([
        {
            food_name: foodName,
            category: category,
            quantity: quantity,
            food_condition: foodCondition,
            prepared_date: preparedDate,
            available_until: availableUntil,
            location: location,
            description: description,
            donor_name: donorName,
            phone: phone,
food_image_url: foodImageUrl
        }
    ]);


        // Check for error
        if (error) {

            console.error("Donation Error:", error);

            alert(
                "❌ Donation could not be saved.\n\n" +
                error.message
            );

            return;
        }


        // Donation successfully saved
        console.log("Donation saved successfully!");console.log("Donation saved successfully!");

        alert(
            "✅ Food donation submitted successfully!"
        );


        // Clear form
        donationForm.reset();

    });

}


/* =========================================
   FIND FOOD
========================================= */

const foodGrid = document.getElementById("foodGrid");
const emptyState = document.getElementById("emptyState");
const searchFood = document.getElementById("searchFood");
const categoryFilter = document.getElementById("categoryFilter");
const foodCount = document.getElementById("foodCount");

let allDonations = [];


async function loadFood() {

    if (!foodGrid) return;

    console.log("Loading food donations...");


    const { data, error } = await supabaseClient
        .from("food_donations")
        .select("*")
        .order("id", { ascending: false });


    console.log("FOOD DONATIONS:", data);
    console.log("FOOD ERROR:", error);


    if (error) {

        console.error("Food loading error:", error);

        foodGrid.innerHTML =
            "<p>❌ Unable to load food donations.</p>";

        return;
    }


    allDonations = data || [];

    displayFood();
}


function displayFood() {

    if (!foodGrid) return;


    const searchValue =
        searchFood
            ? searchFood.value.toLowerCase()
            : "";


    const categoryValue =
        categoryFilter
            ? categoryFilter.value
            : "All";


    const filteredDonations =
        allDonations.filter(function(food) {


            const matchesSearch =
                (food.food_name || "")
                    .toLowerCase()
                    .includes(searchValue) ||

                (food.location || "")
                    .toLowerCase()
                    .includes(searchValue);


            const matchesCategory =
                categoryValue === "All" ||
                food.category === categoryValue;


            return matchesSearch && matchesCategory;

        });


    foodGrid.innerHTML = "";


    if (foodCount) {

        foodCount.textContent =
            filteredDonations.length +
            " donation(s)";

    }


    if (filteredDonations.length === 0) {

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    filteredDonations.forEach(function(food) {


        const card =
            document.createElement("div");


        card.className = "food-card";


        const safeFoodName =
            (food.food_name || "")
                .replace(/'/g, "\\'");


        card.innerHTML = `

            <h3>
                ${food.food_name || "Food"}
            </h3>

            <p>
                <strong>Category:</strong>
                ${food.category || "N/A"}
            </p>

            <p>
                <strong>Quantity:</strong>
                ${food.quantity || "N/A"}
            </p>

            <p>
                <strong>Condition:</strong>
                ${food.food_condition || "N/A"}
            </p>

            <p>
                <strong>Location:</strong>
                ${food.location || "N/A"}
            </p>

            <p>
                <strong>Available Until:</strong>
                ${food.available_until || "N/A"}
            </p>

            <p>
                ${food.description || ""}
            </p>

            <button
                class="request-btn"
                onclick="requestFood(${food.id}, '${safeFoodName}')"
            >
                🤝 Request Food
            </button>

        `;


        foodGrid.appendChild(card);

    });

}


/* Search */

if (searchFood) {

    searchFood.addEventListener(
        "input",
        displayFood
    );

}


/* Category filter */

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        displayFood
    );

}


/* Load food from Supabase */

loadFood();





/* =========================================
   FOOD REQUEST DASHBOARD
========================================= */

const requestsGrid =
    document.getElementById("requestsGrid");

const noRequests =
    document.getElementById("noRequests");

if (requestsGrid && noRequests) {

    async function displayRequests() {

        console.log("Loading requests...");

        /* Get logged-in user */
        const savedUser =
            localStorage.getItem("foodWasteUser");

        const currentUser =
            savedUser
                ? JSON.parse(savedUser).name
                : null;

        console.log("CURRENT USER:", currentUser);

        /* Load requests */
        const {
            data: requests,
            error
        } = await supabaseClient
            .from("food_requests")
            .select("*")
            .order("id", {
                ascending: false
            });

        console.log("REQUESTS:", requests);
        console.log("REQUEST ERROR:", error);

        /* Error */
        if (error) {

            console.error(
                "Request loading error:",
                error
            );

            requestsGrid.innerHTML = "";

            noRequests.style.display =
                "block";

            noRequests.querySelector("h3")
                .textContent =
                "Error loading requests";

            return;
        }

        requestsGrid.innerHTML = "";

        /* No requests */
        if (
            !requests ||
            requests.length === 0
        ) {

            noRequests.style.display =
                "block";

            return;
        }

        /*
        Show requests where the logged-in
        user is donor OR requester.
        */

        const myRequests =
            requests.filter(function(request) {

                return (
                    request.donor_name ===
                        currentUser ||

                    request.requester_name ===
                        currentUser
                );
            });

        console.log(
            "MY REQUESTS:",
            myRequests
        );

        /* No requests for this user */
        if (myRequests.length === 0) {

            noRequests.style.display =
                "block";

            noRequests.querySelector("h3")
                .textContent =
                "No requests for you";

            return;
        }

        noRequests.style.display =
            "none";

        /* Display requests */
        myRequests.forEach(function(request) {

            const card =
                document.createElement("div");

            card.className =
                "request-card";

            const status =
                request.status ||
                "Pending";

            /* Status icon */
            let statusIcon = "🟡";

            if (
                status === "Accepted"
            ) {
                statusIcon = "🟢";
            }

            if (
                status === "Rejected"
            ) {
                statusIcon = "🔴";
            }

            /* Check if current user is donor */
            const isDonor =
                request.donor_name ===
                currentUser;

            let actionButtons = "";

            /*
            Only donor gets Accept/Reject.
            Buttons disappear after decision.
            */

            if (
                isDonor &&
                status === "Pending"
            ) {

                actionButtons = `
                    <div class="request-actions">

                        <button
                            class="accept-btn"
                            data-id="${request.id}"
                        >
                            ✅ Accept
                        </button>

                        <button
                            class="reject-btn"
                            data-id="${request.id}"
                        >
                            ❌ Reject
                        </button>

                    </div>
                `;
            }

            /* Card */
            card.innerHTML = `

                <div class="request-icon">
                    🤝
                </div>

                <div class="request-details">

                    <span class="request-status">
                        ${statusIcon}
                        ${status}
                    </span>

                    <h3>
                        ${request.food_name || "Food"}
                    </h3>

                    <p>
                        👤
                        <strong>Requester:</strong>
                        ${request.requester_name || "Unknown"}
                    </p>

                    <p>
                        📞
                        <strong>Phone:</strong>
                        ${request.requester_phone || "Not provided"}
                    </p>

                    <p>
                        🏠
                        <strong>Donor:</strong>
                        ${request.donor_name || "Unknown"}
                    </p>

                    <p>
                        🆔
                        <strong>Request ID:</strong>
                        ${request.id}
                    </p>

                    ${actionButtons}

                </div>
            `;

            requestsGrid.appendChild(card);

            /* =====================================
               ACCEPT BUTTON
            ===================================== */

            const acceptButton =
                card.querySelector(
                    ".accept-btn"
                );

            if (acceptButton) {

                acceptButton.addEventListener(
                    "click",
                    async function() {

                        const requestId =
                            this.dataset.id;

                        const { error } =
                            await supabaseClient
                                .from(
                                    "food_requests"
                                )
                                .update({
                                    status:
                                        "Accepted"
                                })
                                .eq(
                                    "id",
                                    requestId
                                );

                        if (error) {

                            console.error(
                                "Accept error:",
                                error
                            );

                            alert(
                                "❌ Accept failed.\n\n" +
                                error.message
                            );

                            return;
                        }

                        alert(
                            "✅ Request Accepted!"
                        );

                        /* Reload request list */
                        displayRequests();
                    }
                );
            }

            /* =====================================
               REJECT BUTTON
            ===================================== */

            const rejectButton =
                card.querySelector(
                    ".reject-btn"
                );

            if (rejectButton) {

                rejectButton.addEventListener(
                    "click",
                    async function() {

                        const requestId =
                            this.dataset.id;

                        const { error } =
                            await supabaseClient
                                .from(
                                    "food_requests"
                                )
                                .update({
                                    status:
                                        "Rejected"
                                })
                                .eq(
                                    "id",
                                    requestId
                                );

                        if (error) {

                            console.error(
                                "Reject error:",
                                error
                            );

                            alert(
                                "❌ Reject failed.\n\n" +
                                error.message
                            );

                            return;
                        }

                        alert(
                            "❌ Request Rejected!"
                        );

                        /* Reload request list */
                        displayRequests();
                    }
                );
            }

        });
    }

    /* Start dashboard */
    displayRequests();
}
/* =========================================
   REGISTER SYSTEM
========================================= */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {


    registerForm.addEventListener(
        "submit",
        function(event) {


            event.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            if (
                password !==
                confirmPassword
            ) {


                message.textContent =
                    "❌ Passwords do not match.";


                message.style.color =
                    "#d9534f";


                return;
            }


            const user = {

                name: name,
                email: email,
                password: password

            };


            localStorage.setItem(
                "foodWasteUser",
                JSON.stringify(user)
            );


            message.textContent =
                "✅ Account created successfully!";


            message.style.color =
                "#2f8f5b";


            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                1200
            );

        }
    );

}



/* =========================================
   LOGOUT SYSTEM
========================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {


    logoutBtn.addEventListener(
        "click",
        function(event) {


            event.preventDefault();


            localStorage.removeItem(
                "loggedIn"
            );


            alert(
                "✅ You have been logged out."
            );


            window.location.href =
                "login.html";

        }
    );

}


/* =========================================
   SUPABASE LOGIN SYSTEM
========================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        message.textContent = "Logging in...";
        message.style.color = "#555";

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                message.textContent = "❌ " + error.message;
                message.style.color = "#d9534f";
                return;
            }

            const userId = data.user.id;

            const { data: profile, error: profileError } = await supabaseClient
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (profileError || !profile) {
                message.textContent = "Login succeeded, but profile could not be loaded.";
                message.style.color = "#d9534f";
                return;
            }

            message.textContent = "✅ Login successful!";
            message.style.color = "#2f8f5b";

            setTimeout(function () {
                if (profile.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 800);

        } catch (err) {
            message.textContent = "❌ Something went wrong. Please try again.";
            message.style.color = "#d9534f";
            console.error(err);
        }
    });
}

/* =========================================
   NAVBAR LOGIN STATUS
========================================= */

const loginBtn =
    document.querySelector(
        ".login-btn"
    );


const registerBtn =
    document.querySelector(
        ".register-btn"
    );


const logoutBtnNav =
    document.getElementById(
        "logoutBtn"
    );


const isLoggedIn =
    localStorage.getItem(
        "loggedIn"
    ) === "true";


if (isLoggedIn) {


    if (loginBtn) {

        loginBtn.style.display =
            "none";

    }


    if (registerBtn) {

        registerBtn.style.display =
            "none";

    }


    if (logoutBtnNav) {

        logoutBtnNav.style.display =
            "inline-block";

    }


} else {


    if (logoutBtnNav) {

        logoutBtnNav.style.display =
            "none";

    }

}



/* =========================================
   PROFILE SYSTEM
========================================= */

const profileName =
    document.getElementById(
        "profileName"
    );


const profileEmail =
    document.getElementById(
        "profileEmail"
    );


const profileLogout =
    document.getElementById(
        "profileLogout"
    );


if (
    profileName &&
    profileEmail
) {


    const savedUser =
        JSON.parse(
            localStorage.getItem(
                "foodWasteUser"
            ) || "null"
        );


    if (savedUser) {


        profileName.value =
            savedUser.name;


        profileEmail.value =
            savedUser.email;


    } else {


        profileName.value =
            "No account found";


        profileEmail.value =
            "Please register first";

    }

}



if (profileLogout) {


    profileLogout.addEventListener(
        "click",
        function() {


            localStorage.removeItem(
                "loggedIn"
            );


            alert(
                "✅ You have been logged out."
            );


            window.location.href =
                "login.html";

        }
    );

}



/* =========================================
   USER DASHBOARD
========================================= */

const dashboardName =
    document.getElementById(
        "dashboardName"
    );


const donationCount =
    document.getElementById(
        "donationCount"
    );


const requestCount =
    document.getElementById(
        "requestCount"
    );


const impactCount =
    document.getElementById(
        "impactCount"
    );


if (
    dashboardName &&
    donationCount &&
    requestCount &&
    impactCount
) {


    const savedUser =
        JSON.parse(
            localStorage.getItem(
                "foodWasteUser"
            ) || "null"
        );


    const donations =
        JSON.parse(
            localStorage.getItem(
                "foodDonations"
            ) || "[]"
        );


    const requests =
        JSON.parse(
            localStorage.getItem(
                "foodRequests"
            ) || "[]"
        );


    /* Show user name */

    if (savedUser) {

        dashboardName.textContent =
            savedUser.name;

    }


    /* Show donation count */

    donationCount.textContent =
        donations.length;


    /* Show request count */

    requestCount.textContent =
        requests.length;


    /* Show meals shared */

    let totalMeals = 0;


    donations.forEach(
        function(donation) {


            const quantity =
                parseInt(
                    donation.quantity
                );


            if (!isNaN(quantity)) {

                totalMeals +=
                    quantity;

            }

        }
    );


    impactCount.textContent =
        totalMeals;

}



/* =========================================
   IMPACT STATISTICS
========================================= */

const impactDonations =
    document.getElementById(
        "impactDonations"
    );


const impactRequests =
    document.getElementById(
        "impactRequests"
    );


const impactMeals =
    document.getElementById(
        "impactMeals"
    );


const impactPeople =
    document.getElementById(
        "impactPeople"
    );


if (
    impactDonations &&
    impactRequests &&
    impactMeals &&
    impactPeople
) {


    const donations =
        JSON.parse(
            localStorage.getItem(
                "foodDonations"
            ) || "[]"
        );


    const requests =
        JSON.parse(
            localStorage.getItem(
                "foodRequests"
            ) || "[]"
        );


    const users =
        JSON.parse(
            localStorage.getItem(
                "foodWasteUser"
            ) || "null"
        );


    let totalMeals = 0;


    donations.forEach(
        function(donation) {


            const quantity =
                parseInt(
                    donation.quantity
                );


            if (!isNaN(quantity)) {

                totalMeals +=
                    quantity;

            }

        }
    );


    impactDonations.textContent =
        donations.length;


    impactRequests.textContent =
        requests.length;


    impactMeals.textContent =
        totalMeals;


    impactPeople.textContent =
        users ? "1" : "0";

}
window.requestFood = async function(donationId, foodName) {

    // Get logged-in user
    const savedUser =
        localStorage.getItem("foodWasteUser");

    if (!savedUser) {
        alert("❌ Please login before requesting food.");
        return;
    }

    const user =
        JSON.parse(savedUser);

    const requesterName =
        user.name;

    const phone =
        prompt("📞 Enter your phone number:");

    if (!phone) return;


    // Get donor information
    const {
        data: donation,
        error: donationError
    } = await supabaseClient
        .from("food_donations")
        .select("donor_name")
        .eq("id", donationId)
        .single();


    if (donationError) {

        console.error(
            "Donor information error:",
            donationError
        );

        alert(
            "❌ Could not find donor information.\n\n" +
            donationError.message
        );

        return;
    }


    // Create request
    const { error } =
        await supabaseClient
            .from("food_requests")
            .insert([
                {
                    donation_id: donationId,
                    food_name: foodName,
                    requester_name: requesterName,
                    requester_phone: phone,
                    donor_name: donation.donor_name,
                    status: "Pending"
                }
            ]);


    
    alert(
        "✅ Food request submitted successfully!\n\n" +
        "Food: " + foodName + "\n" +
        "Requester: " + requesterName + "\n" +
        "Status: Pending"
    );
};

// Mobile navigation menu
document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener("click", function () {
            const isOpen = mainNav.classList.toggle("mobile-menu-open");

            mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
            mobileMenuBtn.setAttribute("aria-expanded", isOpen);
        });
    }
});
