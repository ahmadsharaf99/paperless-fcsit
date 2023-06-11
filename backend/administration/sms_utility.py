from decouple import config
from twilio.rest import Client


def send_sms(body, receiver_number):
    account_sid = config('TWILIO_ACCOUNT_SID')
    auth_token = config('TWILIO_AUTH_TOKEN')
    client = Client(account_sid, auth_token)

    if receiver_number[0] == '0':
        receiver_number = receiver_number[1:]
    if not receiver_number.startswith('+234'):
        receiver_number = '+234' + receiver_number

    print(receiver_number)

    message = client.messages.create(
        body=body,
        from_=config('TWILIO_PHONE'),
        to=receiver_number
    )

    print(message.sid)
