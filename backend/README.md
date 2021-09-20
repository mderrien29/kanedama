<p align="center"><a href="https://github.com/MansaGroup/kanedama" target="blank"><img src="../.github/assets/logo.png" width="80" alt="Mansa's Logo" /></a></p>
<h1 align="center">Mansa's Kanedama</h1>
<p align="center">Take home test to <b>join us</b> 💜</p>

## Explanations & Choices

Please read : [](./docs/DECISIONS.md)

## Introduction

This project aims to evaluate candidates applying for a position in our
**engineering squad**.

We encountered a scenario similar to this one during our 1st release and
we're curious to see your approach to this problem.

## The Mission

Your mission, should you choose to accept it, is to:

1. Find the **average amount of positive transactions** for the **6 months**
   prior to the _most recent transaction_. To clarify, the formula is:
   `sum of positive transactions / number of positive transactions`.
   Round your result down.
2. Find the **minimum** and **maximum** balance of the _test user_
   whole history (all accounts aggregated!). Round your result down.
3. Check if the user has at least **3 years of transaction history** between
   the oldest and the most recent transaction (all accounts aggregated!)

## Delivery

To achieve your mission, you'll have to deliver:

- A project written in **TypeScript**
- Using the **NestJS** framework
- Exposing a `GET /answer` endpoint returning an `AnswerDto`

We want you to write code that meets the highest industry standard. It must be
**fast**, **robust**, **readable**, and you need to include **tests** as well.

Good luck and above all, have fun!


## The Weapons we provide you

We have set up a pretty straightforward REST API with 3 endpoints:

| Method   | Endpoint                                                            | Description                                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GET**  | /accounts                                                           | Fetch all bank accounts from a _test user_                                                                                                                                                                                                                                          |
| **GET**  | /accounts/:account*id/transactions?from=\_start_date*&to=_end_date_ | Fetch the specified _account_id_ transactions from the _start_date_ to the _end_date_. Date are ISO 8601 UTC, so for example `2018-08-13T03:24:00` It can't return more than **365 days** of transactions. If there are no dates specified, the oldest transaction will be returned |
| **POST** | /answer                                                             | Post your results in the body, the body needs to be of type `AnswerDto`. Every number needs to be rounded to the minimum. JSON content is expected                                                                                                                                  |

**Root endpoint is: https://kata.getmansa.com/**

You can find the _Data Transfer Object_ (DTO) for all request objects, including bodies and responses in the `src/common/dtos` folder.

**Our `POST /answer` endpoint is here to verify your solution. If it's right, you'll get access code and instructions for the next step.**

## Hints

<details>
<summary>Expected answer</summary>

Here's the expected answer:

```json
{
  "6_month_average_income": 407,
  "3_years_activity": true,
  "max_balance": 19540,
  "min_balance": -4285
}
```

Here the corresponding cURL command:

```bash
curl -XPOST https://kata.getmansa.com/answer \
	-H 'Content-Type: application/json' \
	--data-binary @- << EOF
{
	"6_month_average_income": 407,
	"3_years_activity": true,
	"max_balance": 19540,
	"min_balance": -4285
}
EOF
```

</details>
