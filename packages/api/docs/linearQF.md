# Linear Quadratic Funding

## QF Calculation

```javascript
forEach Project(i)
	forEach ContributionInUSD(j)
		sqrtOfContribution = math.sqrt(ContributionInUSD)
		sumOfSqrtOfContribution += sqrtOfContribution
		sumOfContributions += ContributionInUSD

	matchAmountInUSD(i) = pow(sumOfSqrtOfContribution, 2) - sumOfContributions

sumOfMatchAmountInUSD += matchAmountInUSD(i)

matchPercentOfAProject = matchAmountInUSD/sumOfMatchAmountInUSD
```

## Matching Cap

A grant round can optionally have a cap amount which means a project in the round cannot receive more than the cap amount. If a project does end up recieving more than match cap:

- The match for that project is capped at the cap amount
- The remaining funds are distributed propotionally among the projects who haven't exceeded the matching cap
- After redistribution, we check if the projects who's matching amount was updated have exceeded the matching cap
- If the projects have exceeded the matching cap, we recursively repeat the process

## QF Calculation with Matching Cap

```javascript
matchingCapInUSD = matchingCapPercent*usdValueOfMatchingPot

forEach Project(i)
  if (matchAmountInUSD > matchingCapInUSD)
    AmountOverCap = matchAmountInUSD - matchingCapInUSD
    matchAmountInUSD = matchingCapInUSD
    amountLeftInPoolAfterCapping += AmountOverCap
  else
    totalMatchForProjectWhichHaveNotCapped += matchAmountInUSD

if (amountLeftInPoolAfterCapping > 0) {
  reminderPercent = amountLeftInPoolAfterCapping/totalMatchForProjectWhichHaveNotCapped
  amountLeftInPoolAfterCapping = 0;

  forEach Project(j)
    if (matchAmountInUSD < matchingCapInUSD)
      matchAmountInUSD += matchAmountInUSD*reminderPercent
      if (matchAmountInUSD > matchingCapInUSD) {
        AmountOverCap = matchAmountInUSD - matchingCapInUSD
        matchAmountInUSD = matchingCapInUSD
        amountLeftInPoolAfterCapping += AmountOverCap
      }

  if (amountLeftInPoolAfterCapping > 0) {
    // repeat the process
  }
```

## Round Saturation

A round is saturated when all the funds have been distributed among the projects.
This means as more contributions come in -> when one 1 project's match increases, it would mean other project's matches (1 or more) decrease.

## QF Calculation Example

matchPot: 100

Project A:
Contributions: 1$, 4$, 1$, 9$
sum of quadratically weighed contributions = 1+2+1+3 = 7
sum of contributions = 15
square of the final sum = 49
match amount = square of the final sum - sum of contributions = 49-15 = 34

B:
Contributions: 1$, 1$, 1$, 1$, 1$, 1$, 4$
sum of quadratically weighed contributions = 1+1+1+1+1+1+2 = 8
sum of contributions = 10
square of the final sum = 64
match amount = 64-10 = 54

C:
Contributions: 1$, 9$, 1$, 9$, 1$, 9$, 4$
sum of quadratically weighed contributions = 1,3,1,3,1,3,2 = 14
sum of contributions = 34
square of the final sum = 196
match amount = 196-34 = 162

sum of match amounts = 34+54+162 = 250

Final match percent (without match cap) <br>
A: 34/250 = 0.136 <br>
B: 54/250 = 0.216 <br>
C: 162/250 = 0.648 

Final match amounts for the given match pot <br>
A: 100 * 0.136 = 13.6 <br>
B: 100 * 0.216 = 21.6 <br>
C: 100 \* 0.648 = 64.8 <br>

### if match cap is 0.5

matchingCapInUSD = 0.5\*100 = 50

C:
AmountOverCap = 64.8 - 50 = 14.8
matchAmountInUSD = 50
amountLeftInPoolAfterCapping += AmountOverCap = 14.8

totalMatchForProjectWhichHaveNotCapped = 13.6 + 21.6 = 35.2
reminderPercent = amountLeftInPoolAfterCapping/totalMatchForProjectWhichHaveNotCapped = 14.8/35.2 = 0.421

A:
matchAmountInUSD += matchAmountInUSD * reminderPercent = 13.6 + 13.6 * 0.421 = 19.3

B:
matchAmountInUSD += matchAmountInUSD * reminderPercent = 21.6 + 21.6 * 0.421 = 30.7
