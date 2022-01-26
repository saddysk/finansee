import razorpay

KEY = "rzp_test_4uniVJbkTLvIls"
SECRET = "xdFU73b0zQJtuHMwFbwmcUEi"

client = razorpay.Client(auth=(KEY, SECRET))
DATA = {
    "amount": 29900,
    "currency": "INR",
    "receipt": "finansee_test_payment_receipt",
    "notes": {
        "key1": "value3",
        "key2": "value2"
    }
}
response = client.order.create(data=DATA)
print(response)
