# Where2Walk

Where2Walk plans a walk that starts and ends at one point, usually where the Walker is, sized to how much the Walker wants to walk right now.

## Language

**Walker**:
The person who uses Where2Walk to plan and follow a Route.
_Avoid_: User, runner, hiker

**Origin**:
The point where a Route starts and ends. It starts at the Walker's position, and the Walker can move it before planning.
_Avoid_: Start point, home, current location

**Route**:
A planned path that starts and ends at the Origin.
_Avoid_: Path, track, walk plan

**Loop**:
A Route that goes out on one set of streets and comes back on different streets. Where2Walk tries for a Loop first.
_Avoid_: Circuit, round trip

**Out-and-back**:
A Route that goes to a far point and returns on the same streets. Where2Walk uses it only when it cannot find a Loop near the Target.
_Avoid_: Return trip, there-and-back

**Target**:
How much the Walker wants to walk, given as a time, a distance, or a step count. Where2Walk converts every Target to a distance before it plans a Route.
_Avoid_: Goal, budget, amount

**Pace**:
The Walker's walking speed. Where2Walk uses it to convert a time Target to a distance.
_Avoid_: Speed, tempo

**Stride**:
The length of one of the Walker's steps. Where2Walk uses it to convert a step-count Target to a distance.
_Avoid_: Step length, gait

**Tolerance**:
How far a Route's length may differ from the Target and still count as a match. The Tolerance is ±10%.
_Avoid_: Margin, slack, error

**Candidate**:
A Route inside the Tolerance that Where2Walk offers to the Walker. Each Candidate has its own color.
_Avoid_: Option, alternative, suggestion

**Selected Route**:
The one Candidate the Walker has chosen. The map shows it in that Candidate's color.
_Avoid_: Active route, current route, chosen path

**Closest Route**:
A Route outside the Tolerance. Where2Walk shows it, with its real length, only when it finds no Candidate.
_Avoid_: Best effort, fallback route, near miss

**Walk**:
The Walker following a Selected Route in real time. A Walk ends when the Walker finishes the Route or stops following it.
_Avoid_: Session, trip, navigation

**Progress**:
How far along the Selected Route the Walker is, measured as distance along the Route and not as distance walked. Progress never goes backward.
_Avoid_: Completion, distance walked, odometer

**Finished**:
The state of a Walk when Progress has passed the halfway point and the Walker is back near the Origin.
_Avoid_: Done, complete, arrived
