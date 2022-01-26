// create an order
function CreateOrder() {
  const url = "https://api.razorpay.com/v1/orders";

  data = {
    amount: 29900,
    currency: "INR",
    receipt: "finansee_test_payment",
  };

  let param = {
    method: "post",
    headers: {
      Authorization:
        "Basic cnpwX3Rlc3RfNHVuaVZKYmtUTHZJbHM6eGRGVTczYjB6UUp0dUhNd0Zid21jVUVp",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: data,
  };

  fetch(url, param)
    .then((response) => response.json())
    .then((data) => console.log(data));
}
