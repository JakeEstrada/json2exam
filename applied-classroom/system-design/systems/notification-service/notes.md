# Notification service

Read **System Design Interview – An Insider's Guide** Chapter 10 (PDF ~p. 187–204).

## Three channels

1. Mobile push (APNS / FCM)
2. SMS (Twilio-class providers)
3. Email (SendGrid-class providers)

## Shape

Services/events → notification system → queue(s) → workers per channel → third parties → devices.

Collect **device tokens / phone / email** at signup; honor **opt-out**. Soft real-time: fast when possible, delay OK under overload.
