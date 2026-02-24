// Taking Order
document
  .getElementById("save-ingredient")
  .addEventListener("click", async function takeOrder() {
    //Get the input value
    let input = document.getElementById("main-ingredient").value;
    if (!input) return alert("Please enter an ingredient!");

    //Format the string (lowercase and underscores)
    const formattedIngredient = input.toLowerCase().trim().replace(/\s+/g, "_");

    try {
      //Fetch the data
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedIngredient}`,
      );
      const data = await response.json();

      //Handle Null with Recursion
      if (!data.meals) {
        alert(`Chef says: We don't have "${input}" in the kitchen!`);

        const nextTry = prompt(
          "Please enter a different ingredient (e.g., Beef, Pork, or Chicken):",
        );

        if (nextTry) {
          document.getElementById("main-ingredient").value = nextTry;
          return await takeOrder();
        } else {
          return;
        }
      }

      //Success: Pick a random meal
      const randomIndex = Math.floor(Math.random() * data.meals.length);
      const randomMeal = data.meals[randomIndex];

      //Display the meal
      document.getElementById("order-detail").textContent =
        `Chef's Recommendation: ${randomMeal.strMeal}`;

      //The Purpose: storeOrder(randomMeal.strMeal) takes temporary name and "writes it down" into the browser's sessionStorage.
      //displayOrders() then reads from sessionStorage and updates the webpage to show all the orders
      storeOrder(randomMeal.strMeal); // Save to storage
      displayOrders();

      //Clear input for next time
      document.getElementById("main-ingredient").value = "";
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

//Storing Order (Updating Session Storage)
function storeOrder(orderDetail) {
  // Store the collection of orders as a single value in a JSON array.
  let orders = JSON.parse(sessionStorage.getItem("orders")) || [];

  // The last order number should be stored as a separate value.
  let nextOrderNum = parseInt(sessionStorage.getItem("lastOrderNum")) || 1;

  const newOrder = {
    orderNumber: nextOrderNum,
    description: orderDetail,
    status: "incomplete",
  };

  orders.push(newOrder);

  //Save back to storage
  sessionStorage.setItem("orders", JSON.stringify(orders));
  sessionStorage.setItem("lastOrderNum", (nextOrderNum + 1).toString());

  return nextOrderNum;
}

//Displaying Orders
function displayOrders() {
  const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  const orderList = document.getElementById("incomplete-order-list");

  //Clear the current list to avoid duplicates
  if (orderList) {
    orderList.innerHTML = "";

    const incompleteOrders = orders.filter(
      (order) => order.status === "incomplete",
    );

    incompleteOrders.forEach((order) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>Incomplete Order #${order.orderNumber}:</strong> ${order.description}`;
      orderList.appendChild(li);
    });
  }
}

//Run display on page load to show existing orders
displayOrders();

//Confirming Orders
document
  .getElementById("confirm-order-button")
  .addEventListener("click", function confirmOrder() {
    const orderIdInput = document.getElementById("confirm-order-id");
    const orderId = parseInt(orderIdInput.value);

    if (isNaN(orderId)) {
      return alert("Please enter a valid order ID!");
    }

    // I need to put 0 here before we go to the next step to check the orderId
    if (orderId === 0) {
      return alert("No order confirmed");
    }

    const orders = JSON.parse(sessionStorage.getItem("orders")) || [];
    const orderIndex = orders.findIndex(
      (order) => order.orderNumber === orderId,
    );

    // -1 means not found
    if (orderIndex === -1) {
      return alert(`Order ID ${orderId} not found!`);
    }

    if (orders[orderIndex].status === "complete") {
      return alert(`Order #${orderId} is already confirmed!`);
    }

    // Update order status to "complete"
    orders[orderIndex].status = "complete";
    sessionStorage.setItem("orders", JSON.stringify(orders));
    displayOrders();
    alert(`Order #${orderId} has been confirmed!`);
    orderIdInput.value = "";
  });
