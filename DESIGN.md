# Design

## Collections

User

- name
- email
- password
- role

Product

- name
- sku

Store

- name
- location

Stock

- product
- store
- quantity

---

## Never Negative Stock

Stock adjustment uses:

```javascript
findOneAndUpdate(
  {
    quantity: { $gte: amount }
  },
  {
    $inc: { quantity: -amount }
  }
)
```

This guarantees that the quantity never becomes negative, even under concurrent requests.

---

## Atomic Transfer

Transfers use MongoDB Transactions.

Transaction Flow:

Source Store

|

Decrease Stock

|

Increase Destination Stock

|


Commit

If any operation fails:

Rollback

This guarantees consistency.