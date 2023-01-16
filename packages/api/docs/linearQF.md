# Linear Quadratic Funding

## Matching Cap

A grant round can optionally have a cap amount which means a project in the round cannot receive more than the cap amount. If a project does end up recieving more than match cap:

- The match for that project is capped at the cap amount
- The remaining funds are distributed propotionally among the projects who haven't exceeded the matching cap
- After redistribution, we check if the projects who's matching amount was updated have exceeded the matching cap
- If the projects have exceeded the matching cap, we recursively repeat the process

## Round Saturation

A round is saturated when all the funds have been distributed among the projects.
This means as more contributions come in -> when one 1 project's match increases, it would mean other project's matches (1 ore more) decrease.
