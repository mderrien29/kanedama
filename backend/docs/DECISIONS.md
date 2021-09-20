# Notes for reviewer

First of all, i am glad you are reviewing my work. 
Take a coffee, put some music and let's dive into it !
I hope this is not too long to read, i tried adding some lighter comments to keep you interested. 

## Application Module

So, the application module. 
Nothing much to say here, it's (what i think is) textbook NestJS.
I tried to not modify it too much, so the application could gain some functionalities in the future, so everything happens in the AccountsModule.

/answer -> AppController.answer -> AppService.getAnswer -> ...

Only thing i added is some human readable error messages, which might be useless.

## Accounts Module

I tried to separate the problem into 3 smaller issues.

### ApiService

The first issue is connecting the application to the Api.
We have two routes, accounts and transactions.

Since the API for transaction returns either an Array or a single transaction, I separated them.

I had a typeguard function planned to validate the values returned by the Api using the `class-validator` module. However, i think this could cause performance issues on large payloads. Not sure this was needed also.

I used the config module from nestJS to inject the host into the application using a `.env` file. I'm personaly more familiar with `envalid` but it works.

Also, since i am a bit rusty with rxjs, which is used by the HttpModule from nestJS, i decided to convert the response into a promise asap, which might be a mistake.

### Accounts Service

The second issue is using this Api to retrieve the data we need. But what do we need ? 
We need to calculate the maximum (and minimum) balance of the whole user (all accounts). So, we need to calculate the balance after every transactions. Basically, we need everything !

I decided to move all date utilities to a separate file : `date-utils.ts`. It's not a nestJS file, so there might be a nest-ier way to do this (`DateUtilsService` ?) but it works nicely and keeps things simple.

Since we need to make a lot of calls to the Api quickly, i made use of `Promise.all` to start all request asap and wait for their completion.

To cut a date range into multiple chunks (to deal with the API 365 days limit), i made use of a small (but stable last 7 years) package. Sadly the `years` chunks where just a tad too big for the Api, so i had to do some maths.

Something i did not do (and might have if this was a bigger project) : Making a `UserAccounts` object, which would old the accounts, transactions per account and a few utilities. This would allow to have a single public function like `retrieveUserData`. However, this is a bit useless for the current application IMO, and this would make the `Promise.all` a bit more complex so i did not want to over-engineer this. Also it's not too hard to implement in the future so nothing is lost.

So, currently we retrieve an array of accounts, and an array of transactions (mixed for all accounts).

### Metrics Service

Now that we have the data, let's get some metrics from it. (Note: I hate answer as a variable name, so i use `metrics`)

For performance reasons, we sort the list once, and use the fact the list is sorted to retrieve the last transaction easily. I HATE this. Basically, nothing is currently there to help the future developer modify the application, and he might break things by sending an un-ordered list to some functions which assumes the list is sorted. If we had the `UserAccounts` object, we could have a function which would "cache" the sorting of the list, and make sure each function is using the sorted list. I hesitated a lot to add it at this point.

`calculateAccountAmountOverTime` was quite fun to write. Since we do not know the original amount the user had on the account, we have to calculate the amounts from now and go backward in time.

The rest is trivial once you cut it into small blocks.

## Tests

Everyone favorite part.

### Unit

I love snapshots. Snapshots are cool. Snapshots are so lazy and i love it. Snapshots are easy to update when you make a profound modification on the code. Code rigidity is a code smell, so why would it not be one in the tests ? Maybe i am simply too lazy. Did i tell you how much i love snapshots ?

For the same reason, i do not like testing private methods. They are more "implementation details" in my mind. Also, clean code suggest to create a method for every `if()`, `forEach()`, etc. Testing that fluff just makes the program harder to update.

In this case, the coverage is quite good while only testing public methods, so i think there is no real need to manually test them.

But it seems to be a hot topic on the internet, so please comment your opinion under this video and click the notification bell :).

TDD is not yet natural for me so i did not use it. I think it's not as great as lots of people think it is (did VW cars truly emit less CO2 ?), but if it's a requirement it's something i can do ofc. 

### E2E

Well, i do not like the implementation of the E2E. I'd suggest using docker and docker-compose to create a separate testing environment, and calling the URL directly. Maybe using [Mocknoon](https://mockoon.com) ?

But it really depends on how the build and QA testing is done.

## I hope this was not needed

- Logging (using NestJS logger)
- Api reponse format validation (using typeguards and class-validator)
- More try catch (in the end i would always end with a 500 anyway)

## In case this wasn't good enough

How sad.
If that's not too much to ask, could you please explain to me what was not incorrect or insufisant :(
I'd be quite crossed if i spent that much time into an exercise and could not have at least some feedbacks to improve !
Thank you for your time.

## In case this was good enough

[Happy!](https://www.youtube.com/watch?v=ZbZSe6N_BXs)
