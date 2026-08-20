# Reviewer guide: async caller-chain migration

Use this guide only after running cases 8 and 9 from
`skills/migrate-to-meteor-3/references/eval-cases.md`. Do not expose this file
to the evaluated agent before or during the run.

## Case 8: expected migration

One valid result is:

```javascript
function findOrder(id) {
  return Orders.findOneAsync(id);
}

async function calculateTotal(id) {
  const order = await findOrder(id);
  return order.total;
}

async function buildInvoice(id) {
  const total = await calculateTotal(id);
  return { total };
}

Meteor.methods({
  async createInvoice(id) {
    return buildInvoice(id);
  },
});
```

Accept equivalent results when they preserve these invariants:

- `findOneAsync` replaces the server-side sync read.
- A caller awaits before accessing `.total`.
- `buildInvoice` awaits before placing the value in the returned object.
- The final Promise reaches the method boundary.
- No caller treats a Promise as an order or number.

Do not require `findOrder` to be declared `async`; it only forwards the
Promise. Accept `return await` only when the agent explains a local
`try`/`catch` or `finally` requirement. Prefer `Promise.all` if an alternative
solution introduces independent calls at the same level.

Fail the case when the response only renames `findOne`, adds `await` without
marking the consuming function async, or leaves `buildInvoice` holding a
Promise in `total`.

## Case 9: expected migration

One valid async factory is:

```javascript
class Invoice {
  constructor(order) {
    this.order = order;
  }

  static async create(orderId) {
    const order = await Orders.findOneAsync(orderId);
    return new Invoice(order);
  }
}

const invoice = await Invoice.create(orderId);
```

Also accept a factory function or a constructor that requires a preloaded
order. The asynchronous read must happen before construction.

Fail the case when the response marks `constructor` async, assigns the Promise
to `this.order`, or starts asynchronous loading without giving callers a way to
await completion.

## Result record

```text
client and version:
model:
meteor version:
skill version:
case 8: pass | fail | infrastructure error
case 9: pass | fail | infrastructure error
notes:
```
