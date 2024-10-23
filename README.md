# nodejs-cinema-tickets-code-test

# Contents

- [Instructions](#instructions)
  - [Objective](#objective)
  - [Business Rules](#business-rules)
    - [Constraints](#constraints)
  - [Assumptions](#assumptions)
  - [Your Task](#your-task)
- [Try it yourself](#try-it-yourself)
  - [Standard test](#standard-test)
  - [Some examples for testing different scenarios](#some-examples-for-testing-different-scenarios)
  - [Express extension to test](#express-extension-to-test)
- [Development Guidelines](#development-guidelines)

## Instructions
### Objective

This is a coding exercise which will allow you to demonstrate how you code and your approach to a given problem.

You will be assessed on:

- Your ability to write clean, well-tested and reusable code.

- How you have ensured the following business rules are correctly met.

### Business Rules

- There are 3 types of tickets i.e. Infant, Child, and Adult.

- The ticket prices are based on the type of ticket (see table below).

- The ticket purchaser declares how many and what type of tickets they want to buy.

- Multiple tickets can be purchased at any given time.

- Only a maximum of 25 tickets that can be purchased at a time.

- Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.

- Child and Infant tickets cannot be purchased without purchasing an Adult ticket.

|   Ticket Type    |     Price   |
| ---------------- | ----------- |
|    INFANT        |    £0       |
|    CHILD         |    £15     |
|    ADULT         |    £25      |

- There is an existing `TicketPaymentService` responsible for taking payments.

- There is an existing `SeatReservationService` responsible for reserving seats.

#### Constraints

- The TicketService interface CANNOT be modified.

- The code in the thirdparty.* packages CANNOT be modified.

- The `TicketTypeRequest` MUST be an immutable object.

### Assumptions

You can assume:

- All accounts with an id greater than zero are valid. They also have sufficient funds to pay for any no of tickets.

- The `TicketPaymentService` implementation is an external provider with no defects. You do not need to worry about how the actual payment happens.

- The payment will always go through once a payment request has been made to the `TicketPaymentService`.

- The `SeatReservationService` implementation is an external provider with no defects. You do not need to worry about how the seat reservation algorithm works.

- The seat will always be reserved once a reservation request has been made to the `SeatReservationService`.

### Your Task

Provide a working implementation of a `TicketService` that:

- Considers the above objective, business rules, constraints & assumptions.

- Calculates the correct amount for the requested tickets and makes a payment request to the `TicketPaymentService`.

- Calculates the correct no of seats to reserve and makes a seat reservation request to the `SeatReservationService`.

- Rejects any invalid ticket purchase requests. It is up to you to identify what should be deemed as an invalid purchase request.”

## Try it yourself

### Standard test

The application is importable so you can test it using node REPL.

```js
const { application } = await import("./application.js");
```

### Some examples for testing different scenarios

```js
// Account 1, 5 adults, 4 children, 5 infants
application({
  accountId: 1,
  ticketTypeRequestArray: [
    {
      type: "ADULT",
      noOfTickets: 5,
    },
    {
      type: "CHILD",
      noOfTickets: 4,
    },
    {
      type: "INFANT",
      noOfTickets: 5,
    },
  ],
});

// Account 2, 1 adult, 0 children, 5 infants
application({
  accountId: 2,
  ticketTypeRequestArray: [
    {
      type: "ADULT",
      noOfTickets: 1,
    },
    {
      type: "CHILD",
      noOfTickets: 0,
    },
    {
      type: "INFANT",
      noOfTickets: 5,
    },
  ],
});

// Account 3, 0 adults, 4 children, 0 infants
application({
  accountId: 3,
  ticketTypeRequestArray: [
    {
      type: "ADULT",
      noOfTickets: 0,
    },
    {
      type: "CHILD",
      noOfTickets: 4,
    },
    {
      type: "INFANT",
      noOfTickets: 0,
    },
  ],
});
```

### Express extension to test

You can bring up the application using

```zsh
npm run express.dev
```

or

```zsh
docker compose up --build
```

and then make a POST API call to it via Insomnia via this URL [http://localhost:8080/tickets/request](http://localhost:8080/tickets/request)

```json
{
	"accountId": 123456,
	"ticketTypes": [
		{
			"type": "ADULT",
			"noOfTickets": 5
		},
		{
			"type": "CHILD",
			"noOfTickets": 4
		},
		{
			"type": "INFANT",
			"noOfTickets": 3
		}
	]
}
```

You can also view the API spec through the application here [http://localhost:8080/swagger](http://localhost:8080/swagger)

## Development Guidelines

This project uses [Pre-commit](https://pre-commit.com/).

Enable pre-commit on this project by running:

```bash
pre-commit install --install-hooks
```
