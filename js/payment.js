// create an order
function CreateOrder() {
  const url = "https://api.razorpay.com/v1/orders";
  data = {
    amount: 29900,
    currency: "INR",
    receipt: "finansee_test_payment",
  };

  fetch(url, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    Authorization:
      "Basic cnpwX3Rlc3RfNHVuaVZKYmtUTHZJbHM6eGRGVTczYjB6UUp0dUhNd0Zid21jVUVp",
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log(data));
}
