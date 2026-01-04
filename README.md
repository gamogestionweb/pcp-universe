# PCP Universe - Present Containment Principle

An AI exploration environment based on the **Present Containment Principle (PCP)** - the theory that the current physical state contains ALL information needed to reconstruct any past state or predict any future state.

## The Theory

> "Irreversibility is not ontological but epistemological and energetic. Information is never destroyed, only hidden in correlations. The arrow of time is an accessibility gradient, not a fundamental asymmetry."

This simulation allows an AI agent to explore a universe where:

- **Information is conserved** - never truly lost, only "scrambled" into correlations
- **Time reversal has a cost** - recovering past states requires energy (Landauer limit)
- **Quantum coherence decays** - interactions cause decoherence
- **Hidden correlations exist** - entanglement, temporal memory, interaction-induced links

## Concepts Explored

### Landauer's Principle
The minimum energy cost to erase one bit of information:
```
W ≥ k_B × T × ln(2) ≈ 2.87 × 10⁻²¹ J at 300K
```

### Information Scrambling
When objects interact, information about their past states becomes distributed across correlations - still present, but harder to access.

### Quantum Coherence
Objects maintain coherence (ψ) that decays with interactions. High coherence = easily reversible. Low coherence = information spread across many degrees of freedom.

### Correlations
- **Entanglement**: Objects with identical properties share correlated states
- **Temporal Memory**: All objects "remember" their initial conditions
- **Interaction-Induced**: Created when objects interact nearby

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/pcp-universe.git
cd pcp-universe
npm install
node server.js
```

## Usage

1. Open http://localhost:3001
2. Enter your DeepSeek API key
3. Watch the AI explore the informational universe!

## AI Capabilities

The AI agent has special tools to explore PCP concepts:

| Action | Description |
|--------|-------------|
| `OBSERVE correlations` | See active correlations between objects |
| `OBSERVE entropy` | Measure system entropy |
| `OBSERVE infofield` | Measure local scrambled information |
| `QUERY_PAST objectId time` | Attempt to recover past state (costs energy) |
| `MEASURE_CORRELATION obj1 obj2` | Measure correlation between two objects |

Plus standard physics actions: `MOVE`, `PICKUP`, `DROP`, `PUSH`, `WAIT`

## Visualization

The simulation shows:
- **Coherence auras** - Green glow around objects (brighter = higher coherence)
- **Correlation lines** - Purple dashed lines connecting correlated objects
- **Information budget** - Energy bar above agent for QUERY_PAST operations
- **Entropy indicator** - Real-time system entropy

## Questions to Explore

- How does Landauer cost scale with temporal distance?
- Do correlations decay linearly or exponentially?
- Is there an "informational temperature" of the system?
- Which objects maintain coherence longest, and why?
- Can local reversibility exist while global entropy increases?

## The PCP Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENT STATE                                 │
│                         ║                                        │
│         ┌───────────────╨───────────────┐                       │
│         ▼                               ▼                        │
│    PAST STATES                    FUTURE STATES                  │
│    (recoverable                   (predictable                   │
│     with energy)                   deterministically)            │
│         │                               │                        │
│         └───────────────╥───────────────┘                       │
│                         ║                                        │
│              INFORMATION NEVER LOST                              │
│              (only scrambled into correlations)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Details

- **Server**: Express.js
- **AI**: DeepSeek API (deepseek-chat)
- **Physics**: Custom engine with information tracking
- **Visualization**: HTML5 Canvas

## Files

```
pcp-universe/
├── server.js              # Main server with PCP physics engine
├── public/
│   └── simulation.html    # Frontend visualization
├── package.json
└── README.md
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Configuration / Simulation |
| `POST /set-api-key` | Set DeepSeek API key |
| `GET /state` | Current universe state (includes correlations) |
| `GET /laws` | Discovered laws and PCP insights |
| `GET /thoughts` | AI reasoning log |
| `GET /experiments` | Experiment history |
| `GET /report` | Full PCP exploration report |
| `POST /reset` | Reset universe |

## License

MIT

## Credits

- Theory: Present Containment Principle
- AI: [DeepSeek](https://deepseek.com)
- Framework: Express.js

---

*"The present contains all the information of the past and future. Irreversibility is energetic, not ontological."*
